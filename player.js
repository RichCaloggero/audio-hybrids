import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as context from "./context.js";
import * as ui from "./ui.js";

const defaults = {};

const Player = element.create("player", defaults, connect, element.connect, {

src: {
get: (host, value) => host.audioElement.src,
set: (host, value) => {
try {
host.audioElement.src = value;
} catch (e) {
context.statusMessage(e);
} // try
}, // set
connect: connect
},  // src property

play: {
get: (host, value) => !host.audioElement.paused,
set: (host, value) => {
if (value) {
host.audioElement.play();
} else {
host.audioElement.pause();
} // if
} // set
}, // play property

render: ({ label, _depth, src, play }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="player">
<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>
${ui.text("src", "src", src)}
${ui.boolean("play", "play", play)}
</fieldset>
`;
} // render
});

define ("audio-player", Player);


function connect (host, key) {
if (!element.isInitialized(host)) {
host.input = null;
host.output = audio.context.createGain();
host.audioElement = document.createElement("audio");
host.node = audio.context.createMediaElementSource(host.audioElement);
host.node.connect(host.output);
element.signalReady(host);

} else {
host[key] = host.getAttribute(key) || "";
} // if
} // connect
