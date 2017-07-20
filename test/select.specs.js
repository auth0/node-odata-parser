// @flow
/*:: import type { ODataAST } from '../src/odata.types.js' */
/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('$select query option', function () {
  it('should accept * in $select', function () {
    var ast = parser.parse('$select=*')
    var expected /*: ODataAST */ = { '$select': [ '*' ] }
    assert.deepEqual(ast, expected)
  })

  it('should accept * and , and / in $select', function () {
    var ast = parser.parse('$select=*,Category/Name')
    var expected /*: ODataAST */ = { '$select': [ '*', 'Category/Name' ] }
    assert.deepEqual(ast, expected)
  })

  it('should accept more than two fields', function () {
    var ast = parser.parse('$select=Rating, Name,LastName')
    var expected /*: ODataAST */ = { '$select': [ 'Rating', 'Name', 'LastName' ] }
    assert.deepEqual(ast, expected)
  })

  // This select parameter is not currently supported.
  it('should accept * after . in $select', function () {
    var ast = parser.parse('$select=DemoService.*')
    var expected /*: ODataAST */ = { '$select': [ 'DemoService.*' ] }
    assert.deepEqual(ast, expected)
  })
})
