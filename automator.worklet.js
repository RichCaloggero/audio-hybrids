
class Automator extends AudioWorkletProcessor {

constructor () {
super ();
this.channelAverage = [];
this.runningAverage = 0
this.frameCount = 0;
this.enabled = false;
this.sampleRate = 44100;
this.tickDuration = 0.1; // seconds
this.elapsedTime = 0;

this.port.onmessage = e => {
const data = e.data;
const name = data[0];

const value = data[1];
this[name] = value;
//console.debug(`Recorder.worklet: parameter ${name} set to ${value}`);
}; // onMessage

console.log("AutomationUtilities.worklet initialized...");
} // constructor

process (inputs, outputs) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];
const channelCount = inputBuffer.length;

if (channelCount > 0) {
const sampleCount = inputBuffer[0].length;
const frameDuration = sampleCount / sampleRate;

this.frameCount += 1;
for (let channel = 0; channel < channelCount; channel++) {
this.channelAverage[channel] = sum(inputBuffer[channel]) / sampleCount;
} // loop over channels
this.average = sum(channelAverage)/channelCount;
this.runningAverage = (this.runningAverage + this.average)/ 2;

if (this.enabled) {
this.elapsedTime += frameDuration;

if (this.elapsedTime >= this.tickDuration) {
this.elapsedTime = 0;
this.port.postMessage([
["channelAverages", this.average],
["average", average],
["runningAverage", runningAverage]
]); // message
} // if elapsedTime

} else {
this.elapsedTime = 0;
} // if enabled

return true;
} // process
} // class Automator

registerProcessor("audio-recorder", Recorder);

function sum (a) {return a.reduce((sum, x) => sum += x, 0);}

