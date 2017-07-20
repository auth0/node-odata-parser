// @flow
/*:: import type { ODataAST } from '../src/odata.types.js' */
/* eslint-env mocha */
var assert = require('assert')
var parser = require('../lib')

describe('$apply query option', function () {
  describe('general transformation rules', function () {
    it('should parse serial transformations. $apply=filter()/aggregate()', function () {
      // not sure this in meaningful. the mapper will be checking for valid child types
      var ast = parser.parse(`$apply=filter(nullable_integer eq 123)/aggregate(money_amount with sum as total)`)

      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'eq',
                  left: { type: 'property', name: 'nullable_integer' },
                  right: { type: 'literal', literalType: 'integer', value: 123 } } ] },
           { type: 'transformation',
             func: 'aggregate',
             args:
              [ { type: 'alias',
                  name: 'total',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args: [ { type: 'property', name: 'money_amount' } ] } } ] } ] }

      assert.deepEqual(ast, expected)
    })
  })

  describe('compute transformation', function () {
    it('should parse $apply=compute(concat(x,y) as z)', function () {
      var ast = parser.parse(`$apply=compute(concat( name, 'e') as elephant)`)

      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'compute',
             args:
              [ { type: 'alias',
                  name: 'elephant',
                  expression:
                   { type: 'functioncall',
                     func: 'concat',
                     args:
                      [ { type: 'property', name: 'name' },
                        { type: 'literal', literalType: 'string', value: 'e' } ] } } ] } ] }

      assert.deepEqual(ast, expected)
    })

    it('should parse a concat with casted arguments', function () {
      var ast = parser.parse(`$apply=compute(concat(cast('1990-01-01', Edm.String), 'e') as elephant)`)
      const expected /*: ODataAST */ = {
        '$apply':
          [ { type: 'transformation',
              func: 'compute',
              args:
               [ { type: 'alias',
                   name: 'elephant',
                   expression:
                    { type: 'functioncall',
                      func: 'concat',
                      args:
                       [ { type: 'cast',
                           args:
                            [ { type: 'literal', literalType: 'date', value: '1990-01-01' },
                              'Edm.String' ] },
                              { type: 'literal', literalType: 'string', value: 'e' } ] } } ] } ] }

      assert.deepEqual(ast, expected)
    })

    it('should parse $apply=compute(concat(x,y) as z, concat(a,b) as g)', function () {
      var ast = parser.parse('$apply=compute(concat(x,y) as z, concat(a,b) as g)')

      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'compute',
             args:
              [ { type: 'alias',
                  name: 'z',
                  expression:
                   { type: 'functioncall',
                     func: 'concat',
                     args:
                      [ { type: 'property', name: 'x' },
                        { type: 'property', name: 'y' } ] } },
                { type: 'alias',
                  name: 'g',
                  expression:
                   { type: 'functioncall',
                     func: 'concat',
                     args:
                      [ { type: 'property', name: 'a' },
                        { type: 'property', name: 'b' } ] } } ] } ] }

      assert.deepEqual(ast, expected)
    })

    it('should parse nested transformations. $apply=compute(identity)', function () {
      // not sure this in meaningful. the mapper will be checking for valid child types
      var ast = parser.parse(`$apply=compute(identity)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'compute',
             args: [ { type: 'transformation', func: 'identity', args: [] } ] } ] }

      assert.deepEqual(ast, expected)
    })

    describe('compute transformation, with property only', function () {
      it('parsing on baseRT prop)', function () {
        var ast = parser.parse('$apply=compute(name as elephant)')
        const expected /*: ODataAST */ = {
          '$apply':
           [ { type: 'transformation',
               func: 'compute',
               args:
                [ { type: 'alias',
                    name: 'elephant',
                    expression: { type: 'property', name: 'name' } } ] } ] }

        assert.deepEqual(ast, expected)
      })
    })

    it('should parse $apply=compute(concat(x,y) as z, ( 1 add 2 ) as g)', function () {
      var ast = parser.parse(`$apply=compute(concat(x,y) as z, ( 1 add 2 ) as g)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'compute',
             args:
              [ { type: 'alias',
                  name: 'z',
                  expression:
                   { type: 'functioncall',
                     func: 'concat',
                     args:
                      [ { type: 'property', name: 'x' },
                        { type: 'property', name: 'y' } ] } },
                { type: 'alias',
                  name: 'g',
                  expression:
                   { type: 'add',
                     left: { type: 'literal', literalType: 'integer', value: 1 },
                     right: { type: 'literal', literalType: 'integer', value: 2 } } } ] } ] }

      assert.deepEqual(ast, expected)
    })

    it('should parse substringof in `$apply=compute()`, with casting', function () {
      var ast = parser.parse(`$apply=compute(substringof(cast('1990-01-01', Edm.String), 'nginx') as subStringExpn)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'compute',
             args:
              [ { type: 'alias',
                  name: 'subStringExpn',
                  expression:
                   { type: 'functioncall',
                     func: 'substringof',
                     args:
                      [ { type: 'cast',
                          args:
                           [ { type: 'literal', literalType: 'date', value: '1990-01-01' },
                             'Edm.String' ] },
                             { type: 'literal', literalType: 'string', value: 'nginx' } ] } } ] } ] }

      assert.deepEqual(ast, expected)
    })

    it('should parse a math expn with casting on a literal', function () {
      var ast = parser.parse('$apply=compute( (38 sub ( 83 add cast(21, Edm.Decimal) )) as mathExpn )')
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'compute',
             args:
              [ { type: 'alias',
                  name: 'mathExpn',
                  expression:
                   { type: 'sub',
                     left: { type: 'literal', literalType: 'integer', value: 38 },
                     right:
                      { type: 'add',
                        left: { type: 'literal', literalType: 'integer', value: 83 },
                        right:
                         { type: 'cast',
                           args:
                            [ { type: 'literal', literalType: 'integer', value: 21 },
                              'Edm.Decimal' ] } } } } ] } ] }

      assert.deepEqual(ast, expected)
    })
  })

  describe('aggregate transformation', function () {
    it('should parse multiple, comma-seperated, aggregate transformations. $apply=aggregate(t1, t2)', function () {
      var ast = parser.parse('$apply=aggregate(money_amount with sum as total, money_amount with min as minimum)')
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'aggregate',
             args:
              [ { type: 'alias',
                  name: 'total',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args: [ { type: 'property', name: 'money_amount' } ] } },
                { type: 'alias',
                  name: 'minimum',
                  expression:
                   { type: 'aggregate',
                     func: 'min',
                     args: [ { type: 'property', name: 'money_amount' } ] } } ] } ] }

      assert.deepEqual(ast, expected)
    })
  })

  describe('filter transformation', function () {
    it('Filter (without starting at a groupby)', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] } ] }
      assert.deepEqual(ast, expected)
    })
  })

  describe('expand transformations', function () {
    it('Filter -> Expand on Fiber (1-to-Many) w/ Filter', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')/expand(owns_aaardvark, filter(hyperlink_list ne null))`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'owns_aaardvark' },
                { type: 'transformation',
                  func: 'filter',
                  args:
                   [ { type: 'ne',
                       left: { type: 'property', name: 'hyperlink_list' },
                       right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Filter -> Expand on Arrow (Many-to-1) w/ Filter', function () {
      var ast = parser.parse(`$apply=filter(hyperlink_list ne null)/expand(owner, filter(first_name ne 'Marc'))`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'hyperlink_list' },
                  right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'owner' },
                { type: 'transformation',
                  func: 'filter',
                  args:
                   [ { type: 'ne',
                       left: { type: 'property', name: 'first_name' },
                       right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Filter ->  Expand on Fiber (1-to-Many) -> Aggregate on Expand', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')/expand(owns_aaardvark,filter(hyperlink_list ne null))/aggregate(lanetix/id with sum as sum_users,owns_aaardvark/lanetix/id with countdistinct as count_aardvarks,owns_aaardvark/implementation with sum as sum_aardvarks)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'owns_aaardvark' },
                { type: 'transformation',
                  func: 'filter',
                  args:
                   [ { type: 'ne',
                       left: { type: 'property', name: 'hyperlink_list' },
                       right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] } ] },
           { type: 'transformation',
             func: 'aggregate',
             args:
              [ { type: 'alias',
                  name: 'sum_users',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args: [ { type: 'property', name: 'lanetix/id' } ] } },
                { type: 'alias',
                  name: 'count_aardvarks',
                  expression:
                   { type: 'aggregate',
                     func: 'countdistinct',
                     args: [ { type: 'property', name: 'owns_aaardvark/lanetix/id' } ] } },
                { type: 'alias',
                  name: 'sum_aardvarks',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args: [ { type: 'property', name: 'owns_aaardvark/implementation' } ] } } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Filter -> Expand on Fiber (1-to-Many) -> Filter on fiber', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')/expand(owns_banana)/filter(owns_banana/any(x:x/monologue ne null))`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] },
           { type: 'transformation',
             func: 'expand',
             args: [ { type: 'property', name: 'owns_banana' } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'functioncall',
                  func: 'any',
                  args:
                   [ { type: 'property', name: 'owns_banana' },
                     { type: 'lambda',
                       args:
                        [ { type: 'property', name: 'x' },
                          { type: 'ne',
                            left: { type: 'property', name: 'monologue' },
                            right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] } ] } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Filter -> Expand on Arrow (Many-to-1) -> Filter on Arrow', function () {
      var ast = parser.parse(`$apply=filter(hyperlink ne null)/expand(owner)/filter(owner/first_name ne 'Marc')`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'hyperlink' },
                  right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] },
           { type: 'transformation',
             func: 'expand',
             args: [ { type: 'property', name: 'owner' } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'owner/first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Expand on Arrow -> Expand on Arrow -> Filter on Arrow/Arrow', function () {
      var ast = parser.parse(`$apply=filter(name ne 'Lucille')/expand(bluth_to_aardvark, expand(owner))/filter(bluth_to_aardvark/owner/first_name ne 'Marc')`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'name' },
                  right: { type: 'literal', literalType: 'string', value: 'Lucille' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'bluth_to_aardvark' },
                { type: 'transformation',
                  func: 'expand',
                  args: [ { type: 'property', name: 'owner' } ] } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'bluth_to_aardvark/owner/first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Expand on Fiber -> Expand on Arrow -> Filter+Aggregate on Fiber/Arrow', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')/expand(owns_aaardvark, filter(hyperlink_list ne null),expand(aaardvark_pickerrrr))/filter(owns_aaardvark/implementation eq 2731147 and owns_aaardvark/all(x:x/aaardvark_pickerrrr/name ne \'Gazoot\') or owns_aaardvark/any(x:x/aaardvark_pickerrrr/sometime eq null))/aggregate(lanetix/id with sum as sum_users, owns_aaardvark/aaardvark_pickerrrr/owner_id with sum as sum_bananas)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'owns_aaardvark' },
                { type: 'transformation',
                  func: 'filter',
                  args:
                   [ { type: 'ne',
                       left: { type: 'property', name: 'hyperlink_list' },
                       right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] },
                { type: 'transformation',
                  func: 'expand',
                  args: [ { type: 'property', name: 'aaardvark_pickerrrr' } ] } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'or',
                  left:
                   { type: 'and',
                     left:
                      { type: 'eq',
                        left: { type: 'property', name: 'owns_aaardvark/implementation' },
                        right: { type: 'literal', literalType: 'integer', value: 2731147 } },
                     right:
                      { type: 'functioncall',
                        func: 'all',
                        args:
                         [ { type: 'property', name: 'owns_aaardvark' },
                           { type: 'lambda',
                             args:
                              [ { type: 'property', name: 'x' },
                                { type: 'ne',
                                  left: { type: 'property', name: 'aaardvark_pickerrrr/name' },
                                  right: { type: 'literal', literalType: 'string', value: 'Gazoot' } } ] } ] } },
                  right:
                   { type: 'functioncall',
                     func: 'any',
                     args:
                      [ { type: 'property', name: 'owns_aaardvark' },
                        { type: 'lambda',
                          args:
                           [ { type: 'property', name: 'x' },
                             { type: 'eq',
                               left: { type: 'property', name: 'aaardvark_pickerrrr/sometime' },
                               right: { type: 'literal', literalType: 'null', value: [ 'null', '' ] } } ] } ] } } ] },
           { type: 'transformation',
             func: 'aggregate',
             args:
              [ { type: 'alias',
                  name: 'sum_users',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args: [ { type: 'property', name: 'lanetix/id' } ] } },
                { type: 'alias',
                  name: 'sum_bananas',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args:
                      [ { type: 'property',
                          name: 'owns_aaardvark/aaardvark_pickerrrr/owner_id' } ] } } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Expand on Arrow -> Expand on Fiber -> Filter+Aggregate on Arrow/Fiber', function () {
      var ast = parser.parse(`$apply=filter(name ne 'Lucille')/expand(bluth_to_aardvark, expand(engineer_picker_example_set))/filter(bluth_to_aardvark/engineer_picker_example_set/any(x:x/coding_rival eq 12731255))/aggregate(age with max as oldest_bluth, bluth_to_aardvark/engineer_picker_example_set/lanetix/id with sum as sum_eng_ids)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'name' },
                  right: { type: 'literal', literalType: 'string', value: 'Lucille' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'bluth_to_aardvark' },
                { type: 'transformation',
                  func: 'expand',
                  args: [ { type: 'property', name: 'engineer_picker_example_set' } ] } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'functioncall',
                  func: 'any',
                  args:
                   [ { type: 'property',
                       name: 'bluth_to_aardvark/engineer_picker_example_set' },
                     { type: 'lambda',
                       args:
                        [ { type: 'property', name: 'x' },
                          { type: 'eq',
                            left: { type: 'property', name: 'coding_rival' },
                            right: { type: 'literal', literalType: 'integer', value: 12731255 } } ] } ] } ] },
           { type: 'transformation',
             func: 'aggregate',
             args:
              [ { type: 'alias',
                  name: 'oldest_bluth',
                  expression:
                   { type: 'aggregate',
                     func: 'max',
                     args: [ { type: 'property', name: 'age' } ] } },
                { type: 'alias',
                  name: 'sum_eng_ids',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args:
                      [ { type: 'property',
                          name: 'bluth_to_aardvark/engineer_picker_example_set/lanetix/id' } ] } } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Expand Fiber -> Expand Fiber -> Expand Fiber -> Filter', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')/expand(owns_aaardvark, expand(engineer_picker_example_set, expand(xref_ge_selected_engineer_set)))/filter(owns_aaardvark/any(x:x/engineer_picker_example_set/any(x:x/name eq 'Sahil')))/filter(owns_aaardvark/any(x:x/engineer_picker_example_set/any(x:x/xref_ge_selected_engineer_set/join_date eq '2016-04-01T21:00:00-07:00')))`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'owns_aaardvark' },
                { type: 'transformation',
                  func: 'expand',
                  args:
                   [ { type: 'property', name: 'engineer_picker_example_set' },
                     { type: 'transformation',
                       func: 'expand',
                       args: [ { type: 'property', name: 'xref_ge_selected_engineer_set' } ] } ] } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'functioncall',
                  func: 'any',
                  args:
                   [ { type: 'property', name: 'owns_aaardvark' },
                     { type: 'functioncall',
                       func: 'any',
                       args:
                        [ { type: 'property', name: 'engineer_picker_example_set' },
                          { type: 'lambda',
                            args:
                             [ { type: 'property', name: 'x' },
                               { type: 'eq',
                                 left: { type: 'property', name: 'name' },
                                 right: { type: 'literal', literalType: 'string', value: 'Sahil' } } ] } ] } ] } ] },
           { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'functioncall',
                  func: 'any',
                  args:
                   [ { type: 'property', name: 'owns_aaardvark' },
                     { type: 'functioncall',
                       func: 'any',
                       args:
                        [ { type: 'property', name: 'engineer_picker_example_set' },
                          { type: 'lambda',
                            args:
                             [ { type: 'property', name: 'x' },
                               { type: 'eq',
                                 left:
                                  { type: 'property',
                                    name: 'xref_ge_selected_engineer_set/join_date' },
                                 right:
                                  { type: 'literal',
                                    literalType: 'string',
                                    value: '2016-04-01T21:00:00-07:00' } } ] } ] } ] } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('Expand Fiber -> Expand Fiber -> Expand Fiber -> Aggregate', function () {
      var ast = parser.parse(`$apply=filter(first_name ne 'Marc')/expand(owns_aaardvark, expand(engineer_picker_example_set, expand(xref_ge_selected_engineer_set)))/aggregate(owns_aaardvark/lanetix/id with sum as sum_aaardy_ids, owns_aaardvark/engineer_picker_example_set/lanetix/id with min as min_eng_ids, owns_aaardvark/engineer_picker_example_set/xref_ge_selected_engineer_set/lanetix/id with min as min_xfers_ids)`)
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'ne',
                  left: { type: 'property', name: 'first_name' },
                  right: { type: 'literal', literalType: 'string', value: 'Marc' } } ] },
           { type: 'transformation',
             func: 'expand',
             args:
              [ { type: 'property', name: 'owns_aaardvark' },
                { type: 'transformation',
                  func: 'expand',
                  args:
                   [ { type: 'property', name: 'engineer_picker_example_set' },
                     { type: 'transformation',
                       func: 'expand',
                       args: [ { type: 'property', name: 'xref_ge_selected_engineer_set' } ] } ] } ] },
           { type: 'transformation',
             func: 'aggregate',
             args:
              [ { type: 'alias',
                  name: 'sum_aaardy_ids',
                  expression:
                   { type: 'aggregate',
                     func: 'sum',
                     args: [ { type: 'property', name: 'owns_aaardvark/lanetix/id' } ] } },
                { type: 'alias',
                  name: 'min_eng_ids',
                  expression:
                   { type: 'aggregate',
                     func: 'min',
                     args:
                      [ { type: 'property',
                          name: 'owns_aaardvark/engineer_picker_example_set/lanetix/id' } ] } },
                { type: 'alias',
                  name: 'min_xfers_ids',
                  expression:
                   { type: 'aggregate',
                     func: 'min',
                     args:
                      [ { type: 'property',
                          name: 'owns_aaardvark/engineer_picker_example_set/xref_ge_selected_engineer_set/lanetix/id' } ] } } ] } ] }
      assert.deepEqual(ast, expected)
    })

    it('operator precedence works within the transformation filter()', function () {
      var ast = parser.parse('$apply=filter( (x eq 1 or y eq 2) and (x eq 3 and (x eq 4 and y eq 5 or z eq 6) ) or top eq 7 )')
      const expected /*: ODataAST */ = {
        '$apply':
         [ { type: 'transformation',
             func: 'filter',
             args:
              [ { type: 'or',
                  left:
                   { type: 'and',
                     left:
                      { type: 'or',
                        left:
                         { type: 'eq',
                           left: { type: 'property', name: 'x' },
                           right: { type: 'literal', literalType: 'integer', value: 1 } },
                        right:
                         { type: 'eq',
                           left: { type: 'property', name: 'y' },
                           right: { type: 'literal', literalType: 'integer', value: 2 } } },
                     right:
                      { type: 'and',
                        left:
                         { type: 'eq',
                           left: { type: 'property', name: 'x' },
                           right: { type: 'literal', literalType: 'integer', value: 3 } },
                        right:
                         { type: 'or',
                           left:
                            { type: 'and',
                              left:
                               { type: 'eq',
                                 left: { type: 'property', name: 'x' },
                                 right: { type: 'literal', literalType: 'integer', value: 4 } },
                              right:
                               { type: 'eq',
                                 left: { type: 'property', name: 'y' },
                                 right: { type: 'literal', literalType: 'integer', value: 5 } } },
                           right:
                            { type: 'eq',
                              left: { type: 'property', name: 'z' },
                              right: { type: 'literal', literalType: 'integer', value: 6 } } } } },
                  right:
                   { type: 'eq',
                     left: { type: 'property', name: 'top' },
                     right: { type: 'literal', literalType: 'integer', value: 7 } } } ] } ] }
      assert.deepEqual(ast, expected)
    })
  })
})
