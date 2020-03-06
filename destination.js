import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as connector from "./connector.js";
import * as ui from "./ui.js";


const Destination = {
id: "destination",
label: "",
node: null,

_connected: property(false, connect),

render: ({ label }) => html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
</fieldset>
` // render
};

define("audio-destination", Destination);

function connect (host, key) {
if (!host.node) {
host.input = audio.context.createGain();
host.output = null;
host.node = audio.context.destination;
host.input.connect(host.node);

connector.signalReady(host);
} // if
} // connect

