import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./new.element.js";
import * as app from "./app.js";
import * as ui from "./ui.js";

const defaults = {};

const Player = element.create("player", defaults, initialize, {

src: {
set: (host, value) => {
//if (app.isRenderMode()) return;
try {
host.audioElement.src = value;
console.debug(`src: ${value}`);
return value;
} catch (e) {
app.statusMessage(e);
return "";
} // try
}, // set
connect: (host, key) => host[key] = element.processAttribute(host, key) || "",
}, // src

play: {
connect: (host, key) => element.getDefault(host, key) || false,
observe: (host, value) => {
if (app.isRenderMode()) return;
if (value) host.audioElement.play();
else host.audioElement.pause();
} // observe
}, // play


seek: {
connect: (host, key) => element.getDefault(host, key) || 0,
observe: (host, value) => {
if (app.isRenderMode()) return;
host.audioElement.currentTime = Number(value);
} // observe
}, // seek

duration: {
set: (host, value) => value,
}, // duration

currentTime: 0,

render: ({ isRenderMode, label, _depth, src, play, seek, currentTime, duration }) => {
//console.debug(`${label}: rendering...`);
if (app.isRenderMode()) return html``;
return html`
<fieldset class="player">
${ui.legend({ label, _depth })}
${ui.text({ label: "source file", name: "src", defaultValue: src })}
${ui.boolean({ name: "play", defaultValue: play })}
<label>seek: <input type="range" value="${currentTime}" onchange="${html.set(`seek`)}" min="0" max="${duration}" step="2" data-name="seek"></label>
</fieldset>
`;
} // render
});

define ("audio-player", Player);


function initialize (host, key) {
host.input = null;
host.output = audio.context.createGain();
host.audioElement = document.createElement("audio");

host.audioElement.addEventListener ("error", e => app.statusMessage(e.target.error.message));

host.audioElement.addEventListener("ended", () => {
host.play = false;
host.currentTime = 0;
}); // ended

host.audioElement.addEventListener("durationchange", e => host.duration = e.target.duration);
host.audioElement.addEventListener("timeupdate", e => {
host.currentTime= Math.floor(e.target.currentTime / 2) * 2;
}); // timeUpdate

if (app.isRenderMode()) {
host.node = audio.context.createBufferSource();
console.debug("player: offline context detected");

} else {
host.node = audio.context.createMediaElementSource(host.audioElement);
} // if

host.node.connect(host.output);
//if (ui.automator) host.output.connect (ui.automator);
element.signalReady(host);
} // initialize
