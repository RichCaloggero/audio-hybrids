import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as context from "./context.js";
import * as ui from "./ui.js";


const Filter = {
id: "filter",
label: "",
node: null,
creator: "createBiquadFilter",
alias: {q: "Q"},

type: {
get: (host, value) => host.node.type,
set: (host, value) => host.node.type = value,
connect: context.connect,
},  // type property

frequency: {
get: (host, value) => host.node.frequency.value,
set: (host, value) => {host.node.frequency.value = Number(value); alert(`set ${value}`);},
connect: context.connect,
},  // frequency property

q: {
get: (host, value) => host.node.Q.value,
set: (host, value) => host.node.Q.value = Number(value),
connect: context.connect,
},  // q property

gain: {
get: (host, value) => host.node.gain.value,
set: (host, value) => host.node.gain.value = Number(value),
connect: context.connect,
},  // gain property

detune: {
get: (host, value) => host.node.detune.value,
set: (host, value) => host.node.detune.value = Number(value),
connect: context.connect,
},  // detune property

render: ({ label, type, frequency, q, gain, detune, defaults }) => html`
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
${ui.number("frequency", "frequency", frequency, defaults.frequency.min, defaults.frequency.max, 10)}
${ui.number("q", "q", q, 0.02, 20, 0.02)}
${ui.number("gain", "gain", gain, -30, 30, 10)}
${ui.number("detune", "detune", detune, -100, 100, 1)}
</fieldset>
` // render
};

define("audio-filter", Filter);


