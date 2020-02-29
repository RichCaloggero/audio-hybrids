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


element.mix = function (value) {
//console.debug(`mix: ${this.name} ${this.value} ${!this.output} ${!this.wet}`);
this.dry.gain.value = 1-Math.abs(value);
this._mix = this.wet.gain.value = value;
} // mix

element.bypass = function (value) {
if (!this.output) return this;
//console.debug(`${this.name}.bypass ${value} ${this.wet.gain.value} ${this.dry.gain.value} ${this._bypass}`);
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

return this;
} // bypass

element.silentBypass = function (value) {
if (value) {
this._silentBypass = true;
this._bypass.gain.value = 0;
} else {
this._silentBypass = false;
this._bypass.gain.value = 1.0;
} // if
} // silentBypass

element.mix(1);
element.bypass(false);
element.silentBypass(false);

return element;
} // initialize

console.debug(`audio: ${context}`);
