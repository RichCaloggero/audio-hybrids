 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
gain: {default: 0, min: -0.98, max: 0.98, step: 0.02},
delay: {default: 0, min: 0.00001, max: 1, step: 0.00001},
}; // sefaults


const Series = element.create("series", defaults, initialize, {
_delay: null,
_gain: null,


delay: {
//get: (host, value) => host._delay.delayTime.value,
//set: (host, value) => host._delay.delayTime.value = Number(value),
connect: (host, key) => element.processAttribute(host, key) || defaults[key].default,
//observe: (host, value) => host._delay.delayTime.value = Number(value)
}, // delay

gain: {
connect: (host, key) => element.processAttribute(host, key) || defaults[key].default,
//observe: (host, value) => host._gain.gain.value = Number(value)
}, // gain

feedback: {
connect: (host, key) => host[key] = host.hasAttribute(key) || false,
observe: (host, value) => {
if (value) {
host.wet.connect(host._delay).connect(host._gain).connect(host.input);
console.log(`${host._id}: connecting feedback`);

} else {
 host.wet.disconnect(host.delay);
} // if
} // observe
}, // feedback

feedforward: false,


render: ({ mix, bypass, label, _depth, feedback, feedforward, delay, gain }) => {
return html`
<fieldset class="series">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
<div id="feedback-panel">
${feedback && ui.number("delay", "delay", delay, defaults)}
${feedback && ui.number("gain", "gain", gain, defaults)}
</div>
</fieldset>
<slot></slot>
`;
} // render
});

define ("audio-series", Series);

function initialize (host, key) {
//host.container = true;
host._delay = audio.context.createDelay();
host._gain = audio.context.createGain();
host._gain.gain.value = 0;
host._delay.delayTime.value = 0;

element.waitForChildren(host, children => {
const first = children[0];
const last = children[children.length-1];

if (first !== last) {
children.forEach((child, index) => {
if (index < children.length-1) child.output.connect(children[index+1].input);
}); // forEach
} // if

if (first.input) host.input.connect(first.input);
if (last.output) last.output.connect(host.wet);


if (host.feedback) {
} // if

console.log(`${host._id}: ${children.length} children connected in series`);
}); // waitForChildren
} // initialize

