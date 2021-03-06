import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as audio from "./audio.js";


const defaults = {
gain: {default: 1, min: -10, max: 10, step: 0.01}
};

const Gain = element.create("gain", defaults, audio.context.createGain());
define ("audio-gain", Gain);


