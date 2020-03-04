import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as context from "./context.js";
import * as ui from "./ui.js";


const Gain = context.createAudioProcessor({
id: "gain",
creator: "createGain",

gain: {
	get: (host, value) => host.node.gain.value,
set: (host, value) => host.node.gain.value = Number(value),
	connect: context.connect
}, // gain property

render: ({ mix, bypass, label, gain, defaults }) => html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix)}
${ui.number("gain", "gain", gain, defaults.gain.min, defaults.gain.max, 0.1)}
</fieldset>
` // render
});

define("audio-gain", Gain);

