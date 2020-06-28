import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as audio from "./audio.js";
import * as ui from "./ui.js";
import * as keymap from "./keymap.js";
import * as recorder from "./recorder.js";
//import * as offlineRender from "./offlineRender.js";

export let root = null;
export let root0 = null;
let _prompt = "";
let _response = "";
let _responseCallback = null;
let _dialog = {open: false};


const defaults = {};

const App = element.create("app", defaults, initialize, {
message: "",
statusMessage: () => statusMessage,

_focusPrompt: {
connect: (host, key) => host[key] = false,
observe: (host, value) => value && setTimeout(() => host.shadowRoot.querySelector("#prompt").focus(), 0)
}, // _focusPrompt

_focusDialog: {
connect: (host, key) => host[key] = false,
observe: (host, value) => value && setTimeout(() => host.shadowRoot.querySelector("#dialog .close").focus(), 0),
}, // _focusDialog


record: {
connect: (host, key) => host.key = false,
observe: (host, value) => {
if (isRenderMode()) return;
if (value) recorder.start();
else statusMessage("Recording disabled.");
} // observe
}, // record

renderAudio: {
connect: (host, key) => host.key = false,
observe: (host, value) => {
if (isRenderMode()) return;
const url = root.querySelector("audio-player").audioElement.src;
if (value) loadAudio(url);
else statusMessage("Done.");
} // observe
}, // renderAudio

hideOnBypass: {
connect: (host, key) => host[key] = true,
observe: (host) => host.querySelectorAll("*").forEach(host => element.hideOnBypass(host))
}, // hideOnBypass

enableAutomation: {
connect: (host, key) => host[key] = element.processAttribute(host, key, "enable-automation") || false,
observe: (host, value) => {
if (isRenderMode()) return;
value? ui.enableAutomation() : ui.disableAutomation();
} // observe
}, // enableAutomation

automationInterval: {
connect: (host, key) => host[key] = Number(element.processAttribute(host, key, "automation-interval")) || ui.automationInterval,
observe: (host, value) => ui.setAutomationInterval(Number(value))
}, // automationInterval


render: ({ label, message,  _focusPrompt, _focusDialog, record, renderAudio, hideOnBypass, enableAutomation, automationInterval }) => {
//console.debug(`${label}: rendering...`);

return html`
<fieldset class="app">
${ui.legend({ label })}
${ui.boolean({ label: "hide on bypass", name: "hideOnBypass", defaultValue: hideOnBypass })}
${ui.boolean({ label: "enable automation", name: "enableAutomation", defaultValue: enableAutomation })}
${ui.number("automation interval", "automationInterval", automationInterval, 0.01, 0.3, 0.01)}

<div role="region" aria-label="status" aria-live="polite" id="status">
<!--${message}-->
</div>

${_focusPrompt && html`<div class="prompt" role="region" aria-label="prompt">
<label>${_prompt}:
<input type="text" id="prompt" defaultValue="${_response}"  oninput="${(host, event) => _response = event.target.value}"
onclick="${processResponse}" onkeydown="${handleKey}">
</label>
</div>
`}

${_focusDialog && html`<div id="dialog" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" style="position:relative;">
<div class="wrapper" style="position:absolute; left:0; top:0; width:100%; height:100%;">
<div class="head">
<h2 id="dialog-title" style="display:inline-block;">${_dialog.title}</h2>
<button class="close" aria-label="close" onclick="${(host, event) => {host._focusDialog = false; _dialog.returnFocus.focus()}}">X</button>
</div><div class="body">
<div id="dialog-description">${_dialog.description}</div>
<div class="content">${_dialog.content}</div>
</div><!-- .body -->
</div><!-- .wrapper -->
</div><!-- dialog -->
`}

${ui.boolean({label: "record", name: "record", defaultValue: record})}
${record && html`<div id="record-controls" role="region" aria-label="record">
<audio id="recorder-results" controls></audio>
</div>
`} // record controls

${ui.boolean({label: "Render audio", name: "renderAudio", defaultValue: renderAudio})}
${renderAudio && html`<div id="renderAudio-controls" role="region" aria-label="Render audio">
<audio id="render-results" controls></audio>
</div>
`} // renderAudio controls

</fieldset>
<slot></slot>
`;
} // render
}); // app

define ("audio-app", App);


export function prompt (message, defaultResponse, callback) {
//console.debug(`prompt: ${message}, ${response}`);
if (message && callback && callback instanceof Function) {
_responseCallback = callback;
_prompt = message;
_response = defaultResponse;
root._focusPrompt = true;
} // if
} // prompt

function handleKey (host, event) {
if (event.key === "Enter" || event.key === "Escape") {
keymap.preventDefaultAction(event);
if (event.key === "Escape") _response = false;
processResponse(host);
} // if
} // handleKey

function processResponse (host) {
_responseCallback(_response);
setTimeout(() => host._focusPrompt = false, 0);
} // processResponse

export function displayDialog (dialog) {
_dialog = dialog;
root._focusDialog = true;
} // displayDialog

