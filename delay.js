import {define, html, property} from "./hybrids/index.js";
import * as element from "./new.element.js";
import * as audio from "./audio.js";


const defaults = {
delay: {default: 0.5, min: 0, max: 1, step: 0.0001}
};

const Delay = element.create("delay", defaults, audio.context.createDelay(), [["delay", "delayTime"]]);

define ("audio-delay", Delay);
