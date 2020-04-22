import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

const defaults = {
panningModel: {default: "HRTF"},
refDistance: {default: 10},
coneOuterAngle: {default: 0},
a: {default: 0, step: 0.05},
r: {default: 0, min: 0, step: 1}
};

const Panner = element.create("panner", defaults, "createPanner", [
["x", "positionX"],
["y", "positionY"],
["z", "positionZ"],
["innerAngle", "coneInnerAngle"],
["outerAngle", "coneOuterAngle"],
["outerGain", "coneOuterGain"],

"orientationX", "orientationY", "orientationZ",
"panningModel", "distanceModel", "maxDistance", "refDistance", "rolloffFactor",
], {

r: {
connect: element.connect,
observe: (host, value) => {
host.x = value * Math.cos(host.a);
host.z = value * Math.sin(host.a);
} // observe
}, // r

a: {
connect: element.connect,
observe: (host, value) => {
host.x = host.r * Math.cos(value);
host.z = host.r * Math.sin(value);
} // observe
}, // r


render: ({ bypass, mix, label, _depth,
x,y,z,
orientationX, orientationY, orientationZ,
distanceModel, maxDistance, refDistance, rolloffFactor,
panningModel, innerAngle, outerAngle, outerGain,
r, a
}) => {
	return html`
<fieldset class="panner">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}

<br>${ui.number("x", "x", x, defaults)}
${ui.number("y", "y", y, defaults)}
${ui.number("z", "z", z, defaults)}

<br>${ui.number("r", "r", r, defaults)}
${ui.number("a", "a", a, defaults)}

<br>${ui.number("orientationX", "orientationX", orientationX, defaults)}
${ui.number("orientationY", "orientationY", orientationY, defaults)}
${ui.number("orientationZ", "orientationZ", orientationZ, defaults)}

${ui.text({ name: "panningModel",  defaultValue: panningModel })}
${ui.text({ name: "distanceModel", defaultValue: distanceModel })}
${ui.number("maxDistance", "maxDistance", maxDistance, defaults)}
${ui.number("refDistance", "refDistance", refDistance, defaults)}
${ui.number("rolloffFactor", "rolloffFactor", rolloffFactor, defaults)}

${ui.number("innerAngle", "innerAngle", innerAngle, defaults)}
${ui.number("outerAngle", "outerAngle", outerAngle, defaults)}
${ui.number("outerGain", "outerGain", outerGain, defaults)}
</fieldset>
`;
} // render
});

define ("audio-panner", Panner);
