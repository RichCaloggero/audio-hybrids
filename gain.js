import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const Gain = element.create("createGain", ["gain"], {
id: `gain${++instanceCount}`,
defaults: {
gain: {min: -1, max: 1, default: 1, step: 0.1}
},


render: ({ mix, bypass, label, gain, defaults }) => {
	return html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.number("gain", "gain", gain, defaults.gain.min, defaults.gain.max, defaults.gain.step)}
</fieldset>
`; // template
} // render
});

define("audio-gain", Gain);
