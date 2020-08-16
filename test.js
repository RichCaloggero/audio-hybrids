class Test extends AudioWorkletProcessor {
static get parameterDescriptors () {
return [{
name: "overlap", defaultValue: 0, minValue: 0, maxValue: 1000, automationRate: "k-rate"
}];
} // parameterDescriptors
constructor () {
super ();
this.overlap = 0;
this.queue = [new Float32Array(0), new Float32Array(0)];
console.log("test: ready.");
} // constructor

process (inputs, outputs, parameters) {
const input = inputs[0];
const output = outputs[0];
if (input.length === 0) return true;

if (parameters.overlap[0] !== this.overlap && input.length > 0) {
this.overlap = parameters.overlap[0];
console.log(`init queue: ${this.overlap}, ${input.length}`);
this.queue[0] = Float32Array.from(input[0].slice(0, this.overlap));
this.queue[1] = Float32Array.from(input[0].slice(0, this.overlap));
console.log(`initialized overlap to ${this.overlap}, ${this.queue[0].length}`);
} // if

for (let channel = 0; channel < input.length; channel++) {
for (let i=this.overlap; i<input[channel].length; i++) {
let data = input[channel][i];
let newData = (sum(this.queue[channel]) + data) / (1 + this.overlap);

if (newData > 1) newData = 1;
else if (newData < -1) newData = -1;
output[channel][i] = newData;

if (this.overlap > 0) {
if (this.overlap > 1) this.queue[channel].copyWithin(0, 1);
this.queue[channel][this.overlap-1] = data;
} // if
} // for
} // for

return true;
} // process

} // class Test


registerProcessor("test", Test);

function average (data) {
return sum(data)/data.length;
} // average

function sum (data) {
return data.length === 0? 0
: data.reduce((result, value) => result += value);
} // sum

function product (data) {
return data.length === 0? 1
: data.reduce((result, data) => result *= data, 1);
} // product
