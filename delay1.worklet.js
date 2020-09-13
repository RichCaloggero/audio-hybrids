class Delay1 extends AudioWorkletProcessor {
static get parameterDescriptors() {
return [{
name: "delay",
defaultValue: 0.0,
minValue: 0.0,
maxValue: sampleRate, // 1 second
automationRate: "k-rate"
}, {
name: "feedbackGain",
defaultValue: 0.0,
minValue: -0.98,
maxValue: 0.98,
automationRate: "k-rate"
}];
} // get parameterDescriptors

constructor (options) {
super (options);
this.initializeDelayBuffer();
this.blockCount = 0;
console.debug(`delay1.worklet ready.`);
} // constructor

process (inputs, outputs, parameters) {
this.blockCount += 1;
const delay = parameters.delay[0];
const feedback = parameters.feedbackGain[0];
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];
const channelCount = inputBuffer.length;

if (channelCount > 2) {
console.error("channel count must be <= 2");
return false;
} // if

if (delay > 0 && delay !== this.delay) {
this.delay = this.allocate(delay);
console.debug(`allocated ${this.delay}`);
} else if (delay === 0 && this.delayBuffer[0] !== null) {
this.initializeDelayBuffer();
console.debug("deallocated buffers");
} // if

if (channelCount > 0) {
//console.debug(`frame ${this.blockCount++}, delay ${delay}, ${this.delay}, ${delayLength}`);

for (let channel = 0; channel < channelCount; channel++) {
const sampleCount = inputBuffer[channel].length;

for (let i=0; i<sampleCount; i++) {
const sample = inputBuffer[channel][i];

if (delay === 0) {
outputBuffer[channel][i] = sample;

} else {
const delayedSample = this.readBuffer(channel);
//console.debug(`got ${delayedSample}, length is ${this.bufferLength[channel]}`);
outputBuffer[channel][i] = delayedSample;
this.writeBuffer(channel, sample);
//console.debug(`wrote ${sample}, length ${this.bufferLength[channel]}`);
} // if
} // loop over samples

//throw new Error("done for now");
} // loop over channels
} // if channelCount > 0

return true;
} // process

initializeDelayBuffer () {
this.delayBuffer = [null, null];
this.readIndex = [0, 0];
this.writeIndex = [0, 0];
this.bufferLength = [0,0];
this.delay = 0;
} // initializeDelayBuffer

readBuffer (channel) {
if (this.delay === 0 || this.bufferLength[channel] < this.delay) return 0.0;
const sample = this.delayBuffer[channel][this.readIndex[channel]];
//console.debug(`- - got ${sample} at ${this.readIndex[channel]}`);
this.readIndex[channel] = (this.readIndex[channel] + 1) % this.delay;
this.bufferLength[channel] -= 1;
return sample;
} // readBuffer

writeBuffer (channel, sample) {
if (this.delay > 0 && this.bufferLength[channel] < this.delay) {
this.delayBuffer[channel][this.writeIndex[channel]] = sample;
//console.debug(`- wrote ${sample} at ${this.writeIndex[channel]}`);
this.writeIndex[channel] = (this.writeIndex[channel] + 1) % this.delay;
this.bufferLength[channel] += 1;
} // if
} // writeBuffer

bufferLength (channel) {
return Math.abs(this.writeIndex[channel] - this.readIndex[channel]);
} // bufferLength

allocate (count) {
for (let channel=0; channel<2; channel++) {
const buffer = new Float32Array(count);

if (this.delayBuffer[channel] !== null) {
const length = Math.min(count, this.bufferLength[channel]);
let index = this.readIndex[channel];

for (let i=0; i < length; i++) {
buffer[i] = this.delayBuffer[channel][index];
index = (index+1) % length;
} // for
} // if

this.delayBuffer[channel] = buffer;
this.readIndex[channel] = this.writeIndex[channel] = 0;
} // loop over channels

return count;
} // allocate
} // class Delay1

registerProcessor("delay1", Delay1);
