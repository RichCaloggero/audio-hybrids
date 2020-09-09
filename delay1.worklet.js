class Delay1 extends AudioWorkletProcessor {

constructor () {
super ({outputChannelCount: [2]});
this.sample = 0;
this.channelCount = -1;
} // constructor

process (inputs, outputs) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];
const channelCount = inputBuffer.length;
if (channelCount !== this.channelCount) {
this.channelCount = channelCount;
console.debug(`delay1.worklet: channelCount = ${channelCount}`);
} // if

if (channelCount > 0) {
for (let channel = 0; channel < channelCount; channel++) {
const sampleCount = inputBuffer[channel].length;
outputBuffer[channel][0] = this.sample;
for (let i=0; i<sampleCount-1; i++) outputBuffer[channel][i+1] = inputBuffer[channel][i];
this.sample = outputBuffer[channel][sampleCount-1];
} // loop over channels
} // if channelCount

return true;
} // process
} // class Delay1

registerProcessor("delay1", Delay1);
