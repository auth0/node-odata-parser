// @flow
/*:: import type { ODataAST } from '../src/odata.types.js' */
/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

// TODO:  we really should have more tests for the $expand

describe('$expand query option', function () {
  it('should parse $expand and return an array of identifier paths', function () {
    var ast = parser.parse('$expand=Category,Products/Suppliers,Items($expand=ItemRatings;$select=ItemDetails;$search="foo")')
    const expected /*: ODataAST */ = {
      '$expand':
       [ { path: 'Category', options: {} },
         { path: 'Products/Suppliers', options: {} },
         { path: 'Items',
           options:
            { '$expand': [ { path: 'ItemRatings', options: {} } ],
              '$select': [ 'ItemDetails' ],
              '$search': 'foo' } } ] }

    assert.deepEqual(ast, expected)
  })

  it('should not allow duplicate expand paths', function () {
    var ast = parser.parse('$expand=ItemRatings,ItemRatings')
    const expected /*: ODataAST */ = { error: 'duplicate $expand navigationProperty' }
    assert.deepEqual(ast, expected)
  })

  it('should not allow duplicate expand options', function () {
    var ast = parser.parse('$expand=Category,Products/Suppliers,Items($select=ItemDetails;$select=SomethingElse)')
    const expected /*: ODataAST */ = { error: '$select cannot exist more than once in $expand' }
    assert.deepEqual(ast, expected)
  })
})
