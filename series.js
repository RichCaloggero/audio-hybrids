 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
gain: {default: 0, min: -0.98, max: 0.98, step: 0.02},
delay: {default: 0, min: 0.00001, max: 1, step: 0.00001},
}; // sefaults


const Series = element.create("series", defaults, initialize, element.connect, {
_delay: null,
_gain: null,


delay: {
get: (host, value) => host._isReady ? host._delay.delayTime.value : 0,
set: (host, value) => host._isReady? host._delay.delayTime.value = value : 0,
connect: (host, key) => host.getAttribute(key) || defaults[key].default,
}, // delay

gain: {
get: (host, value) => host._isReady ? host._gain.gain.value : 0,
set: (host, value) => host._isReady? host._gain.gain.value = value : 0,
connect: (host, key) => host.getAttribute(key) || defaults[key].default,
}, // gain

feedback: false,
feedforward: false,


render: ({ label, mix, bypass, feedback, feedforward, delay, gain }) => {
return html`
<fieldset class="series">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
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
if (!element.isInitialized(host)) {
host._delay = audio.context.createDelay();
host._gain = audio.context.createGain();
host.wet.connect(host._delay).connect(host._gain).connect(host.input);
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
if (host.feedback) host.wet.connect(host._delay).connect(host._gain).connect(host.input);

console.log(`${host._id}: ${children.length} children connected in series`);
}); // waitForChildren

/*} else {
// initialized, so set defaults for key
const value = host.getAttribute(key) || defaults[key]?.default || 1;
host[key] = value;
console.debug(`${host._id}(${key}) connected and defaulted to ${value}`);
*/
} // if
} // initialize

