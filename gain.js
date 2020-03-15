import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as audioProcessor from "./audioProcessor.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const defaults = Object.assign({}, element.commonDefaults(), {
gain: {type: "range", default: 1, min: -10, max: 10}
});

const Gain = Object.assign(element.commonProperties(), element.createDescriptors(["gain"], connect, defaults), {
id: `gain${++instanceCount}`,


render: ({ mix, bypass, label, gain }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.number("gain", "gain", gain, defaults)}
</fieldset>
`; // template
} // render
});

define("audio-gain", Gain);

function connect (host, key) {
if (!host._initialized) {
console.debug (`${host.id}: initializing...`);
audio.initialize(host);
host.node = audio.context.createGain();
host.input.connect(host.node).connect(host.wet);

const info = audioProcessor.getPropertyInfo(host, host.node);
Object.keys(info).forEach(key => defaults[key] = Object.assign({}, info[key], defaults[key]));

element.signalReady(host);
} // if

const value = Number(host.getAttribute(key) || defaults[key]?.default || 1);
console.debug(`${host.id}(${key}): defaulted to ${value}`);
host[key] = value;
} // connect
