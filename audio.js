export const context = new AudioContext();

const registry = {};
function registerComponent (name, parent) {
const value = registry[name];
if (! value) registry[name] = 1;
else registry[name] += 1;
return `${parent? parent.id + "." : ""}${name}-${registry[name]}`;
} // registerComponent

export class Component {
constructor (audio, name, parent) {
//console.debug("audioComponent: instantiating ", name);
this.audio = _context;
this.name = name;
this.parent = parent;
this.cid = registerComponent(this.name, this.parent);
this._silentBypass = false;

this.input = audio.createGain();
this.output = audio.createGain();
this.wet = audio.createGain();
this.dry = audio.createGain();
this._bypass = audio.createGain();

this.input.connect(this.dry);
this.input.connect(this._bypass);
this.wet.connect(this.output);
this.dry.connect(this.output);

this.__mix(1.0);
this.__bypass(false);
//console.debug(`component ${name} created`);
} // constructor

set mix (value) {this.__mix(value);}
get mix () {return this._mix;}

set bypass (value) {this.__bypass(value);}

get silentBypass() {return this._silentBypass;}
set silentBypass (value) {this.__silentBypass(value);}


__silentBypass (value) {
console.debug(`silentBypass: ${value}`);
if (value) {
this._silentBypass = true;
this._bypass.gain.value = 0;
} else {
this._silentBypass = false;
this._bypass.gain.value = 1.0;
} // if
} // silentBypass

__mix (value) {
//console.debug(`mix: ${this.name} ${this.value} ${!this.output} ${!this.wet}`);
this.dry.gain.value = 1-Math.abs(value);
this._mix = this.wet.gain.value = value;
} // mix

__bypass (value) {
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
} // bypass

isEnabled () {return this._bypass === 0;}
} // class Component


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
} // __mix

element.__bypass = function (value) {
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
} // __bypass

element.__silentBypass = function (value) {
if (value) {
this._silentBypass = true;
this._bypass.gain.value = 0;
} else {
this._silentBypass = false;
this._bypass.gain.value = 1.0;
} // if
} // __silentBypass

element.__mix(1);
element.__bypass(false);
element.__silentBypass(false);


return element;
console.log(`${element.id}: webaudio nodes created`);
} // initialize

console.debug(`audio: ${context}`);
