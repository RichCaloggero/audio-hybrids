class Automator extends AudioWorkletProcessor {

constructor () {
super ();
this.channelAverage = [];
this.average = this.frameAverage = this.lastFrameAverage = 0;
this.frameCount = 0;
this.frameDuration = 0;
this.enable = false;
this.automationInterval = 0.1; // seconds
this.elapsedTime = 0;
this.startTime = currentTime;

this.port.onmessage = e => {
const data = e.data;
const name = data[0];
const value = data[1];
this[name] = value;
console.debug(`automator.worklet: parameter ${name} set to ${value}`);

if (this.enable) {
this.startTime = currentTime;
//console.debug(`automator.worklet: startTime reset to ${this.startTime}`);
} // if

}; // onMessage

console.log("automator.worklet initialized...");
} // constructor

process (inputs, outputs) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];
const channelCount = inputBuffer.length;

if (channelCount > 0) {
const sampleCount = inputBuffer[0].length;
this.frameDuration = sampleCount / sampleRate;

this.frameCount += 1;
for (let channel = 0; channel < channelCount; channel++) {
this.channelAverage[channel] = absoluteSum(inputBuffer[channel]) / sampleCount;
} // loop over channels
this.frameAverage = absoluteSum(this.channelAverage)/channelCount;
this.average = (this.lastFrameAverage + this.frameAverage) / 2;
this.lastFrameAverage = this.frameAverage;
} // if channelCount

if (this.enable) {
const dt = currentTime - this.startTime;

if (dt >= this.automationInterval) {
this.startTime = currentTime;
this.port.postMessage("tick");
//console.debug("automator.worklet: tick");
this.port.postMessage([
["channelAverage", this.channelAverage],
["frameAverage", this.frameAverage],
["average", this.average]
]); // message
} // if elapsedTime
} // if enabled

return true;
} // process
} // class Automator

registerProcessor("parameter-automator", Automator);

function absoluteSum (a) {return a.reduce((sum, x) => sum += Math.abs(x), 0);}

