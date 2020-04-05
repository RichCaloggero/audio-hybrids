export const context = new AudioContext();


export function initialize (element) {
element.input = context.createGain();
element.output = context.createGain();
element.wet = context.createGain();
element.dry = context.createGain();
element._bypass = context.createGain();

element.input.connect(element.dry).connect(element.output);
element.input.connect(element._bypass);
element.wet.connect(element.output);


element.__mix = function (value) {
//console.debug(`mix: ${this.name} ${this.value} ${!this.output} ${!this.wet}`);
this.dry.gain.value = 1-Math.abs(value);
this._mix = this.wet.gain.value = value;
return value;
} // __mix

element.__bypass = function (value) {
if (!this.output) return;
if (value) {
this.dry.disconnect();
this.wet.disconnect();
this._bypass.connect(this.output);
} else {
this.dry.connect(this.output);
this.wet.connect(this.output);
this._bypass.disconnect();
} // if
//console.debug(`- ${this.wet.gain.value} ${this.dry.gain.value} ${this._bypass}`);
} // __bypass

element.__silentBypass = function (value) {
this._bypass.gain.value = value? 0 : 1;
} // __silentBypass

element.__mix(1);
element.__bypass(false);
element.__silentBypass(false);

//console.log(`${element._id}: webaudio nodes created`);
return element;
} // initialize

console.debug(`audio: ${context}`);
