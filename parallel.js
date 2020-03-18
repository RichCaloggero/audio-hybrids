 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {}; // sefaults


const Parallel = element.create("series", defaults, initialize, element.connect, {


render: ({ label, mix, bypass }) => {
return html`
<fieldset class="series">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
</fieldset>
<slot></slot>
`;
} // render
});

define ("audio-parallel", Parallel);

function initialize (host, key) {
if (!element.isInitialized(host)) {
element.waitForChildren(host, children => {

if (children.length < 2) {
console.error(`${host._id}: must have at least two children; aborting`);
throw new Error(`must have at least two children`);
} // if

children.forEach((child, index) => {
child.output.connect(host.wet.input);
}); // forEach

host.wet.gain.value = 1 / children.length;
console.log(`${host._id}: ${children.length} children connected in parallel`);
}); // waitForChildren
} // if
} // initialize

