/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('$select query option', function () {
  it('should accept * in $select', function () {
    var ast = parser.parse('$select=*')

    assert.equal(ast.$select[0], '*')
  })

  it('should accept * and , and / in $select', function () {
    var ast = parser.parse('$select=*,Category/Name')

    assert.equal(ast.$select[0], '*')
    assert.equal(ast.$select[1], 'Category/Name')
  })

  it('should accept more than two fields', function () {
    var ast = parser.parse('$select=Rating, Name,LastName')

    assert.equal(ast.$select[0], 'Rating')
    assert.equal(ast.$select[1], 'Name')
    assert.equal(ast.$select[2], 'LastName')
  })

  // This select parameter is not currently supported.
  it('should accept * after . in $select', function () {
    var ast = parser.parse('$select=DemoService.*')

    assert.equal(ast.$select[0], 'DemoService.*')
  })
})
