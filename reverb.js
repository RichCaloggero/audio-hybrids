 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./new.element.js";
import * as ui from "./ui.js";

let reverbProcessor;
let defaults = {};

audio.context.audioWorklet.addModule("dattorroReverb.js")
.then(() => {
reverbProcessor = new AudioWorkletNode(audio.context, "DattorroReverb", {outputChannelCount: [2]});

const Reverb = element.create("reverb", defaults, reverbProcessor); // element.create

console.debug("defaults: ", defaults);
console.debug("reverb descriptors: ", Reverb);

define("audio-reverb", Reverb);
}).catch(error => {
alert(`reverb.js: cannot create AudioWorklet reverb processor; aborting`);
console.error(`reverb.js: ${error}`);
 }); // Promise.then
