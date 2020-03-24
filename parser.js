
function parse (expression) {
if (!expression) return [];

let parser =
/^(\d+)$|^(\w+)$|(\w+)\{(.+?)\}/gi;
//console.debug("intermediate: ", [...expression.matchAll(parser)]);

const result = [...expression.matchAll(parser)]
.map(a => a.filter(x => x))
.map(a => a.slice(1));
//console.debug("final: ", result);
return result;


} // parser
