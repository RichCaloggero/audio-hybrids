 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as connector from "./connector.js";
import * as ui from "./ui.js";


const defaults = {
gain: {default: 0, min: -0.98, max: 0.98, step: 0.02},
delay: {default: 0, min: 0.00001, max: 1, step: 0.00001},
}; // sefaults


const Series = element.create("series", defaults, initialize, {
_delay: null,
_gain: null,


delay: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => {
if (host.feedback && host._delay) host._delay.delayTime.value = Number(value);
} // observe
}, // delay

gain: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => {
if (host.feedback) host._gain.gain.value = Number(value);
} // observe
}, // gain

feedback: {
connect: (host, key) => host[key] = host.hasAttribute(key) || false,
observe: (host, value) => connectFeedback(host)
}, // feedback

feedforward: false,


render: ({ mix, bypass, label, _depth, feedback, feedforward, delay, _delay, gain }) => {
return html`
<fieldset class="series">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
${feedback && html`
<div id="feedback-panel">
${_delay && ui.number("feedback delay", "delay", delay, defaults)}
${ui.number("feedback gain", "gain", gain, defaults)}
</div>
`}
</fieldset>
<slot></slot>
`;
} // render
});

define ("audio-series", Series);

function initialize (host, key) {
host._feedbackDelay = audio.context.createDelay();
host._delay = null;
host._gain = audio.context.createGain();
host._gain.gain.value = 0;


connector.waitForChildren(host, children => {
const first = children[0];
const last = children[children.length-1];

if (first !== last) {
children.forEach((child, index) => {
if (index < children.length-1) child.output.connect(children[index+1].input);
}); // forEach
} // if

if (first.input) host.input.connect(first.input);
if (last.output) last.output.connect(host.wet);

console.log(`${host._id}: ${children.length} children connected in series`);
}); // waitForChildren

//console.debug(`${host._id}.initialized.`);
} // initialize

function connectFeedback (host) {
if (host.feedback) {
/*if (isDelayInForwardPath(host)) {
host.wet.connect(host._gain).connect(host.input);
host._delay = null;
//console.debug(`${host._id}.connectFeedback: delay in forward path`);
} else {
*/
host.wet.connect(host._feedbackDelay).connect(host._gain).connect(host.input);
host._delay = host._feedbackDelay;
//} // if
//console.debug(`${host._id}.connectFeedback: connected feedback`);

} else {
//if (host._delay) {
try { host.wet.disconnect(host._delay); } catch (e) {}
/*} else {
try { host.wet.disconnect(host._gain); } catch (e) {}
} // if
*/
host._delay = null;

//console.debug(`${host._id}.connectFeedback: disconnected feedback`);
} // if
} // connectFeedback

function isDelayInForwardPath (host) {
return Array.from(host.children).find(x => x.matches("audio-delay"));
} // isDelayInForwardPath

