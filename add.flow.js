#! /usr/bin/env node
// @flow
"use strict"

const fs = require('fs')
const path = require('path')
const babel = require('babel-core')

const parserPath = path.join(process.cwd(), '/lib/index.js')
const parserSrc = fs.readFileSync(parserPath, 'utf8')
const types = fs.readFileSync(path.join(process.cwd(), '/src/odata.types.js'), 'utf8')
const babelrc = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/.babelrc'), 'utf8'))
babelrc.ast = false

fs.writeFileSync(parserPath, babel.transform(
  '// @flow weak\n' +
  parserSrc.replace(
    `module.exports = {\n` +
    `  SyntaxError: peg$SyntaxError,\n` +
    `  parse:       peg$parse\n` +
    `};`,
    'export const SyntaxError = peg$SyntaxError\n' +
    'export const parse = peg$parse\n' +
    `export default {\n` +
    `  SyntaxError: peg$SyntaxError,\n` +
    `  parse:       peg$parse\n` +
    `}`
  ).replace(
    `function peg$parse(input, options) {`,
    `function peg$parse(input: string, options?: Object): ODataAST {`
  ).replace(
    `function peg$computePosDetails(pos) {`,
    `function peg$computePosDetails(pos: number) {`
  ) + '\n\n' +
  types.replace(
    '// @flow',
    ''
  ).replace(
    /export type/g,
    'type'
  ) + '\n'
, babelrc).code.replace(
  `function peg$parse(input: string, options?: Object): ODataAST {`,
  `function peg$parse(input /*: string */, options /*:: ?: Object */) /*: ODataAST */ {`
).replace(
  `function peg$computePosDetails(pos: number) {`,
  `function peg$computePosDetails(pos /*: number */) {`
).replace(
  `var ODataAST = _flowRuntime2`,
  `var ODataAST1 = (function () {\nvar ODataAST = _flowRuntime2`
).replace(
  `return ODataAST;`,
  `return ODataAST1`
).replace(
  `exports.parse = exports.SyntaxError = undefined;\n`,
  `// $FlowFixMe`
) +
`return ODataAST\n})()` +
types.replace(
  '// @flow',
  '\n\n/*::'
) + '*/\n')
