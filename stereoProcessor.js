import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as context from "./context.js";
import * as ui from "./ui.js";

console.debug("defining audio-stereo-processor...");

const defaults = {
rotation: {default: 0, min: -90, max: 90, step: 1},
width: {default: 0, min: 0, max: 200, step: 1},
center: {default: 0, min: -100, max: 100, step: 1},
balance: {default: 0, min: -100, max: 100, step: 1},
};

const StereoProcessor = element.create("stereoProcessor", defaults, initialize, element.connect, {
rotation: {
connect: (host, key) => host[key] = element.processAttribute(host, "rotation"),
observe: (host, value) => _set(host, "rotation", value)
}, // rotation

width: {
connect: (host, key) => host[key] = element.processAttribute(host, "width"),
observe: (host, value) => _set(host, "width", value)
}, // width

center: {
connect: (host, key) => host[key] = element.processAttribute(host, "center"),
observe: (host, value) => _set(host, "center", value)
}, // center

balance: {
connect: (host, key) => host[key] = element.processAttribute(host, "balance"),
observe: (host, value) => _set(host, "balance", value)
}, // balance

render: ({ mix, bypass, label, _depth, rotation, width, center, balance }) => {
return html`
<fieldset class="stereoProcessor">
<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.number("rotation", "rotation", rotation, defaults)}
${ui.number("width", "width", width, defaults)}
${ui.number("center", "center", center, defaults)}
${ui.number("balance", "balance", balance, defaults)}
</fieldset>
`; // template
} // render
});

define ("audio-stereo-processor", StereoProcessor);


function initialize (host) {
host.processor = null;

audio.context.audioWorklet.addModule("stereoProcessor.worklet.js")
.then(() => {
console.log(`${host._id}: audio worklet created`);
host.processor = new AudioWorkletNode(audio.context, "stereo-processor");
debugger;
host.input.connect(host.processor).connect(host.wet);
element.signalReady(host);
}).catch(e => context.statusMessage(`${host._id}: ${e}`));
} // initialize

function _set (host, name, value) {
if (host.processor) {
host.processor.port.postMessage([name, value]);
} // if
} // _set
