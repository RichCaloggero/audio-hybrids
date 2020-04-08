import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

const defaults = {};

const Destination = element.create("destination", defaults, initialize, {
render: ({ label, _depth }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="destination">
${ui.legend({ label, _depth })}
<p>Audio Destination.</p>
</fieldset>
`;
} // render
});

define ("audio-destination", Destination);


function initialize (host) {
host.node = audio.context.destination;
host.input.connect(host.node);
host.output = null;
element.signalReady(host);
} // initialize
