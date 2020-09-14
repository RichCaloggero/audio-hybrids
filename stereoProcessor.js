import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as connector from "./connector.js";
import * as app from "./app.js";
import * as ui from "./ui.js";


const defaults = {
rotation: {default: 0, min: -90, max: 90, step: 1},
width: {default: 0, min: 0, max: 200, step: 1},
center: {default: 0, min: -100, max: 100, step: 1},
balance: {default: 0, min: -100, max: 100, step: 1},
};

const StereoProcessor = element.create("stereoProcessor", defaults, initialize, {
rotation: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => _set(host, "rotation", value)
}, // rotation

width: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => _set(host, "width", value)
}, // width

center: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => _set(host, "center", value)
}, // center

balance: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => _set(host, "balance", value)
}, // balance

render: ({ mix, bypass, label, _depth, rotation, width, center, balance }) => {
return html`
<fieldset class="stereoProcessor">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, data: _defaults.mix })}
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
host.processor = new AudioWorkletNode(audio.context, "stereo-processor");
console.log(`${host._id}: audio worklet created`);
host.input.connect(host.processor).connect(host.wet);
connector.signalReady(host);
}).catch(e => console.error(`${host._id}: ${e}`));
} // initialize

function _set (host, name, value) {
if (host.processor) {
host.processor.port.postMessage([name, value]);
} // if
} // _set
