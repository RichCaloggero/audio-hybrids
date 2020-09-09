import {bufferToWave} from "./bufferToWave.js";
import * as audio from "./audio.js";
import * as automation from "./automation.js";
import * as player from "./player.js";
import * as app from "./app.js";


let port;
let _document;

export function loadAudio (url) {
app.statusMessage("Loading...");
fetch(url)
.then(response=> {
if (response.ok) return response.arrayBuffer();
else throw new Error(response.statusText);
 }).then(data => {
const audioContext = new AudioContext();
return audioContext.decodeAudioData(data)
}).then(buffer => {
renderAudio(buffer);
app.statusMessage(`${Number(buffer.duration/60).toFixed(2)} minutes of audio loaded.`);
}).catch(error => statusMessage(error));
} // loadAudio


function renderAudio (buffer) {
//console.debug("renderAudio:...");

let container = document.createElement("iframe");
	container.src = `${window.location.href}?render&length=${buffer.length}&rate=${audio.context.sampleRate}`;
document.body.appendChild(container);
//container.setAttribute("hidden", "");

container.addEventListener("load", e => {
//console.debug("iFrame loaded");

container.contentWindow.postMessage(["startAudioRender", ""], location.origin);

window.onmessage = e => {
if (e.origin !== location.origin) return;
const message = e.data[0];
const data = e.data[1];
const source = e.source;
//console.debug(`parent received ${message}: data length = ${data.length}`);

switch (message) {
case "error":
app.statusMessage(data);
break;

case "renderModeReady":
app.statusMessage("Render mode ready.");
copyAllValues(app.root, container.contentDocument.querySelector("audio-app"));
container.contentWindow._transfer = {
sourceAudio: buffer,
automationData: automation.getAutomationData()
}; // _transfer
source.postMessage(["scheduleAutomation", ""]);
break;

case "scheduleAutomationComplete":
app.statusMessage("Automation scheduled.");
source.postMessage(["renderAudio", ""]);
break;

case "renderComplete":
//console.debug(`render: Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
app.statusMessage(`Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
const renderResults = app.root.shadowRoot.querySelector("#render-results");
renderResults.src = container.contentWindow._transfer.renderedBlob;
renderResults.focus();
break;

default:
app.statusMessage(`renderAudio: unknown message - ${message}`);
} // switch
}; // parent receiver
}); // iframe loaded
} // renderAudio




export function start (parentDocument) {
window.addEventListener("message", messageHandler, false);
_document = parentDocument;
} // start

function messageHandler (e) {
if (e.origin !== location.origin) return;
const message = e.data[0];
const data = e.data[1];
const source = e.source;
//console.debug(`child received ${message}: data length = ${data.length}`, data);

switch(message) {
case "startAudioRender":
source.postMessage(["renderModeReady", ""]);
break;

case "scheduleAutomation":
scheduleAutomation(window._transfer.automationData, (2 * audio.context.length) / audio.context.sampleRate);
source.postMessage(["scheduleAutomationComplete", ""]);
break;

case "renderAudio":
startRender(window._transfer.sourceAudio, source);
break;

default: console.error(`render: unknown message; ${message}`);
postError(source, `unknown message: ${message}`);
break;
} // switch
} // messageHandler


function scheduleAutomation (_data, duration) {
try {
const data = transformAutomationData(_data);
const automationInterval = automation.automationInterval;
const timeStepCount = duration / automationInterval;
const itemCount = data.length;
//console.debug(`scheduleAutomation: duration = ${duration.toFixed(2)}, itemCount = ${itemCount}, interval = ${automationInterval.toFixed(3)}, timeStepCount = ${Math.floor(timeStepCount)}`);

let count = 0;

data.forEach(item => {
count += 1;
const value = item.function(0);
//showAutomationItem(item, 0);

item.audioParam.setValueAtTime(value, 0);
}); // forEach item
//console.debug(`added ${count} items at t=0`);

for (let t = automationInterval; t < duration; t += automationInterval) {
data.forEach(item => {
count += 1;
const value = item.function(t);

if (count <= 10) showAutomationItem(item, t);

//setAudioParam(item.audioParam, value, t);
item.audioParam.setValueAtTime(value, t);
}); // forEach item
} // for duration
} catch (e) {
console.error(e);
app.statusMessage(e.message);
} // try

//console.debug("scheduleAutomation: complete");
return;

function showAutomationItem (item, t) {
//console.debug(`scheduleAutomation: automationItem: ${item.host._id}.${item.property} = ${item.function(t).toFixed(4)} {${item.text}}`);
} // displayAutomationItem
} // scheduleAutomation

function transformAutomationData (data) {
try {
return data.map(e => {
const host = window.document.getElementById(e.id);

if (!host) throw new Error(`scheduleAutomation: cannot find element with _id = ${e.id}; aborting`);
const node = host.node;
if (!node) throw new Error(`scheduleAutomation: ${e.id} has no associated webaudio node; aborting`);
const property = host._webaudioProp(e.property);
const audioParam = host.node[property];
if (!(audioParam instanceof AudioParam)) throw new Error(`scheduleAutomation: ${e.id}.${e.property} is not an AudioParam instance; aborting...`);

const func = automation.compileFunction(e.text);
if (!func) throw new Error(`scheduleAutomation: cannot compile function; aborting
${e.text}
`); // error

return {host, node, property: e.property, audioParam, function: func, text: e.text};
}); // map

} catch(e) {
console.error(e);
app.statusMessage(e.message);
} // try
} // transformAutomationData


function startRender (buffer, port) {
const source = player.source;
if (!source) throw new Error(`startRender: no source; aborting...`);
source.buffer = buffer;
source.start()

audio.context.startRendering()
.then(buffer => {
//console.debug("render: got results");
window._transfer.renderedBlob = URL.createObjectURL(bufferToWave(buffer, buffer.length));
port.postMessage(["renderComplete", ""]);
}).catch(error => postError(port, error));
} // startRender


function copyAllValues (oldRoot, newRoot) {
//try {
const newControls = findAllControls(newRoot);
if (newControls.length === 0) throw new Error("copyAllValues: no elements found in iFrame");
findAllControls(oldRoot)
.filter(x => x.dataset.name)
.filter(x => x.dataset.name !== "renderAudio")
.filter(x => !findHost(x, oldRoot)?.matches("audio-player"))
.forEach((x, i) => copyValue(x, i, newControls));
//console.debug("copy: values copied");

function copyValue (input, index, output) {
const name = input.dataset.name;
const oldHost = findHost(input);
const newHost = findHost(output[index]);
if (oldHost._id === newHost._id) newHost[name] = oldHost[name];
else throw new Error(`copyValue: cannot find host in iFrame corresponding to ${oldHost._id}; aborting...`);

//console.debug(`copyValue: ${oldHost._id}.${name} => ${newHost._id}.${name} = ${oldHost[name]}`);
} // copyValue

function getValue (x) {
return x.hasAttribute("aria-pressed")? (x.getAttribute("aria-pressed") === "true") : x.value
} // getValue
} // copyAllValues

function findHost (element) {
return element.getRootNode().host ;
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


function getHostById (id, doc = document) {
[...doc.querySelectorAll("*")]
.filter(e => e._id === id)
[0];
} // getHostById

function postError (port, e) {
port.postMessage(["error", e?.message || e]);
} // postError

