// @flow
/*:: import type { ODataAST } from '../src/odata.types.js' */
/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('$filter query option', function () {
  it('should parse $filter', function () {
    var ast = parser.parse(`$filter=Name eq 'Jef'`)
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'Name' },
       right: { type: 'literal', literalType: 'string', value: 'Jef' } } }

    assert.deepEqual(ast, expected)
  })

  it('should parse $filter containing quote', function () {
    var ast = parser.parse(`$filter=Name eq 'O''Neil'`)
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'Name' },
       right: { type: 'literal', literalType: 'string', value: 'O\'Neil' } } }

    assert.deepEqual(ast, expected)
  })

  it('should parse $filter with subproperty', function () {
    var ast = parser.parse(`$filter=User/Name eq 'Jef'`)
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'User/Name' },
       right: { type: 'literal', literalType: 'string', value: 'Jef' } } }

    assert.deepEqual(ast, expected)
  })

  it('should parse multiple conditions in a $filter', function () {
    var ast = parser.parse(`$filter=Name eq 'John' and LastName lt 'Doe'`)
    var expected /*: ODataAST */ = { '$filter':
     { type: 'and',
       left:
        { type: 'eq',
          left: { type: 'property', name: 'Name' },
          right: { type: 'literal', literalType: 'string', value: 'John' } },
       right:
        { type: 'lt',
          left: { type: 'property', name: 'LastName' },
          right: { type: 'literal', literalType: 'string', value: 'Doe' } } } }

    assert.deepEqual(ast, expected)
  })

  describe('parsing functioncall nodes', function () {
    it('should parse substringof $filter', function () {
      var ast = parser.parse(`$filter=substringof('nginx', Data)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'substringof',
         args:
          [ { type: 'literal', literalType: 'string', value: 'nginx' },
            { type: 'property', name: 'Data' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse substringof $filter with empty string', function () {
      var ast = parser.parse(`$filter=substringof('', Data)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'substringof',
         args:
          [ { type: 'literal', literalType: 'string', value: '' },
            { type: 'property', name: 'Data' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse substringof $filter with string containing quote', function () {
      var ast = parser.parse(`$filter=substringof('ng''inx', Data)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'substringof',
         args:
          [ { type: 'literal', literalType: 'string', value: 'ng\'inx' },
            { type: 'property', name: 'Data' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse substringof $filter with string starting with quote', function () {
      var ast = parser.parse(`$filter=substringof('''nginx', Data)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'substringof',
         args:
          [ { type: 'literal', literalType: 'string', value: '\'nginx' },
            { type: 'property', name: 'Data' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse substringof $filter with string ending with quote', function () {
      var ast = parser.parse(`$filter=substringof('nginx''', Data)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'substringof',
         args:
          [ { type: 'literal', literalType: 'string', value: 'nginx\'' },
            { type: 'property', name: 'Data' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse substringof eq true in $filter', function () {
      var ast = parser.parse(`$filter=substringof('nginx', Data) eq true`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left:
          { type: 'functioncall',
            func: 'substringof',
            args:
             [ { type: 'literal', literalType: 'string', value: 'nginx' },
               { type: 'property', name: 'Data' } ] },
         right: { type: 'literal', literalType: 'boolean', value: true } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse startswith $filter', function () {
      var ast = parser.parse(`$filter=startswith('nginx', Data)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'startswith',
         args:
          [ { type: 'literal', literalType: 'string', value: 'nginx' },
            { type: 'property', name: 'Data' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse startswith $filter', function () {
      var ast = parser.parse(`$filter=contains(Data, 'nginx')`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'functioncall',
         func: 'contains',
         args:
          [ { type: 'property', name: 'Data' },
            { type: 'literal', literalType: 'string', value: 'nginx' } ] } }

      assert.deepEqual(ast, expected)
    })

    it('should parse any(lambdaFunc) eq true $filter', function () {
      var ast = parser.parse(`$filter=linked_table/any_num_hops/string_list/any(list_item:list_item eq 'test') eq true`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left:
          { type: 'functioncall',
            func: 'any',
            args:
             [ { type: 'property',
                 name: 'linked_table/any_num_hops/string_list' },
               { type: 'lambda',
                 args:
                  [ { type: 'property', name: 'list_item' },
                    { type: 'eq',
                      left: { type: 'property', name: 'list_item' },
                      right: { type: 'literal', literalType: 'string', value: 'test' } } ] } ] },
         right: { type: 'literal', literalType: 'boolean', value: true } } }

      assert.deepEqual(ast, expected)
    });

    it('should parse all(lambdaFunc) eq true $filter', function () {
      var ast = parser.parse(`$filter=linked_table/any_num_hops/string_list/all(list_item:list_item eq 'test') eq true`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left:
          { type: 'functioncall',
            func: 'all',
            args:
             [ { type: 'property',
                 name: 'linked_table/any_num_hops/string_list' },
               { type: 'lambda',
                 args:
                  [ { type: 'property', name: 'list_item' },
                    { type: 'eq',
                      left: { type: 'property', name: 'list_item' },
                      right: { type: 'literal', literalType: 'string', value: 'test' } } ] } ] },
         right: { type: 'literal', literalType: 'boolean', value: true } } }

      assert.deepEqual(ast, expected)
    });

    ['tolower', 'toupper', 'trim'].forEach(function (func /*: 'tolower' | 'toupper' | 'trim' */) {
      it(`should parse ${func} $filter`, function () {
        var ast = parser.parse(`$filter=${func}(value) eq 'test'`)
        var expected /*: ODataAST */ = { '$filter':
         { type: 'eq',
           left:
            { type: 'functioncall',
              func: func,
              args: [ { type: 'property', name: 'value' } ] },
           right: { type: 'literal', literalType: 'string', value: 'test' } } }

        assert.deepEqual(ast, expected)
      })
    });

    ['year', 'month', 'day', 'hour', 'minute', 'second'].forEach(function (func /*: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' */) {
      it(`should parse ${func} $filter`, function () {
        var ast = parser.parse(`$filter=${func}(value) gt 0`)
        var expected /*: ODataAST */ = { '$filter':
         { type: 'gt',
           left:
            { type: 'functioncall',
              func: func,
              args: [ { type: 'property', name: 'value' } ] },
           right: { type: 'literal', literalType: 'integer', value: 0 } } }

        assert.deepEqual(ast, expected)
      })
    });

    ['indexof', 'concat', 'substring', 'replace'].forEach(function (func /*: 'indexof' | 'concat' | 'substring' | 'replace' */) {
      it(`should parse ${func} $filter`, function () {
        var ast = parser.parse(`$filter=${func}('haystack', needle) eq 'test'`)
        var expected /*: ODataAST */ = { '$filter':
         { type: 'eq',
           left:
            { type: 'functioncall',
              func: func,
              args:
               [ { type: 'literal', literalType: 'string', value: 'haystack' },
                 { type: 'property', name: 'needle' } ] },
           right: { type: 'literal', literalType: 'string', value: 'test' } } }

        assert.deepEqual(ast, expected)
      })
    })
  })

  it('should return an error if invalid value', function () {
    var ast = parser.parse('$top=foo')
    var expected /*: ODataAST */ = { error: 'invalid $top parameter' }

    assert.deepEqual(ast, expected)
  })

  it('should parse boolean okay', function () {
    var ast = parser.parse('$filter=status eq true')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'boolean', value: true } } }

    assert.deepEqual(ast, expected)

    var ast1 = parser.parse('$filter=status eq false')
    var expected1 /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'boolean', value: false } } }

    assert.deepEqual(ast1, expected1)
  })

  it('should parse numbers okay', function () {
    var ast = parser.parse('$filter=status eq 3')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'integer', value: 3 } } }

    assert.deepEqual(ast, expected)

    // Test multiple digits - problem of not joining digits to array
    var ast1 = parser.parse('$filter=status eq 34')
    var expected1 /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'integer', value: 34 } } }

    assert.deepEqual(ast1, expected1)

    // Test number starting with 1 - problem of boolean rule order
    var ast2 = parser.parse('$filter=status eq 12')
    var expected2 /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'integer', value: 12 } } }

    assert.deepEqual(ast2, expected2)
  })

  it('should parse negative numbers okay', function () {
    var ast = parser.parse('$filter=status eq -3')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'integer', value: -3 } } }

    assert.deepEqual(ast, expected)

    var ast1 = parser.parse('$filter=status eq -34')
    var expected1 /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'integer', value: -34 } } }

    assert.deepEqual(ast1, expected1)
  })

  it('should parse decimal numbers okay', function () {
    var ast = parser.parse('$filter=status eq 3.4')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'decimal', value: '3.4' } } }

    assert.deepEqual(ast, expected)

    var ast1 = parser.parse('$filter=status eq -3.4')
    var expected1 /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'decimal', value: '-3.4' } } }

    assert.deepEqual(ast1, expected1)
  })

  it('should parse NaN into literalType Nan (mapper then handles)', function () {
    var ast = parser.parse('$filter=status eq NaN')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'status' },
       right: { type: 'literal', literalType: 'NaN/Infinity', value: 'NaN' } } }

    assert.deepEqual(ast, expected)
  })

  describe('using cast', function () {
    it('should parse cast(time) okay', function () {
      var ast = parser.parse(`$filter=time eq cast('00:24:55.3454', Edm.TimeOfDay)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal',
                 literalType: 'timeOfDay',
                 value: '00:24:55.3454' },
               'Edm.TimeOfDay' ] } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse cast(date) okay', function () {
      var ast = parser.parse(`$filter=time eq cast('1900-01-01', Edm.Date)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal', literalType: 'date', value: '1900-01-01' },
               'Edm.Date' ] } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse cast(dateTimeOffset) okay', function () {
      var ast = parser.parse(`$filter=time eq cast('1900-01-01T00:24Z', Edm.DateTimeOffset)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal',
                 literalType: 'dateTimeOffset',
                 value: '1900-01-01T00:24Z' },
               'Edm.DateTimeOffset' ] } } }

      assert.deepEqual(ast, expected)

      var ast1 = parser.parse(`$filter=time eq cast('1900-01-01T00:24+12:00', Edm.DateTimeOffset)`)
      var expected1 /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal',
                 literalType: 'dateTimeOffset',
                 value: '1900-01-01T00:24+12:00' },
               'Edm.DateTimeOffset' ] } } }

      assert.deepEqual(ast1, expected1)
    })

    it('should parse cast(dateTimeOffset) to a date, time, or string', function () {
      var ast = parser.parse(`$filter=time eq cast('1900-01-01T00:24Z', Edm.Date)`)
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal',
                 literalType: 'dateTimeOffset',
                 value: '1900-01-01T00:24Z' },
               'Edm.Date' ] } } }

      assert.deepEqual(ast, expected)

      var ast1 = parser.parse(`$filter=time eq cast('1900-01-01T00:24+12:00', Edm.TimeOfDay)`)
      var expected1 /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal',
                 literalType: 'dateTimeOffset',
                 value: '1900-01-01T00:24+12:00' },
               'Edm.TimeOfDay' ] } } }

      assert.deepEqual(ast1, expected1)

      var ast2 = parser.parse(`$filter=time eq cast('1900-01-01T00:24+12:00', Edm.String)`)
      var expected2 /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal',
                 literalType: 'dateTimeOffset',
                 value: '1900-01-01T00:24+12:00' },
               'Edm.String' ] } } }

      assert.deepEqual(ast2, expected2)
    })

    it('should parse cast(int) to a decimal', function () {
      var ast = parser.parse('$filter=time eq cast(234, Edm.Decimal)')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal', literalType: 'integer', value: 234 },
               'Edm.Decimal' ] } } }

      assert.deepEqual(ast, expected)
    })

    it('Should throw if attempting to cast a decimal to an int', function () {
      assert.throws(() => parser.parse('$filter=time eq cast(2343.54, Edm.Int32)'), parser.SyntaxError)
    })

    it('should parse cast(everything) to a string', function () {
      var ast = parser.parse('$filter=time eq cast(234, Edm.String)')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal', literalType: 'integer', value: 234 },
               'Edm.String' ] } } }

      assert.deepEqual(ast, expected)

      var ast2 = parser.parse('$filter=time eq cast(234.45, Edm.String)')

      var expected2 /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal', literalType: 'decimal', value: '234.45' },
               'Edm.String' ] } } }


      assert.deepEqual(ast2, expected2)

      var ast3 = parser.parse('$filter=time eq cast(true, Edm.String)')

      var expected3 /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'time' },
         right:
          { type: 'cast',
            args:
             [ { type: 'literal', literalType: 'boolean', value: true },
               'Edm.String' ] } } }

      assert.deepEqual(ast3, expected3)
    })

    it('should return an error if attempting to cast a property', function () {
      var ast = parser.parse('$filter=cast(time, Edm.String) eq 23')
      var expected /*: ODataAST */ = { error: 'invalid $filter parameter' }
      assert.deepEqual(ast, expected)
    })
  })

  it('should parse cond with eq|le|ge|lt|gt as the root, with the mathOp as the subtree', function () {
    var ast = parser.parse('$filter=( 38 sub ( 83 add ( 8 mod 2 ) ) ) eq ( ( 2 mul 4 ) div 33 )')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left:
        { type: 'sub',
          left: { type: 'literal', literalType: 'integer', value: 38 },
          right:
           { type: 'add',
             left: { type: 'literal', literalType: 'integer', value: 83 },
             right:
              { type: 'mod',
                left: { type: 'literal', literalType: 'integer', value: 8 },
                right: { type: 'literal', literalType: 'integer', value: 2 } } } },
       right:
        { type: 'div',
          left:
           { type: 'mul',
             left: { type: 'literal', literalType: 'integer', value: 2 },
             right: { type: 'literal', literalType: 'integer', value: 4 } },
          right: { type: 'literal', literalType: 'integer', value: 33 } } } }

    assert.deepEqual(ast, expected)
  })

  it('should have math operator precedence', function () {
    var ast = parser.parse('$filter=38 sub 83 mod 2 add 8 mul ( 2 add 3 ) eq 2 div 4 add 3')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left:
        { type: 'sub',
          left: { type: 'literal', literalType: 'integer', value: 38 },
          right:
           { type: 'add',
             left:
              { type: 'mod',
                left: { type: 'literal', literalType: 'integer', value: 83 },
                right: { type: 'literal', literalType: 'integer', value: 2 } },
             right:
              { type: 'mul',
                left: { type: 'literal', literalType: 'integer', value: 8 },
                right:
                 { type: 'add',
                   left: { type: 'literal', literalType: 'integer', value: 2 },
                   right: { type: 'literal', literalType: 'integer', value: 3 } } } } },
       right:
        { type: 'add',
          left:
           { type: 'div',
             left: { type: 'literal', literalType: 'integer', value: 2 },
             right: { type: 'literal', literalType: 'integer', value: 4 } },
          right: { type: 'literal', literalType: 'integer', value: 3 } } } }

    assert.deepEqual(ast, expected)
  })

  describe('using identifer.unit()', function () {
    it('should parse identifer.unit in math equation', function () {
      var ast = parser.parse('$filter=( birthday.month() sub 1 ) eq 7')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left:
          { type: 'sub',
            left: { type: 'property', name: 'birthday', unit: 'month' },
            right: { type: 'literal', literalType: 'integer', value: 1 } },
         right: { type: 'literal', literalType: 'integer', value: 7 } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse identifer.unit now.unit for last month ', function () {
      var ast = parser.parse('$filter=birthday.month() eq ( now().month() sub 1 )')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'birthday', unit: 'month' },
         right:
          { type: 'sub',
            left: { type: 'now', unit: 'month' },
            right: { type: 'literal', literalType: 'integer', value: 1 } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse identifer.unit now.unit for last quarter ', function () {
      var ast = parser.parse('$filter=birthday.quarter() eq ( now().quarter() sub 1 )')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'birthday', unit: 'quarter' },
         right:
          { type: 'sub',
            left: { type: 'now', unit: 'quarter' },
            right: { type: 'literal', literalType: 'integer', value: 1 } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse identifer.unit now.unit for last week, with identifierPath ', function () {
      var ast = parser.parse('$filter=related/related/created_at.week() eq ( now().week() sub 1 )')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left:
          { type: 'property',
            name: 'related/related/created_at',
            unit: 'week' },
         right:
          { type: 'sub',
            left: { type: 'now', unit: 'week' },
            right: { type: 'literal', literalType: 'integer', value: 1 } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse identifer.unit now.unit for next month ', function () {
      var ast = parser.parse('$filter=birthday.month() eq ( now().month() add 1 )')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'birthday', unit: 'month' },
         right:
          { type: 'add',
            left: { type: 'now', unit: 'month' },
            right: { type: 'literal', literalType: 'integer', value: 1 } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse identifer.unit now.unit for this month ', function () {
      var ast = parser.parse('$filter=birthday.month() eq now().month()')
      var expected /*: ODataAST */ = { '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'birthday', unit: 'month' },
         right: { type: 'now', unit: 'month' } } }

      assert.deepEqual(ast, expected)
    })
  })

  it('should parse parameterAliasIdentifier', function () {
    var ast = parser.parse('$filter=closingDate eq @lx_myUser_Id')
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left: { type: 'property', name: 'closingDate' },
       right:
        { type: 'literal',
          literalType: 'parameter-alias',
          value: '@lx_myUser_Id' } } }

    assert.deepEqual(ast, expected)
  })

  it('should parse long paths in $filter conditions', function () {
    var ast = parser.parse(`$filter=publisher/president/likes/author/firstname eq 'John'`)
    var expected /*: ODataAST */ = { '$filter':
     { type: 'eq',
       left:
        { type: 'property',
          name: 'publisher/president/likes/author/firstname' },
       right: { type: 'literal', literalType: 'string', value: 'John' } } }

    assert.deepEqual(ast, expected)
  })

  describe('should be able to handle filter groups created by the legacy Lx condition-builder', function () {
    it('should parse a group of ORs inside ANDs', function () {
      var ast = parser.parse(`$filter=(name eq 'ace' or name eq 'johnson') and (bass eq 'abc' or telephone_number eq 899999999)&$select=name`)
      var expected /*: ODataAST */ = { '$select': [ 'name' ], '$filter':
       { type: 'and',
         left:
          { type: 'or',
            left:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'ace' } },
            right:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'johnson' } } },
         right:
          { type: 'or',
            left:
             { type: 'eq',
               left: { type: 'property', name: 'bass' },
               right: { type: 'literal', literalType: 'string', value: 'abc' } },
            right:
             { type: 'eq',
               left: { type: 'property', name: 'telephone_number' },
               right: { type: 'literal', literalType: 'integer', value: 899999999 } } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse a group of ANDs inside ORs', function () {
      var ast = parser.parse(`$filter=(name eq 'ace' and name eq 'johnson') or (telephone_number eq 999999999 and telephone_number eq 899999999 and telephone_number ne 2342)&$select=name`)
      var expected /*: ODataAST */ = { '$select': [ 'name' ], '$filter':
       { type: 'or',
         left:
          { type: 'and',
            left:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'ace' } },
            right:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'johnson' } } },
         right:
          { type: 'and',
            left:
             { type: 'eq',
               left: { type: 'property', name: 'telephone_number' },
               right: { type: 'literal', literalType: 'integer', value: 999999999 } },
            right:
             { type: 'and',
               left:
                { type: 'eq',
                  left: { type: 'property', name: 'telephone_number' },
                  right: { type: 'literal', literalType: 'integer', value: 899999999 } },
               right:
                { type: 'ne',
                  left: { type: 'property', name: 'telephone_number' },
                  right: { type: 'literal', literalType: 'integer', value: 2342 } } } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse a single group, with a single AND', function () {
      var ast = parser.parse(`$filter=( nullable_string ne null and telephone_number eq 999999999 )&$select=name`)
      var expected /*: ODataAST */ = { '$select': [ 'name' ], '$filter':
       { type: 'and',
         left:
          { type: 'ne',
            left: { type: 'property', name: 'nullable_string' },
            right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } },
         right:
          { type: 'eq',
            left: { type: 'property', name: 'telephone_number' },
            right: { type: 'literal', literalType: 'integer', value: 999999999 } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse a single group, with a single OR', function () {
      var ast = parser.parse(`$filter=( nullable_string ne null or telephone_number eq 999999999 )&$select=name`)
      var expected /*: ODataAST */ = { '$select': [ 'name' ], '$filter':
       { type: 'or',
         left:
          { type: 'ne',
            left: { type: 'property', name: 'nullable_string' },
            right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } },
         right:
          { type: 'eq',
            left: { type: 'property', name: 'telephone_number' },
            right: { type: 'literal', literalType: 'integer', value: 999999999 } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse a single group, with a single condition', function () {
      var ast = parser.parse(`$filter=(name eq 'Klay Thompson' )&$select=name`)
      var expected /*: ODataAST */ = { '$select': [ 'name' ], '$filter':
       { type: 'eq',
         left: { type: 'property', name: 'name' },
         right:
          { type: 'literal',
            literalType: 'string',
            value: 'Klay Thompson' } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse groups of single-condition|ORs|many-ORs, with parent ANDs', function () {
      var ast = parser.parse(`$select=name&$orderby=name asc&$filter=(telephone_number eq 2737560) and (name eq 'Antwan' or name eq 'Wimberly') and (telephone_number eq 2731143 or telephone_number eq 2751056 or telephone_number eq 9999999 or telephone_number eq 1222234)`)
      var expected /*: ODataAST */ = {
        '$select': [ 'name' ],
        '$orderby': [ { name: 'asc' } ],
        '$filter':
         { type: 'and',
           left:
            { type: 'eq',
              left: { type: 'property', name: 'telephone_number' },
              right: { type: 'literal', literalType: 'integer', value: 2737560 } },
           right:
            { type: 'and',
              left:
               { type: 'or',
                 left:
                  { type: 'eq',
                    left: { type: 'property', name: 'name' },
                    right: { type: 'literal', literalType: 'string', value: 'Antwan' } },
                 right:
                  { type: 'eq',
                    left: { type: 'property', name: 'name' },
                    right: { type: 'literal', literalType: 'string', value: 'Wimberly' } } },
              right:
               { type: 'or',
                 left:
                  { type: 'eq',
                    left: { type: 'property', name: 'telephone_number' },
                    right: { type: 'literal', literalType: 'integer', value: 2731143 } },
                 right:
                  { type: 'or',
                    left:
                     { type: 'eq',
                       left: { type: 'property', name: 'telephone_number' },
                       right: { type: 'literal', literalType: 'integer', value: 2751056 } },
                    right:
                     { type: 'or',
                       left:
                        { type: 'eq',
                          left: { type: 'property', name: 'telephone_number' },
                          right: { type: 'literal', literalType: 'integer', value: 9999999 } },
                       right:
                        { type: 'eq',
                          left: { type: 'property', name: 'telephone_number' },
                          right: { type: 'literal', literalType: 'integer', value: 1222234 } } } } } } } }

      assert.deepEqual(ast, expected)
    })

    it('should parse groups of ANDs|ORs, with parent ORs', function () {
      var ast = parser.parse(`$filter=(name eq 'ace' or name eq 'johnson' or name eq 'large') or (name eq 'spade' and name eq 'fageo soda')&$select=name`)
      var expected /*: ODataAST */ = { '$select': [ 'name' ], '$filter':
       { type: 'or',
         left:
          { type: 'or',
            left:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'ace' } },
            right:
             { type: 'or',
               left:
                { type: 'eq',
                  left: { type: 'property', name: 'name' },
                  right: { type: 'literal', literalType: 'string', value: 'johnson' } },
               right:
                { type: 'eq',
                  left: { type: 'property', name: 'name' },
                  right: { type: 'literal', literalType: 'string', value: 'large' } } } },
         right:
          { type: 'and',
            left:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'spade' } },
            right:
             { type: 'eq',
               left: { type: 'property', name: 'name' },
               right: { type: 'literal', literalType: 'string', value: 'fageo soda' } } } } }

      assert.deepEqual(ast, expected)
    })

    it('should be able to handle all of the group lengths', function () {
      var ast = parser.parse(`$select=name&$orderby=name asc&$filter=(telephone_number eq 2737560) and (name eq 'Antwan' or name eq 'Wimberly') and (telephone_number eq 2731143 or telephone_number eq 2751056 or telephone_number eq 9999999 or telephone_number eq 1222234)`)
      var expected /*: ODataAST */ = {
        '$select': [ 'name' ],
        '$orderby': [ { name: 'asc' } ],
        '$filter':
         { type: 'and',
           left:
            { type: 'eq',
              left: { type: 'property', name: 'telephone_number' },
              right: { type: 'literal', literalType: 'integer', value: 2737560 } },
           right:
            { type: 'and',
              left:
               { type: 'or',
                 left:
                  { type: 'eq',
                    left: { type: 'property', name: 'name' },
                    right: { type: 'literal', literalType: 'string', value: 'Antwan' } },
                 right:
                  { type: 'eq',
                    left: { type: 'property', name: 'name' },
                    right: { type: 'literal', literalType: 'string', value: 'Wimberly' } } },
              right:
               { type: 'or',
                 left:
                  { type: 'eq',
                    left: { type: 'property', name: 'telephone_number' },
                    right: { type: 'literal', literalType: 'integer', value: 2731143 } },
                 right:
                  { type: 'or',
                    left:
                     { type: 'eq',
                       left: { type: 'property', name: 'telephone_number' },
                       right: { type: 'literal', literalType: 'integer', value: 2751056 } },
                    right:
                     { type: 'or',
                       left:
                        { type: 'eq',
                          left: { type: 'property', name: 'telephone_number' },
                          right: { type: 'literal', literalType: 'integer', value: 9999999 } },
                       right:
                        { type: 'eq',
                          left: { type: 'property', name: 'telephone_number' },
                          right: { type: 'literal', literalType: 'integer', value: 1222234 } } } } } } } }

      assert.deepEqual(ast, expected)
    })
  })
})
