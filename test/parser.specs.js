// @flow
/*:: import type { ODataAST } from '../src/odata.types.js' */
/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('odata.parser grammar', function () {
  it('should not allow duplicate OData query options', function () {
    var ast = parser.parse('$select=lanetix/id,name&$select=some_other_field')
    var expected /*: ODataAST */ = { error: '$select cannot exist more than once in query string' }
    assert.deepEqual(ast, expected)
  })

  it('should parse $top and return the value', function () {
    var ast = parser.parse('$top=40')
    var expected /*: ODataAST */ = { '$top': 40 }
    assert.deepEqual(ast, expected)
  })

  it('should parse two params', function () {
    var ast = parser.parse('$top=4&$skip=5')
    var expected /*: ODataAST */ = { '$top': 4, '$skip': 5 }
    assert.deepEqual(ast, expected)
  })

  it('should parse three params', function () {
    var ast = parser.parse('$top=4&$skip=5&$select=Rating')
    var expected /*: ODataAST */ = { '$top': 4, '$skip': 5, '$select': [ 'Rating' ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse string params', function () {
    var ast = parser.parse('$select=Rating')
    var expected /*: ODataAST */ = { '$select': [ 'Rating' ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse single character identifiers', function () {
    var ast = parser.parse('$select=a,b')
    var expected /*: ODataAST */ = { '$select': [ 'a', 'b' ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse order by', function () {
    var ast = parser.parse('$orderby=ReleaseDate desc, Rating')
    var expected /*: ODataAST */ = { '$orderby': [ { ReleaseDate: 'desc' }, { Rating: 'asc' } ] }
    assert.deepEqual(ast, expected)
  })

  it('should allow only valid values for $count', function () {
    var ast = parser.parse('$count=true')
    var expected /*: ODataAST */ = { '$count': true }
    assert.deepEqual(ast, expected)

    var ast1 = parser.parse('$count=false')
    var expected1 /*: ODataAST */ = { '$count': false }
    assert.deepEqual(ast1, expected1)

    var ast2 = parser.parse('$count=')
    var expected2 /*: ODataAST */ = { error: 'invalid $count parameter' }
    assert.deepEqual(ast2, expected2)

    var ast3 = parser.parse('$count=test')
    var expected3 /*: ODataAST */ = { error: 'invalid $count parameter' }
    assert.deepEqual(ast3, expected3)
  })

  it('should parse $format okay', function () {
    var ast = parser.parse('$format=application/atom+xml')
    var expected /*: ODataAST */ = { '$format': 'application/atom+xml' }
    assert.deepEqual(ast, expected)

    var ast2 = parser.parse('$format=')
    var expected2 /*: ODataAST */ = { error: 'invalid $format parameter' }
    assert.deepEqual(ast2, expected2)
  })

  it('should parse $search okay', function () {
    var ast = parser.parse('$search="foo bar baz"')
    var expected /*: ODataAST */ = { '$search': 'foo bar baz' }
    assert.deepEqual(ast, expected)

    var ast2 = parser.parse(`$search='Dell "plan b"'`)
    var expected2 /*: ODataAST */ = { '$search': 'Dell "plan b"' }
    assert.deepEqual(ast2, expected2)

    var ast3 = parser.parse('$search=')
    var expected3 /*: ODataAST */ = { error: 'invalid $search parameter' }
    assert.deepEqual(ast3, expected3)
  })

  it('should parse $callback', function () {
    var ast = parser.parse(`$callback=jQuery191039675481244921684_1424879147656`)
    var expected /*: ODataAST */ = { '$callback': 'jQuery191039675481244921684_1424879147656' }
    assert.deepEqual(ast, expected)
  })
})

describe('odata path parser grammar', function () {
  it('should parse single resource', function () {
    var ast = parser.parse('Customers')
    var expected /*: ODataAST */ = { '$path': [ { name: 'Customers' } ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse resource with literal predicate', function () {
    var ast = parser.parse('Customers(1)')
    var expected /*: ODataAST */ = { '$path':
     [ { name: 'Customers',
         predicates: [ { type: 'literal', literalType: 'integer', value: 1 } ] } ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse resource with property predicate', function () {
    var ast = parser.parse('Customers(CustomerID=1)')
    var expected /*: ODataAST */ = { '$path':
     [ { name: 'Customers',
         predicates: [ { type: 'property', name: 'CustomerID', value: 1 } ] } ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse resource with two property predicates', function () {
    var ast = parser.parse(`Customers(CustomerID=1,ContactName='Joe')`)
    var expected /*: ODataAST */ = { '$path':
     [ { name: 'Customers',
         predicates:
          [ { type: 'property', name: 'CustomerID', value: 1 },
            { type: 'property', name: 'ContactName', value: 'Joe' } ] } ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse two resources', function () {
    var ast = parser.parse('Customers(1)/ContactName')
    var expected /*: ODataAST */ = { '$path':
     [ { name: 'Customers',
         predicates: [ { type: 'literal', literalType: 'integer', value: 1 } ] },
       { name: 'ContactName' } ] }
    assert.deepEqual(ast, expected)
  })

  it('should parse resources starting with $', function () {
    var ast = parser.parse('Customers(1)/$value')
    var expected /*: ODataAST */ = { '$path':
     [ { name: 'Customers',
         predicates: [ { type: 'literal', literalType: 'integer', value: 1 } ] },
       { name: '$value' } ] }
    assert.deepEqual(ast, expected)

    var ast1 = parser.parse('Customers/$count')
    var expected1 /*: ODataAST */ = { '$path': [ { name: 'Customers' }, { name: '$count' } ] }
    assert.deepEqual(ast1, expected1)
  })
})

describe('odata path and query parser grammar', function () {
  it('should parse both path and query', function () {
    var ast = parser.parse('Customers?$top=10')
    var expected /*: ODataAST */ = { '$top': 10, '$path': [ { name: 'Customers' } ] }
    assert.deepEqual(ast, expected)
  })
})
