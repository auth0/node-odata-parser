/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('$apply query option', function () {
  describe('general transformation rules', function () {
    it('should parse serial transformations. $apply=filter()/aggregate()', function () {
      // not sure this in meaningful. the mapper will be checking for valid child types
      var ast = parser.parse(`$apply=filter(nullable_integer eq 123)/aggregate(money_amount with sum as total)`)

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'filter')
      assert.equal(ast.$apply[0].args[0].type, 'eq')
      assert.equal(ast.$apply[0].args[0].left.type, 'property')
      assert.equal(ast.$apply[0].args[0].left.name, 'nullable_integer')
      assert.equal(ast.$apply[0].args[0].right.type, 'literal')
      assert.equal(ast.$apply[0].args[0].right.value, 123)

      assert.equal(ast.$apply[1].type, 'transformation')
      assert.equal(ast.$apply[1].func, 'aggregate')
      assert.equal(ast.$apply[1].args[0].type, 'alias')
      assert.equal(ast.$apply[1].args[0].name, 'total')
      assert.equal(ast.$apply[1].args[0].expression.type, 'aggregate')
      assert.equal(ast.$apply[1].args[0].expression.func, 'sum')
      assert.equal(ast.$apply[1].args[0].expression.args[0].type, 'property')
      assert.equal(ast.$apply[1].args[0].expression.args[0].name, 'money_amount')
    })
  })

  describe('compute transformation', function () {
    it('should parse $apply=compute(concat(x,y) as z)', function () {
      var ast = parser.parse(`$apply=compute(concat( name, 'e') as elephant)`)

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'elephant')
      assert.equal(ast.$apply[0].args[0].expression.type, 'functioncall')
      assert.equal(ast.$apply[0].args[0].expression.func, 'concat')
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, 'property')
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, 'name')
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, 'literal')
      assert.equal(ast.$apply[0].args[0].expression.args[1].value, 'e')
    })

    it('should parse a concat with casted arguments', function () {
      var ast = parser.parse(`$apply=compute(concat(cast('1990-01-01', Edm.String), 'e') as elephant)`)

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'elephant')
      assert.equal(ast.$apply[0].args[0].expression.type, 'functioncall')
      assert.equal(ast.$apply[0].args[0].expression.func, 'concat')
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, 'cast')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[0].type, 'literal')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[0].literalType, 'date')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[0].value, '1990-01-01')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[1], 'Edm.String')
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, 'literal')
      assert.equal(ast.$apply[0].args[0].expression.args[1].value, 'e')
    })

    it('should parse $apply=compute(concat(x,y) as z, concat(a,b) as g)', function () {
      var ast = parser.parse('$apply=compute(concat(x,y) as z, concat(a,b) as g)')

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'z')
      assert.equal(ast.$apply[0].args[0].expression.type, 'functioncall')
      assert.equal(ast.$apply[0].args[0].expression.func, 'concat')
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, 'property')
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, 'x')
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, 'property')
      assert.equal(ast.$apply[0].args[0].expression.args[1].name, 'y')
      assert.equal(ast.$apply[0].args[1].type, 'alias')
      assert.equal(ast.$apply[0].args[1].name, 'g')
      assert.equal(ast.$apply[0].args[1].expression.type, 'functioncall')
      assert.equal(ast.$apply[0].args[1].expression.func, 'concat')
      assert.equal(ast.$apply[0].args[1].expression.args[0].type, 'property')
      assert.equal(ast.$apply[0].args[1].expression.args[0].name, 'a')
      assert.equal(ast.$apply[0].args[1].expression.args[1].type, 'property')
      assert.equal(ast.$apply[0].args[1].expression.args[1].name, 'b')
    })

    it('should parse nested transformations. $apply=compute(identity)', function () {
      // not sure this in meaningful. the mapper will be checking for valid child types
      var ast = parser.parse(`$apply=compute(identity)`)

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'transformation')
      assert.equal(ast.$apply[0].args[0].func, 'identity')
    })

    it('should parse $apply=compute(concat(x,y) as z, ( 1 add 2 ) as g)', function () {
      var ast = parser.parse(`$apply=compute(concat(x,y) as z, ( 1 add 2 ) as g)`)

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'z')
      assert.equal(ast.$apply[0].args[0].expression.type, 'functioncall')
      assert.equal(ast.$apply[0].args[0].expression.func, 'concat')
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, 'property')
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, 'x')
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, 'property')
      assert.equal(ast.$apply[0].args[0].expression.args[1].name, 'y')
      assert.equal(ast.$apply[0].args[1].type, 'alias')
      assert.equal(ast.$apply[0].args[1].name, 'g')
      assert.equal(ast.$apply[0].args[1].expression.type, 'add')
      assert.equal(ast.$apply[0].args[1].expression.left.type, 'literal')
      assert.equal(ast.$apply[0].args[1].expression.left.value, 1)
      assert.equal(ast.$apply[0].args[1].expression.right.type, 'literal')
      assert.equal(ast.$apply[0].args[1].expression.right.value, 2)
    })

    it('should parse substringof in `$apply=compute()`, with casting', function () {
      var ast = parser.parse(`$apply=compute(substringof(cast('1990-01-01', Edm.String), 'nginx') as subStringExpn)`)

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'subStringExpn')
      assert.equal(ast.$apply[0].args[0].expression.type, 'functioncall')
      assert.equal(ast.$apply[0].args[0].expression.func, 'substringof')
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, 'literal')
      assert.equal(ast.$apply[0].args[0].expression.args[1].value, 'nginx')

      assert.equal(ast.$apply[0].args[0].expression.args[0].type, 'cast')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[0].type, 'literal')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[0].literalType, 'date')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[0].value, '1990-01-01')
      assert.equal(ast.$apply[0].args[0].expression.args[0].args[1], 'Edm.String')
    })

    it('should parse a math expn with casting on a literal', function () {
      var ast = parser.parse('$apply=compute( (38 sub ( 83 add cast(21, Edm.Decimal) )) as mathExpn )')

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'compute')
      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'mathExpn')
      assert.equal(ast.$apply[0].args[0].expression.type, 'sub')
      assert.equal(ast.$apply[0].args[0].expression.right.type, 'add')
      assert.equal(ast.$apply[0].args[0].expression.right.left.value, 83)

      assert.equal(ast.$apply[0].args[0].expression.right.right.type, 'cast')
      assert.equal(ast.$apply[0].args[0].expression.right.right.args[0].type, 'literal')
      assert.equal(ast.$apply[0].args[0].expression.right.right.args[0].literalType, 'integer')
      assert.equal(ast.$apply[0].args[0].expression.right.right.args[0].value, 21)
      assert.equal(ast.$apply[0].args[0].expression.right.right.args[1], 'Edm.Decimal')
    })
  })

  describe('aggregate transformation', function () {
    it('should parse multiple, comma-seperated, aggregate transformations. $apply=aggregate(t1, t2)', function () {
      var ast = parser.parse('$apply=aggregate(money_amount with sum as total, money_amount with min as minimum)')

      assert.equal(ast.$apply[0].type, 'transformation')
      assert.equal(ast.$apply[0].func, 'aggregate')

      assert.equal(ast.$apply[0].args[0].type, 'alias')
      assert.equal(ast.$apply[0].args[0].name, 'total')
      assert.equal(ast.$apply[0].args[0].expression.type, 'aggregate')
      assert.equal(ast.$apply[0].args[0].expression.func, 'sum')
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, 'property')
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, 'money_amount')

      assert.equal(ast.$apply[0].args[1].type, 'alias')
      assert.equal(ast.$apply[0].args[1].name, 'minimum')
      assert.equal(ast.$apply[0].args[1].expression.type, 'aggregate')
      assert.equal(ast.$apply[0].args[1].expression.func, 'min')
      assert.equal(ast.$apply[0].args[1].expression.args[0].type, 'property')
      assert.equal(ast.$apply[0].args[1].expression.args[0].name, 'money_amount')
    })
  })

  describe('filter transformation', function () {
    it('Filter (without starting at a groupby)', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')')
      var expected = require('./data/apply/filter.json').expected

      assert.deepEqual(ast, expected)
    })
  })

  describe('expand transformations', function () {
    it('Filter -> Expand on Fiber (1-to-Many) w/ Filter', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')/expand(owns_aaardvark, filter(hyperlink_list ne null))')
      var expected = require('./data/apply/filter-expandFiber.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Filter -> Expand on Arrow (Many-to-1) w/ Filter', function () {
      var ast = parser.parse('$apply=filter(hyperlink_list ne null)/expand(owner, filter(first_name ne \'Marc\'))')
      var expected = require('./data/apply/filter-expandArrow.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Filter ->  Expand on Fiber (1-to-Many) -> Aggregate on Expand', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')/expand(owns_aaardvark,filter(hyperlink_list ne null))/aggregate(lanetix/id with sum as sum_users,owns_aaardvark/lanetix/id with countdistinct as count_aardvarks,owns_aaardvark/implementation with sum as sum_aardvarks)')
      var expected = require('./data/apply/filter-expandFiber-aggregate.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Filter -> Expand on Fiber (1-to-Many) -> Filter on fiber', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')/expand(owns_banana)/filter(owns_banana/any(x:x/monologue ne null))')
      var expected = require('./data/apply/filter-expandFiber-filter.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Filter -> Expand on Arrow (Many-to-1) -> Filter on Arrow', function () {
      var ast = parser.parse('$apply=filter(hyperlink ne null)/expand(owner)/filter(owner/first_name ne \'Marc\')')
      var expected = require('./data/apply/filter-expandArrow-filter.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Expand on Arrow -> Expand on Arrow -> Filter on Arrow/Arrow', function () {
      var ast = parser.parse('$apply=filter(name ne \'Lucille\')/expand(bluth_to_aardvark, expand(owner))/filter(bluth_to_aardvark/owner/first_name ne \'Marc\')')
      var expected = require('./data/apply/expandArrow-expandArrow-filter.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Expand on Fiber -> Expand on Arrow -> Filter+Aggregate on Fiber/Arrow', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')/expand(owns_aaardvark, filter(hyperlink_list ne null),expand(aaardvark_pickerrrr))/filter(owns_aaardvark/implementation eq 2731147 and owns_aaardvark/all(x:x/aaardvark_pickerrrr/name ne \'Gazoot\') or owns_aaardvark/any(x:x/aaardvark_pickerrrr/sometime eq null))/aggregate(lanetix/id with sum as sum_users, owns_aaardvark/aaardvark_pickerrrr/owner_id with sum as sum_bananas)')
      var expected = require('./data/apply/expandFiber-expandArrow-filter-aggregate.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Expand on Arrow -> Expand on Fiber -> Filter+Aggregate on Arrow/Fiber', function () {
      var ast = parser.parse('$apply=filter(name ne \'Lucille\')/expand(bluth_to_aardvark, expand(engineer_picker_example_set))/filter(bluth_to_aardvark/engineer_picker_example_set/any(x:x/coding_rival eq 12731255))/aggregate(age with max as oldest_bluth, bluth_to_aardvark/engineer_picker_example_set/lanetix/id with sum as sum_eng_ids)')
      var expected = require('./data/apply/expandArrow-expandFiber-filter-aggregate.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Expand Fiber -> Expand Fiber -> Expand Fiber -> Filter', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')/expand(owns_aaardvark, expand(engineer_picker_example_set, expand(xref_ge_selected_engineer_set)))/filter(owns_aaardvark/any(x:x/engineer_picker_example_set/any(x:x/name eq \'Sahil\')))/filter(owns_aaardvark/any(x:x/engineer_picker_example_set/any(x:x/xref_ge_selected_engineer_set/join_date eq \'2016-04-01T21:00:00-07:00\')))')
      var expected = require('./data/apply/expandFiber-expandFiber-expandFiber-filter.json').expected

      assert.deepEqual(ast, expected)
    })

    it('Expand Fiber -> Expand Fiber -> Expand Fiber -> Aggregate', function () {
      var ast = parser.parse('$apply=filter(first_name ne \'Marc\')/expand(owns_aaardvark, expand(engineer_picker_example_set, expand(xref_ge_selected_engineer_set)))/aggregate(owns_aaardvark/lanetix/id with sum as sum_aaardy_ids, owns_aaardvark/engineer_picker_example_set/lanetix/id with min as min_eng_ids, owns_aaardvark/engineer_picker_example_set/xref_ge_selected_engineer_set/lanetix/id with min as min_xfers_ids)')
      var expected = require('./data/apply/expandFiber-expandFiber-expandFiber-aggregate.json').expected

      assert.deepEqual(ast, expected)
    })

    it('operator precedence works within the transformation filter()', function () {
      var ast = parser.parse('$apply=filter( (x eq 1 or y eq 2) and (x eq 3 and (x eq 4 and y eq 5 or z eq 6) ) or top eq 7 )')
      var expected = require('./data/apply/filter-operator-precedence.json').expected

      assert.deepEqual(ast, expected)
    })
  })
})
