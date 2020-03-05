import {createAudioProcessor} from "./createElement.js";
import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as context from "./context.js";
import * as ui from "./ui.js";


const Gain = createAudioProcessor(["gain"], {
id: "gain",
creator: "createGain",
defaults: {},


render: ({ mix, bypass, label, gain, defaults }) => {
	console.debug("rendering gain...");
	return html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix)}
${ui.number("gain", "gain", gain, defaults.gain.min, defaults.gain.max, 0.1)}
</fieldset>
`; // template
} // render
});

console.debug("defining Gain...");
//debugger;

define("audio-gain", Gain);

