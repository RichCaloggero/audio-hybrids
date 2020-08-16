import {render, define, html, property} from "./hybrids/index.js";

const Element = {
value: 42, other: "frog"
};

Element.render = createRenderer (Element, ["other", "value"]);

define("my-element", Element);

function createRenderer (obj, keys) {
return render((host) => {
return (host, target) => {
console.log(`keys: ${keys}, host: ${host}`);
target.innerHTML = (`
<fieldset><legend><h2> My Element</h2></legend>
${keys.map(key => `
<div class="property">
${key}: ${host[key]}
</div>
`).join(" ")}

</fieldset>
`); // html
return target;
}; // callback
}); // callback
} // create
