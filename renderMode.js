import * as audio from "./audio.js";
import * as automation from "./automation.js";
import * as player from "./player.js";

let port;


export function loadAudio (url) {
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

let container = document.createElement("iframe");
	container.src = `${window.location.href}?render&length=${buffer.length}&rate=${audio.context.sampleRate}`;
document.body.appendChild(container);
//container.setAttribute("hidden", "");

const channel = new MessageChannel();
const parentPort = channel.port1;
const childPort = channel.port2;
container.addEventListener("loaded", e => {
console.debug("iFrame loaded");
container.contentWindow.postMessage("startAudioRender", "*", [childPort]);
console.debug("sent init message to iFrame");

parentPort.onmessage = e => {
const message = e.data[0];
const data = e.data[1];
console.debug(`parent received ${message}: data length = ${data.length}`);

switch (message) {
case "error":
app.statusMessage(data);
break;

case "audioRenderReady":
const elementMap = copyAllValues(root, container.contentDocument.querySelector("audio-app"));
childPort.postMessage(["scheduleAutomation", automation.getAutomationData()]);
break;

case "scheduleAutomationComplete":
childPort.postMessage(["renderAudio", buffer]);
break;

case "renderComplete":
renderResults.src = URL.createObjectURL(bufferToWave(buffer, buffer.length));
renderResults.focus();
console.debug("render: got results");
console.debug(`render: Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
statusMessage(`Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
break;

default:
statusMessage(`renderAudio: unknown message - ${message}`);
} // switch
}; // onmessage handler
}); // html loaded
} // renderAudio




function start () {
window.addEventListener("message", initPort);
} // start

function initPort(e) {
port = e.ports[0];
  port.onmessage = messageHandler;
port.postMessage(["renderModeReady", ""]);
} // initPort

function sendErrorMessage (e) {
port.postMessage(["error", e]);
} // sendErrorMessage

function messageHandler (e) {
const message = e.data[0];
const data = e.data[1];
console.debug(`child received ${message}: data length = ${data.length}`);

switch(message) {
case "scheduleAutomation": scheduleAutomation(data, (2 * audio.context.length) / audio.context.sampleRate);
port.sendMessage(["scheduleAutomationComplete", ""]);
break;

case "render": startRender(data)
.then(buffer => port.postMessage(["renderComplete", buffer]))
.catch(error => sendErrorMessage(error));
break;

default: console.error(`render: unknown message; ${message}`);
break;
} // switch
} // messageHandler


function scheduleAutomation (_data, duration) {
if (!audio.isRenderMode) return;
const data = transformAutomationData(_data);
const automationInterval = automation.automationInterval;
const timeStepCount = duration / automationInterval;
const itemCount = automationQueue.size;
console.debug(`scheduleAutomation: duration = ${duration.toFixed(2)}, itemCount = ${itemCount}, interval = ${automationInterval.toFixed(3)}, timeStepCount = ${Math.floor(timeStepCount)}`);

let count = 0;

try {
data.forEach(item => {
count += 1;
const value = item.function(0);
//showAutomationItem(item, 0);

item.audioParam.setValueAtTime(value, 0);
}); // forEach item
console.debug(`added ${count} items at t=0`);

for (let t = automationInterval; t < duration; t += automationInterval) {
items.forEach(item => {
count += 1;
const value = item.function(t);

if (count <= 10) showAutomationItem(item, t);

//setAudioParam(item.audioParam, value, t);
item.audioParam.setValueAtTime(value, t);
}); // forEach item
} // for duration
} catch (e) {
console.error(e);
sendErrorMessage(e);
} // try

console.debug("scheduleAutomation: complete");
//debugger;
return count;

function showAutomationItem (item, t) {
console.debug(`scheduleAutomation: automationItem: ${item.host._id}.${item.property} = ${item.function(t).toFixed(4)} {${item.text}}`);
} // displayAutomationItem
} // scheduleAutomation

function transformAutomationData (data) {
try {
return data.map(e => {
const host = document.querySelector(`[_id=${e.id}]`);
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

return {...e, host, node, property, audioParam, function: func};
}); // map

} catch(e) {
sendErrorMessage(e);
} // try
} // transformAutomationData

function startRender (buffer) {
try {
const source = player.source;
if (!source) throw new Error(`startRender: no source; aborting...`);
source.buffer = buffer;
source.start();
return audio.context.startRendering(); // promise

} catch (e) {
sendErrorMessage(e);
} // try
} // startRender


function copyAllValues (oldRoot, newRoot) {
const elementMap = new Map();
//try {
findAllControls(oldRoot)
.filter(x => x.dataset.name)
//.filter(x => x.dataset.name !== "record")
.filter(x => x.dataset.name !== "renderAudio")
.filter(x => !findHost(x, oldRoot)?.matches("audio-player"))
.forEach(x => copyValue(x));
console.debug("copy: values copied");

function copyValue (input) {
const name = input.dataset.name;
const oldHost = findHost(input, oldRoot);
const newHost = newRoot.querySelector(`[_id=${oldHost._id}]`);
if (!newHost) {
throw new Error(`copyValue: ${oldHost._id} has no corresponding element in ${newRoot._id}`);
} // if

newHost[name] = oldHost[name];
console.debug(`copyValue: ${oldHost._id}.${name} => ${newHost._id}.${name} = ${oldHost[name]}`);
} // copyValue

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


