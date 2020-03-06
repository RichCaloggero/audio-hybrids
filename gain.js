import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const Gain = audioProcessor.create(["gain"], {
id: `gain${++instanceCount}`,
creator: "createGain",
defaults: {
gain: {min: -1, max: 1, default: 1, step: 0.1}
},


render: ({ mix, bypass, label, gain, defaults }) => {
	console.debug("rendering gain...");
	return html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.number("gain", "gain", gain, defaults.gain.min, defaults.gain.max, 0.1)}
</fieldset>
`; // template
} // render
});

console.debug("defining Gain...");

define("audio-gain", Gain);

