import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

let instanceCount = 0;


const Series = element.create(host => initialize(host), {
id: `series${++instanceCount}`,
_delay: null,
_gain: null,

defaults : () => ({
bypass: {default: false},
mix: {default: 1, min: -1, max: 1, step: 0.1},
gain: {default: 0, min: -0.98, max: 0.98, step: 0.02},
delay: {default: 0, min: 0.00001, max: 1, step: 0.00001},
}), // sefaults



delay: {
get: (host, value) => host._delay && host._delay.delayTime.value,
set: (host, value) => {if (host._delay) host._delay.delayTime.value = Number(value)},
connect: (host, key) => host[key] = element.getDefault(host, key),
}, // delay

gain: {
get: (host, value) => host._gain && host._gain.gain.value,
set: (host, value) => {if (host._gain) host._gain.gain.value = Number(value)},
connect: (host, key) => host[key] = element.getDefault(host, key),
}, // gain

feedback: false,
feedforward: false,


render: ({ label, mix, bypass, feedback, feedforward, delay, gain, defaults }) => html`
<fieldset class="series">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
<div id="feedback-panel">
${feedback && ui.number("delay", "delay", delay, defaults.delay.min, defaults.delay.max, defaults.delay.step)}
${feedback && ui.number("gain", "gain", gain, defaults.gain.min, defaults.gain.max, defaults.gain.step)}
</div>
</fieldset>
<slot></slot>
` // render
});

define("audio-series", Series);

function initialize (host, key) {
if (!host._initialized) {

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

host._delay = audio.context.createDelay();
host._gain = audio.context.createGain();
host.wet.connect(host._delay).connect(host._gain).connect(host.input);
host._gain.gain.value = 0;
host._delay.delayTime.value = 0;

}); // waitForChildren

host._initialized = true;
} // if
} // initialize

