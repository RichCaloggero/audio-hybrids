import * as audio from "./audio.js";
import * as ui from "./ui.js";
import * as player from "./player.js";

let port;

export function start () {
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

case "render": renderAudio(data)
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
const automationInterval = ui.automationInterval;
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
const func = ui.compileFunction(e.text);
if (!func) throw new Error(`scheduleAutomation: cannot compile function; aborting
${e.text}
`); // error

return {...e, host, node, property, audioParam, function: func};
}); // map

} catch(e) {
sendErrorMessage(e);
} // try
} // transformAutomationData

function renderAudio (buffer) {
try {
const source = player.source;
if (!source) throw new Error(`renderAudio: no source; aborting...`);
source.buffer = buffer;
source.start();
return audio.context.startRendering(); // promise

} catch (e) {
sendErrorMessage(e);
} // try
} // renderAudio