function initialize(host, key) {
host._load = {};
root = host;
if (!root0) root0 = host;

function loadHandler () {
if (host._load.audioGraphConnected && host._load.uiInitialized) {
host.dispatchEvent(new CustomEvent("load", {bubbles: true}));
console.debug(`${host._id}: load complete`);
} // if
} // loadHandler

//if (!isRenderMode()) {
waitForUi(() => {
ui.initialize()
host._load.uiInitialized = true;
host.dispatchEvent(new CustomEvent("uiInitialized"));
console.debug(`${host._id} ui initialized.`);
loadHandler();
}); // waitForUi
//} // if

element.waitForChildren(host, children => {
// calculate element depth to render correct heading levels in fieldset legends
root.querySelectorAll("*").forEach(host => host._depth = depth(host));

host.dispatchEvent(new CustomEvent("audioGraphConnected"));
host._load.audioGraphConnected = true;
console.debug(`${host._id} graph connected.`);
loadHandler();
}); // wait for children


} // initialize

export function depth (start, _depth = 2) {
let e = start;
//console.debug(`depth: ${e._id} begin at  ${_depth}`);

while (e && e !== root) {
if (element.isContainer(e.parentElement) && e.parentElement.getAttribute("label")) _depth += 1;
//console.debug(`depth: ${e._id}, ${e.parentElement.container}, ${e.parentElement.label} = ${_depth}`);
e = e.parentElement;
} // while

//console.debug(`${start._id}: depth = ${_depth}\ndone.\n`);
return _depth;
} // depth

export function statusMessage (text, append = true) {
const _status = root0.shadowRoot?.querySelector("#status");
if (!_status) {
alert(text);
return;
} // if

const _message = document.createElement("p");
_message.textContent = text;

if (!append) _status.innerHTML = "";
_status.appendChild(_message);
} // statusMessage


/*export function statusMessage (text, append) {
if (isRenderMode()) return;

if (append) {
root.message = `${root.message}<br>${text}`;
} else {
(root || App).message = text;
setTimeout(() => (root || App).message = "", 3000);
} // if
} // statusMessage
*/

function waitForUi (callback) {
// wait for all elements to have a shadowRoot, which means they are completely rendered in the dom
const app = root;
if (!app) {
throw new Error("renderReport: root is null or undefined");
} // if

// measure duration of process
const startTime = audio.context.currentTime;

// find all elements without a shadowRoot
let children = Array.from((app || root).querySelectorAll("*"))
.filter(child => !child.shadowRoot);

if (children.length === 0) {
runCallback(callback);
} else {
app.addEventListener("uiReady", uiReadyHandler);
} // if

function uiReadyHandler (e) {
const rendered = e.target;
children = children.filter(child => child !== rendered);
//console.debug(`uiReadyHandler: ${children.length} children`);
if (children.length === 0) {
runCallback(callback);

const all = Array.from(root.querySelectorAll("*"))
.map(element => [element._id, element.shadowRoot]);
const rendered = all.filter(e => e[1]);
const notRendered = all.filter(e => !e[1]);

console.log(`renderReport:\n
${all.length} elements found;\n
${rendered.length} rendered: ${rendered.map(e => e[0]).join(", ")};\n
${notRendered.length} not rendered: ${notRendered.map(e => e[0]).join(", ")};\n
time: ${(audio.context.currentTime - startTime).toFixed(2)} seconds;\n
End Report.`);
} // if
} // renderHandler


function runCallback (callback) {
if (callback && callback instanceof Function) callback();
} // runCallback
} // waitForUi

export function showRecordingControls () {
root.querySelector("audio-player").play = false;
displayDialog({
title: "Record",
description: "",
content: html`
<button class="start-recording" onclick="() => recorder.start();">Start Recording</button>
<button class="stop-recording" onclick="() => recorder.stop();">Stop Recording</button>
<audio class="recorder-results" controls></audio>
`, // html
returnFocus: root.shadowRoot.querySelector(".record")
}); // displayDialog
} // showRecordingControls 

/// render audio


function loadAudio (url) {
statusMessage("Loading...");
fetch(url)
.then(response=> {
if (response.ok) return response.arrayBuffer();
else throw new Error(response.statusText);
 }).then(data => {
const audioContext = new AudioContext();
return audioContext.decodeAudioData(data)
}).then(buffer => {
renderAudio(buffer);
statusMessage(`${Number(buffer.duration/60).toFixed(2)} minutes of audio loaded.`);
}).catch(error => statusMessage(error));
} // loadAudio

