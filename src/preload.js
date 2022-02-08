// In the preload script.
const { contextBridge, ipcRenderer } = require("electron");

// Preview video stream
let mediaRecorder;
const recordedChunks = [];

function handleStream(stream) {
	const video = document.querySelector("video");
	video.srcObject = stream;
	video.onloadedmetadata = (e) => video.play();

	handleRecord(stream);
}

function handleError(e) {
	console.error(e);
}

function handleRecord(stream) {
	// Create the Media Recorder
	const options = {
		mimeType: "video/webm; codecs=vp9",
	};
	mediaRecorder = new MediaRecorder(stream, options);

	// Register Event Handlers
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
}

// Captures all recorded chunks
function handleDataAvailable(e) {
	console.log("video data available");
	recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
	try {
		const blob = new Blob(recordedChunks, {
			type: "video/webm; codecs=vp9",
		});

		const buffer = Buffer.from(await blob.arrayBuffer());

		ipcRenderer.invoke("getFilePath", buffer).then((filePath) => {
			console.log("Saved url: ", filePath);
			alert("video saved successfully!");
		});
	} catch (e) {
		console.error(e);
	}
}

contextBridge.exposeInMainWorld("videoApi", {
	send: (channel, data) => {
		console.log("Accepted data: ", data);
		switch (channel) {
			case "SET_SOURCE":
				ipcRenderer.send(channel, data);
				break;
			case "POST_MESSAGE":
				ipcRenderer.postMessage("port", null, [data]);
				break;
		}
	},
	receive: (channel, data) => {
		switch (channel) {
			case "CALL_SOURCE":
				ipcRenderer.on(channel, async (event, sourceId) => {
					try {
						const stream =
							await navigator.mediaDevices.getUserMedia({
								audio: false,
								video: {
									mandatory: {
										chromeMediaSource: "desktop",
										chromeMediaSourceId: sourceId,
										minWidth: 1280,
										maxWidth: 1400,
										minHeight: 720,
										maxHeight: 900,
									},
								},
							});
						handleStream(stream);
					} catch (e) {
						handleError(e);
					}
				});
				break;
			case "CALL_TEXT":
				ipcRenderer.on(channel, (event, text) => {
					const videoSelectBtn =
						document.getElementById("videoSelectBtn");
					videoSelectBtn.innerText = text;

					return text;
				});
				break;
		}
	},
	recordStart: () => mediaRecorder.start(),
	recordStop: () => mediaRecorder.stop(),
});
