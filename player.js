import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as context from "./context.js";
import * as ui from "./ui.js";

const defaults = {};

const Player = element.create("player", defaults, initialize, {

src: {
get: (host, value) => host.audioElement.src,
set: (host, value) => {
try {
host.audioElement.src = value;
} catch (e) {
context.statusMessage(e);
} // try
}, // set
connect: (host, key) => host[key] = element.processAttribute(host, key) || "",
}, // src

play: {
connect: (host, key) => element.getDefault(host, key) || false,
observe: (host, value) => {
if (value) host.audioElement.play();
else host.audioElement.pause();
//host.play = !value;
} // observe
}, // play

/*play: {
get: (host, value) => !host.audioElement.paused,
set: (host, value) => {
if (value) {
host.audioElement.play();
} else {
host.audioElement.pause();
} // if
} // set
}, // play property
*/

seek: {
connect: (host, key) => 0,
observe: (host, value) => host.audioElement.currentTime = Number(value)
}, // seek

duration: {
get: (host, value) => host.audioElement.duration,
set: (host, value) => value,
}, // duration

currentTime: 0,

render: ({ label, _depth, src, play, seek, currentTime, duration }) => {
//console.debug(`${label}: rendering...`);
return html`
<fieldset class="player">
<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>
${ui.text("src", "src", src)}
${ui.boolean("play", "play", play)}
<label>seek: <input type="range" value="${currentTime}" oninput="${html.set(`seek`)}" min="0" max="${duration}" step="5"></label>
</fieldset>
`;
} // render
});

define ("audio-player", Player);


function initialize (host, key) {
host.input = null;
host.output = audio.context.createGain();
host.audioElement = document.createElement("audio");
//host.audioElement.setAttribute("crossorigin", "anonymous");
host.node = audio.context.createMediaElementSource(host.audioElement);
host.node.connect(host.output);

host.audioElement.addEventListener("durationchange", e => host.duration = e.target.duration);
host.audioElement.addEventListener("timeupdate", e => {
const value = host.currentTime|| 0;
if (e.target.currentTime - value > 1) host.currentTime= e.target.currentTime;
});

element.signalReady(host);

} // initialize
