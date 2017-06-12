/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('$filter query option', function () {
  it('should parse $filter', function () {
    var ast = parser.parse(`$filter=Name eq 'Jef'`)

    assert.equal(ast.$filter.type, 'eq')
    assert.equal(ast.$filter.left.type, 'property')
    assert.equal(ast.$filter.left.name, 'Name')
    assert.equal(ast.$filter.right.type, 'literal')
    assert.equal(ast.$filter.right.value, 'Jef')
  })

  it('should parse $filter containing quote', function () {
    var ast = parser.parse(`$filter=Name eq 'O''Neil'`)

    assert.equal(ast.$filter.type, 'eq')
    assert.equal(ast.$filter.left.type, 'property')
    assert.equal(ast.$filter.left.name, 'Name')
    assert.equal(ast.$filter.right.type, 'literal')
    assert.equal(ast.$filter.right.value, 'O\'Neil')
  })

  it('should parse $filter with subproperty', function () {
    var ast = parser.parse(`$filter=User/Name eq 'Jef'`)

    assert.equal(ast.$filter.type, 'eq')
    assert.equal(ast.$filter.left.type, 'property')
    assert.equal(ast.$filter.left.name, 'User/Name')
    assert.equal(ast.$filter.right.type, 'literal')
    assert.equal(ast.$filter.right.value, 'Jef')
  })

  it('should parse multiple conditions in a $filter', function () {
    var ast = parser.parse(`$filter=Name eq 'John' and LastName lt 'Doe'`)

    assert.equal(ast.$filter.type, 'and')
    assert.equal(ast.$filter.left.type, 'eq')
    assert.equal(ast.$filter.left.left.type, 'property')
    assert.equal(ast.$filter.left.left.name, 'Name')
    assert.equal(ast.$filter.left.right.type, 'literal')
    assert.equal(ast.$filter.left.right.value, 'John')
    assert.equal(ast.$filter.right.type, 'lt')
    assert.equal(ast.$filter.right.left.type, 'property')
    assert.equal(ast.$filter.right.left.name, 'LastName')
    assert.equal(ast.$filter.right.right.type, 'literal')
    assert.equal(ast.$filter.right.right.value, 'Doe')
  })

  describe('parsing functioncall nodes', function () {
    it('should parse substringof $filter', function () {
      var ast = parser.parse(`$filter=substringof('nginx', Data)`)

      assert.equal(ast.$filter.type, 'functioncall')
      assert.equal(ast.$filter.func, 'substringof')

      assert.equal(ast.$filter.args[0].type, 'literal')
      assert.equal(ast.$filter.args[0].value, 'nginx')

      assert.equal(ast.$filter.args[1].type, 'property')
      assert.equal(ast.$filter.args[1].name, 'Data')
    })

    it('should parse substringof $filter with empty string', function () {
      var ast = parser.parse(`$filter=substringof('', Data)`)

      assert.equal(ast.$filter.args[0].type, 'literal')
      assert.equal(ast.$filter.args[0].value, '')
    })

    it('should parse substringof $filter with string containing quote', function () {
      var ast = parser.parse(`$filter=substringof('ng''inx', Data)`)
      assert.equal(ast.$filter.args[0].type, 'literal')
      assert.equal(ast.$filter.args[0].value, 'ng\'inx')
    })

    it('should parse substringof $filter with string starting with quote', function () {
      var ast = parser.parse(`$filter=substringof('''nginx', Data)`)

      assert.equal(ast.$filter.args[0].type, 'literal')
      assert.equal(ast.$filter.args[0].value, '\'nginx')
    })

    it('should parse substringof $filter with string ending with quote', function () {
      var ast = parser.parse(`$filter=substringof('nginx''', Data)`)

      assert.equal(ast.$filter.args[0].type, 'literal')
      assert.equal(ast.$filter.args[0].value, 'nginx\'')
    })

    it('should parse substringof eq true in $filter', function () {
      var ast = parser.parse(`$filter=substringof('nginx', Data) eq true`)

      assert.equal(ast.$filter.type, 'eq')

      assert.equal(ast.$filter.left.type, 'functioncall')
      assert.equal(ast.$filter.left.func, 'substringof')
      assert.equal(ast.$filter.left.args[0].type, 'literal')
      assert.equal(ast.$filter.left.args[0].value, 'nginx')
      assert.equal(ast.$filter.left.args[1].type, 'property')
      assert.equal(ast.$filter.left.args[1].name, 'Data')

      assert.equal(ast.$filter.right.type, 'literal')
      assert.equal(ast.$filter.right.value, true)
    })

    it('should parse startswith $filter', function () {
      var ast = parser.parse(`$filter=startswith('nginx', Data)`)

      assert.equal(ast.$filter.type, 'functioncall')
      assert.equal(ast.$filter.func, 'startswith')

      assert.equal(ast.$filter.args[0].type, 'literal')
      assert.equal(ast.$filter.args[0].value, 'nginx')

      assert.equal(ast.$filter.args[1].type, 'property')
      assert.equal(ast.$filter.args[1].name, 'Data')
    })

    it('should parse startswith $filter', function () {
      var ast = parser.parse(`$filter=contains(Data, 'nginx')`)

      assert.equal(ast.$filter.type, 'functioncall')
      assert.equal(ast.$filter.func, 'contains')

      assert.equal(ast.$filter.args[0].type, 'property')
      assert.equal(ast.$filter.args[0].name, 'Data')

      assert.equal(ast.$filter.args[1].type, 'literal')
      assert.equal(ast.$filter.args[1].value, 'nginx')
    })

    it('should parse any(lambdaFunc) eq true $filter', function () {
      var ast = parser.parse(`$filter=linked_table/any_num_hops/string_list/any(list_item:list_item eq 'test') eq true`)

      assert.equal(ast.$filter.type, 'eq')

      assert.equal(ast.$filter.left.type, 'functioncall')
      assert.equal(ast.$filter.left.func, 'any')

      assert.equal(ast.$filter.left.args[0].type, 'property')
      assert.equal(ast.$filter.left.args[0].name, 'linked_table/any_num_hops/string_list')

      assert.equal(ast.$filter.left.args[1].type, 'lambda')
      assert.equal(ast.$filter.left.args[1].args[0].type, 'property')
      assert.equal(ast.$filter.left.args[1].args[0].name, 'list_item')
      assert.equal(ast.$filter.left.args[1].args[1].type, 'eq')
      assert.equal(ast.$filter.left.args[1].args[1].left.type, 'property')
      assert.equal(ast.$filter.left.args[1].args[1].left.name, 'list_item')
      assert.equal(ast.$filter.left.args[1].args[1].right.type, 'literal')
      assert.equal(ast.$filter.left.args[1].args[1].right.value, 'test')

      assert.equal(ast.$filter.right.value.true)
    })

    it('should parse all(lambdaFunc) eq true $filter', function () {
      var ast = parser.parse(`$filter=linked_table/any_num_hops/string_list/all(list_item:list_item eq 'test') eq true`)

      assert.equal(ast.$filter.type, 'eq')

      assert.equal(ast.$filter.left.type, 'functioncall')
      assert.equal(ast.$filter.left.func, 'all')

      assert.equal(ast.$filter.left.args[0].type, 'property')
      assert.equal(ast.$filter.left.args[0].name, 'linked_table/any_num_hops/string_list')

      assert.equal(ast.$filter.left.args[1].type, 'lambda')
      assert.equal(ast.$filter.left.args[1].args[0].type, 'property')
      assert.equal(ast.$filter.left.args[1].args[0].name, 'list_item')
      assert.equal(ast.$filter.left.args[1].args[1].type, 'eq')
      assert.equal(ast.$filter.left.args[1].args[1].left.type, 'property')
      assert.equal(ast.$filter.left.args[1].args[1].left.name, 'list_item')
      assert.equal(ast.$filter.left.args[1].args[1].right.type, 'literal')
      assert.equal(ast.$filter.left.args[1].args[1].right.value, 'test')

      assert.equal(ast.$filter.right.value.true)
    });

    ['tolower', 'toupper', 'trim'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse('$filter=' + func + '(value) eq \'test\'')

        assert.equal(ast.$filter.type, 'eq')

        assert.equal(ast.$filter.left.type, 'functioncall')
        assert.equal(ast.$filter.left.func, func)
        assert.equal(ast.$filter.left.args[0].type, 'property')
        assert.equal(ast.$filter.left.args[0].name, 'value')

        assert.equal(ast.$filter.right.type, 'literal')
        assert.equal(ast.$filter.right.value, 'test')
      })
    });

    ['year', 'month', 'day', 'hour', 'minute', 'second'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse('$filter=' + func + `(value) gt 0`)

        assert.equal(ast.$filter.type, 'gt')

        assert.equal(ast.$filter.left.type, 'functioncall')
        assert.equal(ast.$filter.left.func, func)
        assert.equal(ast.$filter.left.args[0].type, 'property')
        assert.equal(ast.$filter.left.args[0].name, 'value')

        assert.equal(ast.$filter.right.type, 'literal')
        assert.equal(ast.$filter.right.value, '0')
      })
    });

    ['indexof', 'concat', 'substring', 'replace'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse(`$filter=` + func + `('haystack', needle) eq 'test'`)

        assert.equal(ast.$filter.type, 'eq')

        assert.equal(ast.$filter.left.type, 'functioncall')
        assert.equal(ast.$filter.left.func, func)
        assert.equal(ast.$filter.left.args[0].type, 'literal')
        assert.equal(ast.$filter.left.args[0].value, 'haystack')
        assert.equal(ast.$filter.left.args[1].type, 'property')
        assert.equal(ast.$filter.left.args[1].name, 'needle')

        assert.equal(ast.$filter.right.type, 'literal')
        assert.equal(ast.$filter.right.value, 'test')
      })
    });
  })

  it('should return an error if invalid value', function () {
    var ast = parser.parse('$top=foo')

    assert.equal(ast.error, 'invalid $top parameter')
  })

  it('should parse boolean okay', function () {
    var ast = parser.parse('$filter=status eq true')
    assert.equal(ast.$filter.right.value, true)
    assert.equal(ast.$filter.right.literalType, 'boolean')
    var ast1 = parser.parse('$filter=status eq false')
    assert.equal(ast1.$filter.right.value, false)
    assert.equal(ast1.$filter.right.literalType, 'boolean')
  })

  it('should parse numbers okay', function () {
    var ast = parser.parse('$filter=status eq 3')
    assert.equal(ast.$filter.right.value, 3)
    assert.equal(ast.$filter.right.literalType, 'integer')
    // Test multiple digits - problem of not joining digits to array
    ast = parser.parse('$filter=status eq 34')
    assert.equal(ast.$filter.right.value, 34)
    assert.equal(ast.$filter.right.literalType, 'integer')
    // Test number starting with 1 - problem of boolean rule order
    ast = parser.parse('$filter=status eq 12')
    assert.equal(ast.$filter.right.value, 12)
    assert.equal(ast.$filter.right.literalType, 'integer')
  })

  it('should parse negative numbers okay', function () {
    var ast = parser.parse('$filter=status eq -3')
    assert.equal(ast.$filter.right.value, -3)
    assert.equal(ast.$filter.right.literalType, 'integer')
    ast = parser.parse('$filter=status eq -34')
    assert.equal(ast.$filter.right.value, -34)
    assert.equal(ast.$filter.right.literalType, 'integer')
  })

  it('should parse decimal numbers okay', function () {
    var ast = parser.parse('$filter=status eq 3.4')
    assert.equal(ast.$filter.right.value, '3.4')
    assert.equal(ast.$filter.right.literalType, 'decimal')
    ast = parser.parse('$filter=status eq -3.4')
    assert.equal(ast.$filter.right.value, '-3.4')
    assert.equal(ast.$filter.right.literalType, 'decimal')
  })

  it('should parse NaN into literalType Nan (mapper then handles)', function () {
    var ast = parser.parse('$filter=status eq NaN')
    assert.equal(ast.$filter.right.value, 'NaN')
    assert.equal(ast.$filter.right.literalType, 'NaN/Infinity')
  })

  describe('using cast', function () {
    it('should parse cast(time) okay', function () {
      var ast = parser.parse('$filter=time eq cast(\'00:24:55.3454\', Edm.TimeOfDay)')
      assert.equal(ast.$filter.right.type, 'cast')
      assert.equal(ast.$filter.right.args[0].type, 'literal')
      assert.equal(ast.$filter.right.args[0].literalType, 'timeOfDay')
      assert.equal(ast.$filter.right.args[0].value, '00:24:55.3454')
      assert.equal(ast.$filter.right.args[1], 'Edm.TimeOfDay')
    })

    it('should parse cast(date) okay', function () {
      var ast = parser.parse('$filter=time eq cast(\'1900-01-01\', Edm.Date)')
      assert.equal(ast.$filter.right.type, 'cast')
      assert.equal(ast.$filter.right.args[0].type, 'literal')
      assert.equal(ast.$filter.right.args[0].literalType, 'date')
      assert.equal(ast.$filter.right.args[0].value, '1900-01-01')
      assert.equal(ast.$filter.right.args[1], 'Edm.Date')
    })

    it('should parse cast(dateTimeOffset) okay', function () {
      var ast = parser.parse('$filter=time eq cast(\'1900-01-01T00:24Z\', Edm.DateTimeOffset)')
      assert.equal(ast.$filter.right.type, 'cast')
      assert.equal(ast.$filter.right.args[0].type, 'literal')
      assert.equal(ast.$filter.right.args[0].literalType, 'dateTimeOffset')
      assert.equal(ast.$filter.right.args[0].value, '1900-01-01T00:24Z')
      assert.equal(ast.$filter.right.args[1], 'Edm.DateTimeOffset')

      var ast1 = parser.parse('$filter=time eq cast(\'1900-01-01T00:24+12:00\', Edm.DateTimeOffset)')
      assert.equal(ast1.$filter.right.type, 'cast')
      assert.equal(ast1.$filter.right.args[0].type, 'literal')
      assert.equal(ast1.$filter.right.args[0].literalType, 'dateTimeOffset')
      assert.equal(ast1.$filter.right.args[0].value, '1900-01-01T00:24+12:00')
      assert.equal(ast1.$filter.right.args[1], 'Edm.DateTimeOffset')
    })

    it('should parse cast(dateTimeOffset) to a date, time, or string', function () {
      var ast = parser.parse('$filter=time eq cast(\'1900-01-01T00:24Z\', Edm.Date)')
      assert.equal(ast.$filter.right.type, 'cast')
      assert.equal(ast.$filter.right.args[0].type, 'literal')
      assert.equal(ast.$filter.right.args[0].literalType, 'dateTimeOffset')
      assert.equal(ast.$filter.right.args[0].value, '1900-01-01T00:24Z')
      assert.equal(ast.$filter.right.args[1], 'Edm.Date')

      var ast1 = parser.parse('$filter=time eq cast(\'1900-01-01T00:24+12:00\', Edm.TimeOfDay)')
      assert.equal(ast1.$filter.right.type, 'cast')
      assert.equal(ast1.$filter.right.args[0].type, 'literal')
      assert.equal(ast1.$filter.right.args[0].literalType, 'dateTimeOffset')
      assert.equal(ast1.$filter.right.args[0].value, '1900-01-01T00:24+12:00')
      assert.equal(ast1.$filter.right.args[1], 'Edm.TimeOfDay')

      var ast2 = parser.parse('$filter=time eq cast(\'1900-01-01T00:24+12:00\', Edm.String)')
      assert.equal(ast2.$filter.right.type, 'cast')
      assert.equal(ast2.$filter.right.args[0].type, 'literal')
      assert.equal(ast2.$filter.right.args[0].literalType, 'dateTimeOffset')
      assert.equal(ast2.$filter.right.args[0].value, '1900-01-01T00:24+12:00')
      assert.equal(ast2.$filter.right.args[1], 'Edm.String')
    })

    it('should parse cast(int) to a decimal', function () {
      var ast = parser.parse('$filter=time eq cast(234, Edm.Decimal)')
      assert.equal(ast.$filter.right.type, 'cast')
      assert.equal(ast.$filter.right.args[0].type, 'literal')
      assert.equal(ast.$filter.right.args[0].literalType, 'integer')
      assert.equal(ast.$filter.right.args[0].value, '234')
      assert.equal(ast.$filter.right.args[1], 'Edm.Decimal')
    })

    // the throw is failing....but not being handled by the 'should be rejected'. Huh?
    it('should pass if cast(decimal) to an int', function () {
      parser.parse('$filter=time eq cast(2343.54, Edm.Decimal)').should.be.rejected
    })
    it.skip('But should throw if attempting to cast a decimal to an int', function () {
      parser.parse('$filter=time eq cast(2343.54, Edm.Int32)').should.be.rejected
    })

    it('should parse cast(everything) to a string', function () {
      var ast = parser.parse('$filter=time eq cast(234, Edm.String)')
      assert.equal(ast.$filter.right.type, 'cast')
      assert.equal(ast.$filter.right.args[0].type, 'literal')
      assert.equal(ast.$filter.right.args[0].literalType, 'integer')
      assert.equal(ast.$filter.right.args[0].value, '234')
      assert.equal(ast.$filter.right.args[1], 'Edm.String')

      var ast2 = parser.parse('$filter=time eq cast(234.45, Edm.String)')
      assert.equal(ast2.$filter.right.type, 'cast')
      assert.equal(ast2.$filter.right.args[0].type, 'literal')
      assert.equal(ast2.$filter.right.args[0].literalType, 'decimal')
      assert.equal(ast2.$filter.right.args[0].value, '234.45')
      assert.equal(ast2.$filter.right.args[1], 'Edm.String')

      var ast3 = parser.parse('$filter=time eq cast(true, Edm.String)')
      assert.equal(ast3.$filter.right.type, 'cast')
      assert.equal(ast3.$filter.right.args[0].type, 'literal')
      assert.equal(ast3.$filter.right.args[0].literalType, 'boolean')
      assert.equal(ast3.$filter.right.args[0].value, true)
      assert.equal(ast3.$filter.right.args[1], 'Edm.String')
    })

    it('should throw if attempting to cast a property', function () {
      parser.parse('$filter=cast(time, Edm.String) eq 23').should.be.rejected;
    })
  })

  it('should parse cond with eq|le|ge|lt|gt as the root, with the mathOp as the subtree', function () {
    var ast = parser.parse('$filter=( 38 sub ( 83 add ( 8 mod 2 ) ) ) eq ( ( 2 mul 4 ) div 33 )')
    assert.equal(ast.$filter.type, 'eq')
    assert.equal(ast.$filter.left.type, 'sub')
    assert.equal(ast.$filter.left.left.type, 'literal')
    assert.equal(ast.$filter.left.left.value, 38)
    assert.equal(ast.$filter.left.right.type, 'add')
    assert.equal(ast.$filter.left.right.left.type, 'literal')
    assert.equal(ast.$filter.left.right.left.value, 83)
    assert.equal(ast.$filter.left.right.right.type, 'mod')
    assert.equal(ast.$filter.left.right.right.left.type, 'literal')
    assert.equal(ast.$filter.left.right.right.left.value, 8)
    assert.equal(ast.$filter.left.right.right.right.type, 'literal')
    assert.equal(ast.$filter.left.right.right.right.value, 2)
    assert.equal(ast.$filter.right.type, 'div')
    assert.equal(ast.$filter.right.left.type, 'mul')
    assert.equal(ast.$filter.right.left.left.type, 'literal')
    assert.equal(ast.$filter.right.left.left.value, 2)
    assert.equal(ast.$filter.right.left.right.type, 'literal')
    assert.equal(ast.$filter.right.left.right.value, 4)
    assert.equal(ast.$filter.right.right.type, 'literal')
    assert.equal(ast.$filter.right.right.value, 33)
  })

  it('should have math operator precedence', function () {
    var ast = parser.parse('$filter=38 sub 83 mod 2 add 8 mul ( 2 add 3 ) eq 2 div 4 add 3')
    var expected = require('./data/math-op-precedence.json').expected
    assert.deepEqual(ast, expected)
  })

  describe('using identifer.unit()', function () {
    it('should parse identifer.unit in math equation', function () {
      var ast = parser.parse('$filter=( birthday.month() sub 1 ) eq 7')
      assert.equal(ast.$filter.type, 'eq')
      assert.equal(ast.$filter.left.type, 'sub')
      assert.equal(ast.$filter.left.left.type, 'property')
      assert.equal(ast.$filter.left.left.name, 'birthday')
      assert.equal(ast.$filter.left.left.unit, 'month')
      assert.equal(ast.$filter.left.right.type, 'literal')
      assert.equal(ast.$filter.left.right.value, '1')
      assert.equal(ast.$filter.right.type, 'literal')
      assert.equal(ast.$filter.right.value, '7')
    })

    it('should parse identifer.unit now.unit for last month ', function () {
      var ast = parser.parse('$filter=birthday.month() eq ( now().month() sub 1 )')
      assert.equal(ast.$filter.type, 'eq')
      assert.equal(ast.$filter.left.type, 'property')
      assert.equal(ast.$filter.left.name, 'birthday')
      assert.equal(ast.$filter.left.unit, 'month')
      assert.equal(ast.$filter.right.type, 'sub')
      assert.equal(ast.$filter.right.left.type, 'now')
      assert.equal(ast.$filter.right.left.unit, 'month')
      assert.equal(ast.$filter.right.right.type, 'literal')
      assert.equal(ast.$filter.right.right.value, '1')
    })

    it('should parse identifer.unit now.unit for last quarter ', function () {
      var ast = parser.parse('$filter=birthday.quarter() eq ( now().quarter() sub 1 )')
      assert.equal(ast.$filter.type, 'eq')
      assert.equal(ast.$filter.left.type, 'property')
      assert.equal(ast.$filter.left.name, 'birthday')
      assert.equal(ast.$filter.left.unit, 'quarter')
      assert.equal(ast.$filter.right.type, 'sub')
      assert.equal(ast.$filter.right.left.type, 'now')
      assert.equal(ast.$filter.right.left.unit, 'quarter')
      assert.equal(ast.$filter.right.right.type, 'literal')
      assert.equal(ast.$filter.right.right.value, '1')
    })

    it('should parse identifer.unit now.unit for last week, with identifierPath ', function () {
      var ast = parser.parse('$filter=related/related/created_at.week() eq ( now().week() sub 1 )')
      assert.equal(ast.$filter.type, 'eq')
      assert.equal(ast.$filter.left.type, 'property')
      assert.equal(ast.$filter.left.name, 'related/related/created_at')
      assert.equal(ast.$filter.left.unit, 'week')
      assert.equal(ast.$filter.right.type, 'sub')
      assert.equal(ast.$filter.right.left.type, 'now')
      assert.equal(ast.$filter.right.left.unit, 'week')
      assert.equal(ast.$filter.right.right.type, 'literal')
      assert.equal(ast.$filter.right.right.value, '1')
    })

    it('should parse identifer.unit now.unit for next month ', function () {
      var ast = parser.parse('$filter=birthday.month() eq ( now().month() add 1 )')
      assert.equal(ast.$filter.type, 'eq')
      assert.equal(ast.$filter.left.type, 'property')
      assert.equal(ast.$filter.left.name, 'birthday')
      assert.equal(ast.$filter.left.unit, 'month')
      assert.equal(ast.$filter.right.type, 'add')
      assert.equal(ast.$filter.right.left.type, 'now')
      assert.equal(ast.$filter.right.left.unit, 'month')
      assert.equal(ast.$filter.right.right.type, 'literal')
      assert.equal(ast.$filter.right.right.value, '1')
    })

    it('should parse identifer.unit now.unit for this month ', function () {
      var ast = parser.parse('$filter=birthday.month() eq now().month()')
      assert.equal(ast.$filter.type, 'eq')
      assert.equal(ast.$filter.left.type, 'property')
      assert.equal(ast.$filter.left.name, 'birthday')
      assert.equal(ast.$filter.left.unit, 'month')
      assert.equal(ast.$filter.right.type, 'now')
      assert.equal(ast.$filter.right.unit, 'month')
    })
  })

  it('should parse parameterAliasIdentifier', function () {
    var ast = parser.parse('$filter=closingDate eq @lx_myUser_Id')
    assert.equal(ast.$filter.right.type, 'literal')
    assert.equal(ast.$filter.right.literalType, 'parameter-alias')
    assert.equal(ast.$filter.right.value, '@lx_myUser_Id')
  })

  it('should parse long paths in $filter conditions', function () {
    var ast = parser.parse(`$filter=publisher/president/likes/author/firstname eq 'John'`)
    assert.equal(ast.$filter.left.name, `publisher/president/likes/author/firstname`)
  })

  describe('should be able to handle filter groups created by the legacy Lx condition-builder', function () {
    it('should parse a group of ORs inside ANDs', function () {
      var ast = parser.parse(`$filter=(name eq 'ace' or name eq 'johnson') and (bass eq 'abc' or telephone_number eq 899999999)&$select=name`)
      var expected = require('./data/filter/grouping-or-inside-and.json').expected

      assert.deepEqual(ast, expected)
    })

    it('should parse a group of ANDs inside ORs', function () {
      var ast = parser.parse(`$filter=(name eq 'ace' and name eq 'johnson') or (telephone_number eq 999999999 and telephone_number eq 899999999 and telephone_number ne 2342)&$select=name`)
      var expected = require('./data/filter/grouping-and-inside-or.json').expected

      assert.deepEqual(ast, expected)
    })

    it('should parse a single group, with a single AND', function () {
      var ast = parser.parse(`$filter=( nullable_string ne null and telephone_number eq 999999999 )&$select=name`)
      var expected = require('./data/filter/group-single-and.json').expected

      assert.deepEqual(ast, expected)
    })

    it('should parse a single group, with a single OR', function () {
      var ast = parser.parse(`$filter=( nullable_string ne null or telephone_number eq 999999999 )&$select=name`)
      var expected = require('./data/filter/group-single-or.json').expected

      assert.deepEqual(ast, expected)
    })

    it('should parse a single group, with a single condition', function () {
      var ast = parser.parse(`$filter=(name eq 'Klay Thompson' )&$select=name`)
      var expected = require('./data/filter/group-single-condition.json').expected

      assert.deepEqual(ast, expected)
    })

    it('should parse groups of single-condition|ORs|many-ORs, with parent ANDs', function () {
      var ast = parser.parse(`$select=name&$orderby=name asc&$filter=(telephone_number eq 2737560) and (name eq 'Antwan' or name eq 'Wimberly') and (telephone_number eq 2731143 or telephone_number eq 2751056 or telephone_number eq 9999999 or telephone_number eq 1222234)`)

      var expected = require('./data/filter/grouping-mixed-inside-and.json').expected
      assert.deepEqual(ast, expected)
    })

    it('should parse groups of ANDs|ORs, with parent ORs', function () {
      var ast = parser.parse(`$filter=(name eq 'ace' or name eq 'johnson' or name eq 'large') or (name eq 'spade' and name eq 'fageo soda')&$select=name`)
      var expected = require('./data/filter/grouping-mixed-inside-or.json').expected

      assert.deepEqual(ast, expected)
    })

    it('should be able to handle all of the group lengths', function () {
      var ast = parser.parse(`$select=name&$orderby=name asc&$filter=(telephone_number eq 2737560) and (name eq 'Antwan' or name eq 'Wimberly') and (telephone_number eq 2731143 or telephone_number eq 2751056 or telephone_number eq 9999999 or telephone_number eq 1222234)`)
      var expected = require('./data/filter/grouping-mixed-lengths.json').expected

      assert.deepEqual(ast, expected)
    })
  })
})
