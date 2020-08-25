 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./new.element.js";
import * as ui from "./ui.js";


const defaults = {}; // sefaults

const Parallel = element.create("parallel", defaults, initialize, {


render: ({ label, mix, bypass, _depth }) => {
return html`
<fieldset class="parallel">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
</fieldset>
<slot></slot>
`;
} // render
});

define ("audio-parallel", Parallel);

function initialize (host) {
element.waitForChildren(host, children => {
if (children.length < 2) {
app.statusMessage(`${host._id}: must have at least two children; aborting`);
throw new Error(`${host._id}: must have at least two children; aborting`);
} // if

children.forEach(child => {
if (host.input && child.input) host.input.connect(child.input);
if (host.output && child.output) child.output.connect(host.wet);
}); // forEach

host.wet.gain.value = 1 / children.length;
console.log(`${host._id}: ${children.length} children connected in parallel`);
}); // waitForChildren
} // initialize

