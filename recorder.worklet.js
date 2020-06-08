
class Recorder extends AudioWorkletProcessor {

constructor () {
super ();
this.channel1 = Float32Array.from([]);
this.channel2 = Float32Array.from([]);
this.done = false;
this.started = false;

this.port.onmessage = e => {
const data = e.data;
const name = data[0];

const value = data[1];
this[name] = value;
//console.debug(`Recorder.worklet: parameter ${name} set to ${value}`);
};

console.log("Recorder.worklet initialized...");
} // constructor

process (inputs, outputs) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];

if (this.done) {
this.port.postMessage("done");
console.log("Recorder.worklet done");
this.port.close();
return false;
} // if

if (this.started && inputBuffer.length === 2) {
this.port.postMessage(inputBuffer);
} // if
return true;
} // process
} // class Recorder

registerProcessor("audio-recorder", Recorder);

