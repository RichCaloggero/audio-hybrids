function parse (expression) {
let parser =
/(\d+)|(\w+?)\{(.+?)\}/gi;

return [...expression.matchAll(parser)]
.map(a => a.filter(x => x))
.map(a => a.slice(1));
} // parser

