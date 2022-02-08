const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;

// Get available screens
async function getVideoSources() {
	// ! Start preload api before starting node work in 'index.js'.
	// ! If it were not started, won't work properly.
	window.videoApi.send("SET_SOURCE", "Video initiated!");

	// ! Start preload api before starting node work in 'index.js'.
	// ! If it were not started, won't work properly.
	window.videoApi.receive("CALL_SOURCE");

	window.videoApi.receive("CALL_TEXT");
}

// Record and save a video file
const startBtn = document.getElementById("startBtn");
startBtn.onclick = (e) => {
	window.videoApi.recordStart();
	startBtn.classList.add("is-danger");
	startBtn.innerText = "Recording";
};

const stopBtn = document.getElementById("stopBtn");

stopBtn.onclick = (e) => {
	window.videoApi.recordStop();
	startBtn.classList.remove("is-danger");
	startBtn.innerText = "Start";
};
