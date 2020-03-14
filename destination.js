import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const Destination = {
id: "destination",

_connected: property(true, initialize),

render: ({ label }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
<p>Audio Destination.</p>
</fieldset>
`;
} // render
};

define("audio-destination", Destination);

function initialize (host) {
audio.initialize(host);
host.node = audio.context.destination;
host.input.connect(host.node);
host.output = null;
element.signalReady(host);
} // initialize
