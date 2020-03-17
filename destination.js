import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

const defaults = {};

const Destination = element.create("destination", defaults, initialize, element.connect, {
render: ({ label }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
<p>Audio Destination.</p>
</fieldset>
`;
} // render
});

define ("audio-destination", Destination);


function initialize (host) {
console.log("destination: initialize called...");
if (!element.isInitialized(host)) {
host.node = audio.context.destination;
host.input.connect(host.node);
host.output = null;
element.signalReady(host);
} // if
} // initialize
