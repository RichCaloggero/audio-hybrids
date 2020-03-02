import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as context from "./context.js";
import * as ui from "./ui.js";


const Gain = {
id: "gain",
label: "",
node: null,
creator: "createGain",
	
gain: {
	get: (host, value) => host.node.gain.value,
set: (host, value) => host.node.gain.value = value,
	connect: context.connect
}, // gain property

render: ({ label, gain }) => html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
${ui.number("gain", "gain", gain)}
</fieldset>
` // render
};

define("audio-gain", Gain);

