import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as connector from "./connector.js";
import * as audioProcessor from "./audioProcessor.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const Parallel = {
id: `parallel${++instanceCount}`,
node: null,

defaults : () => ({
bypass: {default: false},
mix: {default: 1, min: -1, max: 1, step: 0.1},
}), // sefaults

_connected: property(false, connect),

label: {
connect: (host, key) => host[key] = host.getAttribute(key),
observe: (host, value) => host.shadowRoot.querySelector("fieldset").hidden = value? false : true,
}, // label

mix: {
connect: (host, key) => host[key] = audioProcessor.getDefault(host, key),
}, // mix


render: ({ label, mix, defaults }) => html`
<fieldset class="parallel">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
</fieldset>
<slot></slot>
` // render
};

define("audio-series", Series);

function connect (host, key) {
if (!host._initialized) {

connector.waitForChildren(host, children => {
const first = children[0];
const last = children[children.length-1];

audio.initialize(host);
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
} // connect

