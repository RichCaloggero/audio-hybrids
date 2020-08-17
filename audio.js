import * as app from "./app.js";

export let context = new AudioContext();
/*if (app.isRenderMode()) {
context = new OfflineAudioContext(2, app.renderLength(), context.sampleRate);
console.debug(`audio: offline audio context defined: ${app.renderLength()}`);
} // if
*/

const contextStack = [];

// set context for render
export function pushContext (_context) {
if (! _context) return null;
contextStack.push(context);
context = _context;
return _context;
} // pushContext

export function popContext () {
return (context = contextStack.pop());
} // popContext

// initialize webaudio elements (connection elements such as series and parallel are initialized within their own modules)
export function initialize (host) {
//if (host._id === "reverb1") console.debug(`audio.initialize new.element : ${host._id}`, host);
host.input = context.createGain();
host.output = context.createGain();
host.wet = context.createGain();
host.dry = context.createGain();
host._bypass = context.createGain();

host.input.connect(host.dry).connect(host.output);
host.input.connect(host._bypass);
host.wet.connect(host.output);


host.__mix = function (value) {
//console.debug(`mix: ${this.name} ${this.value} ${!this.output} ${!this.wet}`);
this.dry.gain.value = 1-Math.abs(value);
this._mix = this.wet.gain.value = value;
return value;
} // __mix

host.__bypass = function (value) {
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

host.__silentBypass = function (value) {
this._bypass.gain.value = value? 0 : 1;
} // __silentBypass

host.__mix(1);
host.__bypass(false);
host.__silentBypass(false);

//if (host._id === "reverb1") debugger;

return host;
} // initialize

console.debug(`audio: ${context}`);

