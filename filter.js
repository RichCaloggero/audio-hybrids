import {define, html} from "./hybrids/index.js";
import * as element from "./new.element.js";
import * as ui from "./ui.js";
import * as audio from "./audio.js";


const defaults = {
type: {type: "list", default: "highpass", values: [
["all pass", "allpass"],
["low pass", "lowpass"],
["high pass", "highpass"],
["band pass", "bandpass"],
"notch", "peaking",
["low shelf", "lowshelf"],
["high shelf", "highshelf"]
] // values
}, // type
frequency: {default: 500, step: 10},
q: {default: 1.33, step: 0.05, min: -50, max: 50},
gain: {min: -30, max: 30, step: 1, default: 0}
};

const Filter = element.create("filter", defaults, audio.context.createBiquadFilter(), [["q", "Q"]]);

define ("audio-filter", Filter);

