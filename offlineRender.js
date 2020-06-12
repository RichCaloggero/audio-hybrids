import * as app from "./app.js";
import * as audio from "./audio.js";

export function load (url) {
app.statusMessage("Loading...");
fetch(url)
.then(response=> {
if (response.ok) return response.arrayBuffer();
else throw new Error(response.statusText);
 }).then(data => {
const audioContext = new AudioContext();
return audioContext.decodeAudioData(data)
}).then(buffer => {
render(buffer);
app.statusMessage(`${round(buffer.duration/60)} minutes of audio loaded.`);
}).catch(error => app.statusMessage(error));
} // load

function render (buffer) {
audio.pushContext (new OfflineAudioContext(2, buffer.length, 44100));

const html = app.root.outerHTML;
let container = document.createElement("div");
container.setAttribute("hidden", "");
container.innerHTML = html;
app.root.parentElement.appendChild(container);
const offlineRoot = container.children[0];
//const statusMessage = (text) => this.shadowRoot.querySelector("#statusMessage").textContent = text;


offlineRoot.addEventListener("complete", () => {
const audioSource = audio.context.createBufferSource();
audioSource.buffer = buffer;

// hack in the new source
const player = offlineRoot.querySelector("audio-player");
audioSource.connect(player.output);

copyAllValues(app.root, offlineRoot);

audioSource.start();
app.statusMessage("Rendering audio, please wait...");

// audio.context refers to the offline context now
audio.context.startRendering()
.then(buffer => {
const audioElement = offlineRoot.querySelector("#audioRender-results");
audioElement.src = URL.createObjectURL(bufferToWave(buffer, buffer.length));
audioElement.focus();

// restoring...
audio.popContext();
audioSource.disconnect(player.output);
app.root.parentElement.removeChild(container);
container.innerHTML = "";
container = null;

app.statusMessage(`Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
}).catch(error => app.statusMessage(`render: ${error}\n${error.stack}\n`));
}); // newContext ready
} // render

function copyAllValues (_from, _to) {
//try {
_from = findAllControls(_from);
_to = findAllControls(_to);

const values = _from.map(x => {
return x.hasAttribute("aria-pressed")? (x.getAttribute("aria-pressed") === "true") : x.value
});

_to.forEach((x,i) => {
if (x instanceof HTMLButtonElement && x.hasAttribute("aria-pressed")) {
x.setAttribute("aria-pressed", Boolean(values[i])? "true" : "false");
//console.debug("- toggle button: ", x);
x.dispatchEvent(new Event("click"));
} else {
x.value = values[i];
x.dispatchEvent(new Event("change"));
} // if
});
} // copyAllValues

function findAllControls(root) {
const renderAudioButton = app.root.shadowRoot.querySelector("#renderAudio-controls")
.querySelector("button");
return enumerateAll(root).filter(x => 
x && x.matches && x.matches("input,select, [aria-pressed]") && x !== renderAudioButton
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

