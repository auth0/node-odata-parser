var repl = require('repl');
var util = require('util');
var parser = require("./lib");

var evalFn = (text, context, filename, callback) => {
  callback(null, parser.parse(text.replace(/\r?\n$/, '')));
};

var writer = (output) => util.inspect(output, { colors: true, depth: null, maxArrayLength: null });

console.log('Type any OData string to see the resulting AST')
repl.start({ prompt: '> ', eval: evalFn, writer });
