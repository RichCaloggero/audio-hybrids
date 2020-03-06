import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const Filter = audioProcessor.create(["type", "frequency", ["q", "Q"], "gain", "detune"],
{id: `filter${++instanceCount}`,
node: null,
creator: "createBiquadFilter",


render: ({ bypass, mix, label, type, frequency, q, gain, detune, defaults }) => {
	console.debug(`rendering filter...`);
	return html`
<fieldset class="filter">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.list("type", "type", [
["low pass", "lowpass"],
["high pass", "highpass"],
["band pass", "bandpass"],
["notch"],
["all pass", "allpass"],
["low shelf", "lowshelf"],
["high shelf", "highshelf"],
], defaults.type)}
${ui.number("frequency", "frequency", frequency, defaults.frequency.min, defaults.frequency.max, 10)}
${ui.number("q", "q", q, 0.02, 20, 0.02)}
${ui.number("gain", "gain", gain, -30, 30, 1)}
${ui.number("detune", "detune", detune, -100, 100, 1)}
</fieldset>
`;
} // render
});

define("audio-filter", Filter);



