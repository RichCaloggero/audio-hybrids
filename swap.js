import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";
import * as connector from "./connector.js";


const defaults = {};

const Swap = element.create("swap", defaults, initialize, {

render: ({ mix, bypass, label, _defaults, _depth }) => {
return html`
<fieldset class="swap">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, data: _defaults.mix })}
</fieldset>
`; // template
} // render
});

define ("audio-swap", Swap);


function initialize (host) {
host._split = audio.context.createChannelSplitter(2);
host._merge = audio.context.createChannelMerger(2);

host.input.connect(host._split);
host._split.connect (host._merge, 0, 1);
host._split.connect (host._merge, 1, 0);
host._merge.connect(host.wet);
connector.signalReady(host);
} // initialize
