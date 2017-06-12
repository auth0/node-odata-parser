/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('odata.parser grammar', function () {
  it('should parse $top and return the value', function () {
    var ast = parser.parse('$top=40')

    assert.equal(ast.$top, 40)
  })

  it('should parse two params', function () {
    var ast = parser.parse('$top=4&$skip=5')

    assert.equal(ast.$top, 4)
    assert.equal(ast.$skip, 5)
  })

  it('should parse three params', function () {
    var ast = parser.parse('$top=4&$skip=5&$select=Rating')

    assert.equal(ast.$top, 4)
    assert.equal(ast.$skip, 5)
    assert.equal(ast.$select[0], 'Rating')
  })

  it('should parse string params', function () {
    var ast = parser.parse('$select=Rating')

    assert.equal(ast.$select[0], 'Rating')
  })

  it('should parse single character identifiers', function () {
    var ast = parser.parse('$select=a,b')

    assert.equal(ast.$select[0], 'a')
    assert.equal(ast.$select[1], 'b')
  })

  it('should parse order by', function () {
    var ast = parser.parse('$orderby=ReleaseDate desc, Rating')

    assert.equal(ast.$orderby[0].ReleaseDate, 'desc')
    assert.equal(ast.$orderby[1].Rating, 'asc')
  })

  it('should allow only valid values for $count', function () {
    var ast = parser.parse('$count=true')
    assert.equal(ast.$count, true)

    ast = parser.parse('$count=false')
    assert.equal(ast.$count, false)

    ast = parser.parse('$count=')
    assert.equal(ast.error, 'invalid $count parameter')

    ast = parser.parse('$count=test')
    assert.equal(ast.error, 'invalid $count parameter')
  })

  it('should parse $format okay', function () {
    var ast = parser.parse('$format=application/atom+xml')
    assert.equal(ast.$format, 'application/atom+xml')

    ast = parser.parse('$format=')
    assert.equal(ast.error, 'invalid $format parameter')
  })

  it('should parse $search okay', function () {
    var ast = parser.parse('$search="foo bar baz"')
    assert.equal(ast.$search, 'foo bar baz')

    ast = parser.parse(`$search='Dell "plan b"'`)
    assert.equal(ast.$search, 'Dell "plan b"')

    ast = parser.parse('$search=')
    assert.equal(ast.error, 'invalid $search parameter')
  })

  it('should parse $callback', function () {
    var ast = parser.parse(`$callback=jQuery191039675481244921684_1424879147656`)
    assert.equal(ast.$callback, 'jQuery191039675481244921684_1424879147656')
  })
})

describe('odata path parser grammar', function () {
  it('should parse single resource', function () {
    var ast = parser.parse('Customers')
    assert.equal(ast.$path[0].name, 'Customers')
  })

  it('should parse resource with literal predicate', function () {
    var ast = parser.parse('Customers(1)')
    assert.equal(ast.$path[0].name, 'Customers')
    assert.equal(ast.$path[0].predicates[0].type, 'literal')
    assert.equal(ast.$path[0].predicates[0].value, 1)
  })

  it('should parse resource with property predicate', function () {
    var ast = parser.parse('Customers(CustomerID=1)')
    assert.equal(ast.$path[0].name, 'Customers')
    assert.equal(ast.$path[0].predicates[0].type, 'property')
    assert.equal(ast.$path[0].predicates[0].name, 'CustomerID')
    assert.equal(ast.$path[0].predicates[0].value, 1)
  })

  it('should parse resource with two property predicates', function () {
    var ast = parser.parse('Customers(CustomerID=1,ContactName=\'Joe\')')
    assert.equal(ast.$path[0].name, 'Customers')
    assert.equal(ast.$path[0].predicates[0].type, 'property')
    assert.equal(ast.$path[0].predicates[0].name, 'CustomerID')
    assert.equal(ast.$path[0].predicates[0].value, 1)
    assert.equal(ast.$path[0].predicates[1].type, 'property')
    assert.equal(ast.$path[0].predicates[1].name, 'ContactName')
    assert.equal(ast.$path[0].predicates[1].value, 'Joe')
  })

  it('should parse two resources', function () {
    var ast = parser.parse('Customers(1)/ContactName')
    assert.equal(ast.$path[0].name, 'Customers')
    assert.equal(ast.$path[1].name, 'ContactName')
  })

  it('should parse resources starting with $', function () {
    var ast = parser.parse('Customers(1)/$value')
    assert.equal(ast.$path[1].name, '$value')
    var ast1 = parser.parse('Customers/$count')
    assert.equal(ast1.$path[1].name, '$count')
  })
})

describe('odata path and query parser grammar', function () {
  it('should parse both path and query', function () {
    var ast = parser.parse('Customers?$top=10')
    assert.equal(ast.$path[0].name, 'Customers')
    assert.equal(ast.$top, 10)
  })
})
