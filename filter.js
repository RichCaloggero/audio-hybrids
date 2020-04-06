import {define, html} from "./hybrids/index.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
frequency: {default: 500, step: 10},
gain: {type: "range", min: -30, max: 30, step: 1, default: 0},
q: {default: 1.33, step: 0.05, min: -50, max: 50},
type: {default: "highpass"}
};

const Filter = element.create("filter", defaults, "createBiquadFilter", ["type", "frequency", ["q", "Q"], "gain", "detune"], {

render: ({ bypass, mix, label, _depth, type, frequency, q, gain, detune }) => {
	return html`
<fieldset class="filter">
<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.list("type", "type", type, [
["low pass", "lowpass"],
["high pass", "highpass"],
["band pass", "bandpass"],
"notch",
"peaking",
["all pass", "allpass"],
["low shelf", "lowshelf"],
["high shelf", "highshelf"],
])}
${ui.number("frequency", "frequency", frequency, defaults)}
${ui.number("q", "q", q, defaults)}
${ui.number("gain", "gain", gain, defaults)}
${ui.number("detune", "detune", detune, defaults)}
</fieldset>
`;
} // render
});

define ("audio-filter", Filter);

