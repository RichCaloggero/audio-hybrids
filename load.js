[ // order is important; context, controllers, and connectors need to be loaded before processors
// root
"context",

// connectors
"series",
//"parallel",
"split",

// processors
"player",
"destination",
"gain",
"delay",
"filter",
"panner",
"stereoProcessor",
"swap", 
].forEach(src => {
const s = document.createElement("script");
s.type="module";
s.crossorigin="anonymous"
s.src = `${src}.js`;
document.querySelector("head").appendChild(s);
});
