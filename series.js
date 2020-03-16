import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = Object.assign(element.commonDefaults(), {
gain: {default: 0, min: -0.98, max: 0.98, step: 0.02},
delay: {default: 0, min: 0.00001, max: 1, step: 0.00001},
}); // sefaults


const audioSeries = element.create("series", connect, element.connect, {
_delay: null,
_gain: null,


delay: {
get: (host, value) => host._delay && host._delay.delayTime.value,
set: (host, value) => {if (host._delay) host._delay.delayTime.value = Number(value)},
connect: element.connect,
}, // delay

gain: {
get: (host, value) => host._gain && host._gain.gain.value,
set: (host, value) => {if (host._gain) host._gain.gain.value = Number(value)},
connect: element.connect
}, // gain

feedback: false,
feedforward: false,


render: ({ label, mix, bypass, feedback, feedforward, delay, gain }) => {
return html`
<fieldset class="series">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
<div id="feedback-panel">
${feedback && ui.number("delay", "delay", delay, defaults.delay.min, defaults.delay.max, defaults.delay.step)}
${feedback && ui.number("gain", "gain", gain, defaults.gain.min, defaults.gain.max, defaults.gain.step)}
</div>
</fieldset>
<slot></slot>
`;
} // render
});


function connect (host, key) {
if (!element.isInitialized(host)) {
audio.initialize(host);

host._delay = audio.context.createDelay();
host._gain = audio.context.createGain();
host.wet.connect(host._delay).connect(host._gain).connect(host.input);
host._gain.gain.value = 0;
host._delay.delayTime.value = 0;

console.log(`${host.id}: initializing...`);
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

}); // waitForChildren

element.initializeHost(host);
} // if

host.getAttribute(key) || defaults[key]?.default || 1;
} // connect

