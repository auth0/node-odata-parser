var peg = require("pegjs"),
    fs = require("fs"),
    path = require("path"),
    grammar = fs.readFileSync(path.join(__dirname, 'odata.pegjs'), 'utf8');

module.exports = peg.buildParser(grammar);