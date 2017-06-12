/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

// TODO:  we really should have more tests for the $expand

describe('$expand query option', function () {
  it('should parse $expand and return an array of identifier paths', function () {
    var ast = parser.parse('$expand=Category,Products/Suppliers,Items($expand=ItemRatings;$select=ItemDetails;$search="foo")')
    assert.equal(ast.$expand[0].path, 'Category')
    assert.equal(ast.$expand[1].path, 'Products/Suppliers')
    assert.equal(ast.$expand[2].path, 'Items')
    assert.equal(ast.$expand[2].options.$expand[0].path, 'ItemRatings')
    assert.equal(ast.$expand[2].options.$select[0], 'ItemDetails')
    assert.equal(ast.$expand[2].options.$search, 'foo')
  })

  it('should not allow duplicate expand paths', function () {
    var ast = parser.parse('$expand=ItemRatings,ItemRatings')
    assert.equal(ast.error, 'duplicate $expand navigationProperty')
  })
})
