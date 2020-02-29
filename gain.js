import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";


const Gain = {
label: "",
node: null,

gain: {
get: (host, value) => host.node.gain.value,
set: (host, value) => host.node.gain.value = Number(value),
connect: connect,
},  // gain property

render: ({ label, gain }) => html`
<fieldset class="gain">
<legend><h2>${label}</h2></legend>
<label>gain: <input type="range" defaultValue="${gain}" oninput="${html.set('gain')}" step="0.1"/></label>
</fieldset>
` // render
};

define("audio-gain", Gain);

function connect (host, key) {
if (!host.node) host.node = audio.context.createGain();
host[key] = host.getAttribute(key);
connectGain(host.node);
} // connect

function createGain () {return audio.context.createGain();}

function connectGain (gain) {
const audioElement = document.querySelector("audio");
const source = audio.context.createMediaElementSource(audioElement);
try {
source.connect(gain).connect(audio.context.destination);
} catch (e) {
console.debug(e);
} // try
} // connectGain
