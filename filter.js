import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as ui from "./ui.js";

let connected = false;

const Filter = {
label: "",
node: null,

type: {
get: (host, value) => host.node.type,
set: (host, value) => host.node.type = value,
connect: connect,
},  // type property

frequency: {
get: (host, value) => host.node.frequency.value,
set: (host, value) => host.node.frequency.value = Number(value),
connect: connect,
},  // frequency property

q: {
get: (host, value) => host.node.Q.value,
set: (host, value) => host.node.Q.value = Number(value),
connect: connect,
},  // q property

gain: {
get: (host, value) => host.node.gain.value,
set: (host, value) => host.node.gain.value = Number(value),
connect: connect,
},  // gain property

detune: {
get: (host, value) => host.node.detune.value,
set: (host, value) => host.node.detune.value = Number(value),
connect: connect,
},  // detune property

render: ({ label, type, frequency, q, gain, detune }) => html`
<fieldset class="filter">
<legend><h2>${label}</h2></legend>
${ui.list("type", "type", [
["low pass", "lowpass"],
["high pass", "highpass"],
["band pass", "bandpass"],
["notch"],
["all pass", "allpass"],
["low shelf", "lowshelf"],
["high shelf", "highshelf"],
])}
<label>frequency: <input type="number" defaultValue="${frequency}" oninput="${html.set('frequency')}" min="20" max="20000" step="10"/></label>
<label>q: <input type="range" defaultValue="${q}" oninput="${html.set('q')}" step="0.1"/></label>
<label>gain: <input type="range" defaultValue="${gain}" oninput="${html.set('gain')}" min="-30" max="30"/></label>
<label>detune: <input type="range" defaultValue="${detune}" oninput="${html.set('detune')}" min="-100" max="100" step="1"/></label>
</fieldset>
` // render
};

define("audio-filter", Filter);

function connect (host, key) {
audio.initialize(host);
if (!host.node) host.node = audio.context.createBiquadFilter();
host.input.connect(host.node).connect(host.wet);

host[key] = host.getAttribute(key);
connectFilter(host);
} // connect

function connectFilter (host) {
if (connected) return;
connected = true;
const audioElement = document.querySelector("audio");
const source = audio.context.createMediaElementSource(audioElement);
try {
source.connect(host.input);
host.output.connect(audio.context.destination);
} catch (e) {
console.debug(e);
} // try
} // connectFilter