function renderAudio (buffer) {
console.debug("renderAudio:...");
const offlineContext = new OfflineAudioContext(2, buffer.length, audio.context.sampleRate);
audio.pushContext(offlineContext);
const _automator = ui.automator;
const _root = root;

const html = root.outerHTML;
let container = document.createElement("div");
//container.setAttribute("hidden", "");
document.body.appendChild(container);
container.innerHTML = html;
console.debug("render: html created; ", _root, root);

/*let container = document.createElement("iframe");
container.src = `${location.pathname}?render=${buffer.length}`;
root.parentElement.appendChild(container);
let offlineRoot = null;
console.debug(`render: iframe.src: ${container.src}`);

container.contentWindow.onload = () => {
offlineRoot = container.contentWindow.document.querySelector("audio-app");
console.debug("render: iFrame loaded");
*/


container.addEventListener("load", e => {
setTimeout(() => {
const elementMap = copyAllValues(_root, root);
console.debug("render: ui values copied");
_root.renderAudioData = {buffer, elementMap};

const player = container.querySelector("audio-player");
player.node.buffer = buffer;
console.debug ("render: source created");

if (root.enableAutomation) {
// need to pass _root so we can map original automation queue items to the new elements created by renderAudio
ui.scheduleAutomation(buffer.duration, elementMap);
console.debug("renderAudio: automation items added");
} // if


statusMessage("Rendering audio, please wait...");

// audio.context refers to the offline context now
player.node.start();
audio.context.startRendering()
.then(buffer => {
console.debug("render: got a buffer; ", buffer);

const renderResults = _root.shadowRoot.querySelector("#render-results");
renderResults.src = URL.createObjectURL(bufferToWave(buffer, buffer.length));
renderResults.focus();
console.debug("render: got results");

// restoring...
player.node.disconnect(player.output);
audio.popContext();
root = _root;
container.remove();
container = null;
console.debug(`render: Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
statusMessage(`Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
}).catch(error => statusMessage(`render: ${error}\n${error.stack}\n`));
}, 1); // timeout
}); // html loaded
//}; // newContext ready
} // renderAudio

function copyAllValues (oldRoot, newRoot) {
const elementMap = new Map();
//try {
findAllControls(oldRoot)
.filter(x => x.dataset.name)
//.filter(x => x.dataset.name !== "record")
.filter(x => x.dataset.name !== "renderAudio")
.filter(x => !findHost(x, oldRoot)?.matches("audio-player"))
.forEach(x => setValue(x));
console.debug("copy: values copied");
return elementMap;

function setValue (x) {
const name = x.dataset.name;
const oldHost = findHost(x, oldRoot);
const newHost = newRoot.parentElement.querySelector(oldHost.tagName.toLowerCase());
if (!newHost) {
throw new Error(`setValue: ${oldHost._id} has no corresponding element in ${newRoot._id}`);
} // if

newHost[name] = oldHost[name];
if (!elementMap.has(oldHost)) elementMap.set(oldHost, newHost);
console.debug(`setValue: ${oldHost._id}.${name} => ${newHost._id}.${name} = ${oldHost[name]}`);
} // setValue

function getValue (x) {
return x.hasAttribute("aria-pressed")? (x.getAttribute("aria-pressed") === "true") : x.value
} // getValue
} // copyAllValues

function findHost (element, root) {
return Array.from(root.querySelectorAll("*"))
.concat(root)
.filter(x => x.shadowRoot.contains(element))
[0];
} // findHost


function findAllControls(root) {
const renderAudioButton = root.shadowRoot.querySelector("#renderAudio-controls")
//.querySelector("button");
return enumerateAll(root).filter(x => 
x && x.matches && x.matches("input,select, [aria-pressed]")
&& x !== renderAudioButton
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



/* https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/ */

export function bufferToWave (abuffer, len) {
var numOfChan = abuffer.numberOfChannels,
length = len * numOfChan * 2 + 44,
buffer = new ArrayBuffer(length),
view = new DataView(buffer),
channels = [], i, sample,
offset = 0,
pos = 0;

// write WAVE header
setUint32(0x46464952);                         // "RIFF"
setUint32(length - 8);                         // file length - 8
setUint32(0x45564157);                         // "WAVE"

setUint32(0x20746d66);                         // "fmt " chunk
setUint32(16);                                 // length = 16
setUint16(1);                                  // PCM (uncompressed)
setUint16(numOfChan);
setUint32(abuffer.sampleRate);
setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
setUint16(numOfChan * 2);                      // block-align
setUint16(16);                                 // 16-bit (hardcoded in this demo)

setUint32(0x61746164);                         // "data" - chunk
setUint32(length - pos - 4);                   // chunk length

// write interleaved data
for(i = 0; i < abuffer.numberOfChannels; i++)
channels.push(abuffer.getChannelData(i));

while(pos < length) {
for(i = 0; i < numOfChan; i++) {             // interleave channels
sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
view.setInt16(pos, sample, true);          // write 16-bit sample
pos += 2;
}
offset++                                     // next source sample
}

// create Blob
return new Blob([buffer], {type: "audio/wav"});

function setUint16(data) {
view.setUint16(pos, data, true);
pos += 2;
}

function setUint32(data) {
view.setUint32(pos, data, true);
pos += 4;
}
} // bufferToWave


export function isRenderMode () {
return audio.context instanceof OfflineAudioContext;
} // isRenderMode

/*export function isRenderMode () {
return !!new URL(location).searchParams.get("render");
} // isRenderMode

export function renderLength () {
return Number(new URL(location).searchParams.get("render"));
} // renderLength
*/
