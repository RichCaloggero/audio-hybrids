import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const defaults = Object.assign(element.commonDefaults(), {
frequency: {default: 500, step: 10},
gain: {type: "range", min: -30, max: 30, step: 1, default: 0},
q: {default: 0, step: .02, min: -20, max: 20, type: "range"},
type: {default: "highpass"}
});

const Filter = Object.assign(
element.commonProperties(),
element.createDescriptors(["type", "frequency", ["q", "Q"], "gain", "detune"], connect), {
id: `filter${++instanceCount}`,


render: ({ bypass, mix, label, type, frequency, q, gain, detune }) => {
	return html`
<fieldset class="filter">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.list("type", "type", type, [
["low pass", "lowpass"],
["high pass", "highpass"],
["band pass", "bandpass"],
"notch",
["all pass", "allpass"],
["low shelf", "lowshelf"],
["high shelf", "highshelf"],
])}
${ui.number("frequency", "frequency", frequency, defaults.frequency.min, defaults.frequency.max, 10)}
${ui.number("q", "q", q, defaults)}
${ui.number("gain", "gain", gain, defaults)}
${ui.number("detune", "detune", detune, defaults)}
</fieldset>
`;
} // render
});

define("audio-filter", Filter);

function connect (host, key) {
if (!host._initialized) {
console.debug (`${host.id}: initializing...`);
audio.initialize(host);
host.node = audio.context.createBiquadFilter();
host.input.connect(host.node).connect(host.wet);

const info = audioProcessor.getPropertyInfo(host, host.node);
Object.keys(info).forEach(key => defaults[key] = Object.assign({}, info[key], defaults[key]));
host._initialized = true;

element.signalReady(host);
} // if

console.debug(`${host.id}(${key}: connecting`);

let value = host.getAttribute(key) || defaults[audioProcessor.alias(host,key)]?.default;
value = Number(value)? Number(value) : value;
console.debug(`${host.id}(${key}): defaulted to ${value}`);
host[key] = value;
//debugger;
} // connect
