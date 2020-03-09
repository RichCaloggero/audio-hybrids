import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const Player = element.create(host => {
host.input = null;
host.output = audio.context.createGain();
host.audioElement = document.createElement("audio");
host.node = audio.context.createMediaElementSource(host.audioElement);
host.node.connect(host.output);
}, {
id: "player",


src: {
get: (host, value) => host.audioElement.src,
set: (host, value) => {
try {
host.audioElement.src = value;
} catch (e) {
context.statusMessage(e);
} // try
}, // set
connect: (host, key) => host[key] = element.getDefault(host, key)
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

render: ({ label, src, play }) => html`
<fieldset class="player">
<legend><h2>${label}</h2></legend>
${ui.text("src", "src", src)}
${ui.boolean("play", "play", play)}
</fieldset>
` // render
});

define("audio-player", Player);

function connect (host, key) {
if (!host.node) {
host.input = null;
host.output = audio.context.createGain();
host.audioElement = document.createElement("audio");
host.node = audio.context.createMediaElementSource(host.audioElement);
host.node.connect(host.output);
connector.signalReady(host);
} // if

host[key] = host.getAttribute(key);
} // connect

