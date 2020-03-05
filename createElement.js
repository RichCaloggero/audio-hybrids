export function createAudioProcessor (...definitions) {
return Object.assign.apply (null,
[defaults,
definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)].flat(2)
); // assign

function createDescriptors (props) {
return props.map(p => p instanceof Array? p[1] : p)
.map(p => ({p: {
get: _get, set: _set}
}));
} // createDescriptors

var defaults = {
label: "",
id: "",
node: null,

bypass: {
get: _get,
set: _set
},

mix: {
get: _get,
set: _set
},
}; // common properties
function _get (host, value) {
return host.node[key] instanceof AudioParam?
host.node[key].value
: host[key]
} // _get

function _set (host, value) {
return host.node[key] instanceof AudioParam?
host.node[key].value = value
: host[key] = value
} // _set
} // createAudioProcessor 



createAudioProcessor(["foo", "bar", "baz"], {render: "render function"});
