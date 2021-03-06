 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

let reverbProcessor;
let defaults = {};
let Reverb;

const instantiateModule = async () => await audio.context.audioWorklet.addModule("dattorroReverb.worklet.js");

instantiateModule()
.then(() => {
reverbProcessor = new AudioWorkletNode(audio.context, "DattorroReverb", {outputChannelCount: [2]});

Reverb = element.create("reverb", defaults, reverbProcessor, [["dryGain", "dry"], ["wetGain", "wet"]]); // element.create


define("audio-reverb", Reverb);
}).catch(error => {
console.error(`reverb.js: ${error}`);
 }); // Promise.then
