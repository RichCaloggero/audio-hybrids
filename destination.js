import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const Destination = element.create(host => {
host.node = audio.context.destination;
host.input.connect(node);
host.output = null;
},
[], // no UI
{id: "destination",

render: ({ label }) => html`
<fieldset class="destination">
<legend><h2>${label}</h2></legend>
</fieldset>
` // render
});

define("audio-destination", Destination);
