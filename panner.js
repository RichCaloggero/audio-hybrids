import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

const defaults = {
panningModel: {default: "HRTF"},
refDistance: {default: 10},
orientationX: {default: 0},
a_xz: {default: 0, step: 0.1},
a_xy: {default: 0, step: 0.1},
r: {default: 0, min: 0, step: 0.1}
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
[host.x, host.y, host.z] = toPolar(host.r, host.a_xy, host.a_xz);
} // observe
}, // r

a_xz: {
connect: element.connect,
observe: (host, value) => {
[host.x, host.y, host.z] = toPolar(host.r, host.a_xy, host.a_xz);
} // observe
}, // a_xz

a_xy: {
connect: element.connect,
observe: (host, value) => {
[host.x, host.y, host.z] = toPolar(host.r, host.a_xy, host.a_xz);
} // observe
}, // a_xy


render: ({ bypass, mix, label, _depth,
x,y,z,
orientationX, orientationY, orientationZ,
distanceModel, maxDistance, refDistance, rolloffFactor,
panningModel, innerAngle, outerAngle, outerGain,
r, a_xz, a_xy
}) => {
	return html`
<fieldset class="panner">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}

<br>${ui.number("x", "x", x, defaults)}
${ui.number("y", "y", y, defaults)}
${ui.number("z", "z", z, defaults)}

<br>${ui.number("r", "r", r, defaults)}
${ui.number("a (X Z)", "a_xz", a_xz, defaults)}
${ui.number("a (X Y)", "a_xy", a_xy, defaults)}

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

function toPolar (r, theta, phi) {
const cos = Math.cos;
const sin = Math.sin;

return [ // x,y,z
r * cos(theta) * sin(phi),
r * sin(theta) * sin(phi),
r * cos(phi)
];
} // toPolar
