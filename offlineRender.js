Export function loadAudio (url) {
statusMessage("Loading...");
fetch(url)
.then(response=> {
if (response.ok) return response.arrayBuffer();
else throw new Error(response.statusText);
 }).then(data => {
const audioContext = new AudioContext();
return audioContext.decodeAudioData(data)
}).then(buffer => {
render(buffer);
statusMessage(`${round(buffer.duration/60)} minutes of audio loaded.`);
}).catch(error => statusMessage(error));
} // loadAudio

function render (buffer) {
audio.pushContext (new OfflineAudioContext(2, buffer.length, 44100));
const _audioPlayer = audioPlayer;
const recorder = this.shadowRoot.querySelector(".recorder");
const audioElement = recorder.querySelector("audio");
const automationEnabled = this.enableAutomation;

const html = app.root.outerHTML;
let container = document.createElement("div");
container.setAttribute("hidden", "");
container.innerHTML = html;
app.root.parentElement.appendChild(container);
const newContext = container.children[0];
const statusMessage = (text) => this.shadowRoot.querySelector("#statusMessage").textContent = text;


newContext.addEventListener("complete", () => {
const audioSource = audio.context.createBufferSource();
audioSource.buffer = buffer;

// hack in the new source
const player = app.root.querySelector("audio-player");
audioSource.connect(player.output);

copyAllValues(app.root, newContext);

audioSource.start();
statusMessage("Rendering audio, please wait...");

audio.context.startRendering()
.then(buffer => {
recorder.removeAttribute("hidden");
audioElement.src = URL.createObjectURL(bufferToWave(buffer, buffer.length));
audioElement.focus();

// restoring...
audio.popContext();
audioSource.disconnect(player.output);
app.root.parentElement.removeChild(container);
container.innerHTML = "";
container = null;

statusMessage(`Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
}).catch(error => statusMessage(`render: ${error}\n${error.stack}\n`));
}); // newContext ready
} // render

function copyAllValues (_from, _to) {
//try {
_from = findAllControls(_from);
_to = findAllControls(_to);

const values = _from.map(x => {
return x.type && x.type === "checkbox"? x.checked : x.value
});

_to.forEach((x,i) => {
if (x instanceof HTMLInputElement && x.type=== "checkbox") {
x.checked = Boolean(values[i]);
//console.debug("- checkbox: ", x);
x.dispatchEvent(new Event("click"));
} else {
x.value = values[i];
x.dispatchEvent(new Event("change"));
} // if
});
} // copyAllValues

function findAllControls(root) {
const enableRecordMode = document.querySelector("audio-context")
.shadowRoot.querySelector(".enable-record-mode")
.shadowRoot.querySelector("input");
return enumerateAll(root).filter(x => 
x && x.matches && x.matches("input,select") && x !== enableRecordMode
); // filter
} // findAllControls


function enumerateAll (root) {
return [
root,
Array.from(root.children).map(x => enumerateAll(x)),
root.shadowRoot? enumerateAll(root.shadowRoot) : []
].flat(Infinity);
} // enumerateAll

function enumerateNonUi (root) {
return enumerateAll(root)
.filter(x => x instanceof module);
} // enumerateNonUi

