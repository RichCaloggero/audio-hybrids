 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./new.element.js";
import * as ui from "./ui.js";

let reverbProcessor;
let defaults = {};
let Reverb;

const instantiateModule = async () => await audio.context.audioWorklet.addModule("dattorroReverb.js");

instantiateModule()
.then(() => {
reverbProcessor = new AudioWorkletNode(audio.context, "DattorroReverb", {outputChannelCount: [2]});

Reverb = element.create("reverb", defaults, reverbProcessor, [["dryGain", "dry"], ["wetGain", "wet"]]); // element.create

console.debug("defaults: ", defaults);
console.debug("reverb descriptors: ", Reverb);

define("audio-reverb", Reverb);
console.debug("define finished");
}).catch(error => {
console.error(`reverb.js: ${error}`);
 }); // Promise.then
