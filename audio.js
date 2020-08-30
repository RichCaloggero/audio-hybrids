
export let length;
export let isRenderMode;
export let sampleRate;

if (renderModeParams()) {
isRenderMode = true;
length = renderModeParams().get("length");
sampleRate = renderModeParams().get("rate");
} // if

export const context = isRenderMode?
new OfflineAudioContext(2, length, sampleRate)
: new AudioContext();

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
this._bypass.gain.value = this.silentBypass? 0 : 1;

} else {
this.dry.connect(this.output);
this.wet.connect(this.output);
this._bypass.disconnect();
} // if

//console.debug(`- ${this.wet.gain.value} ${this.dry.gain.value} ${this._bypass}`);
} // __bypass


host.__mix(1);
host.__bypass(false);

return host;
} // initialize

console.debug(`audio: ${context}`);

function renderModeParams () {
const params = new URL(window.location.href).searchParams;
return params.has("render")? params : false;
} // renderModeParams
