 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

let delay1Processor;
let defaults = {
delay: {step: 1, max: 44100},
feedback: {min: -0.98, max: 0.98, step: 0.01}
};
let Delay1;

const instantiateModule = async () => await audio.context.audioWorklet.addModule("delay1.worklet.js");

instantiateModule()
.then(() => {
const delay1Processor = new AudioWorkletNode(audio.context, "delay1", {outputChannelCount: [2]});
Delay1 = element.create("delay1", defaults, delay1Processor); // element.create
define("audio-delay1", Delay1);

}).catch(error => {
console.error(`delay1.js: ${error}`);
 }); // Promise.then
