import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const audioDestination = element.create("destination", {}, initialize, element.connect, {
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


function initialize (host) {
console.log("destination: initialize called...");
if (!element.isInitialized(host)) {
host.node = audio.context.destination;
host.input.connect(host.node);
host.output = null;
element.initializeHost(host);
element.signalReady(host);
} // if
} // initialize
