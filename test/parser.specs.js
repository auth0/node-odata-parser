

var assert = require('assert');
var parser = require("../lib");

describe('odata.parser grammar', function () {

    it('should parse $top and return the value', function () {

        var ast = parser.parse('$top=40');

        assert.equal(ast.$top, 40);
    });

    it('should parse two params', function () {

        var ast = parser.parse('$top=4&$skip=5');

        assert.equal(ast.$top, 4);
        assert.equal(ast.$skip, 5);
    });


    it('should parse three params', function () {

        var ast = parser.parse('$top=4&$skip=5&$select=Rating');

        assert.equal(ast.$top, 4);
        assert.equal(ast.$skip, 5);
        assert.equal(ast.$select[0], "Rating");
    });

    it('should parse string params', function () {

        var ast = parser.parse('$select=Rating');

        assert.equal(ast.$select[0], 'Rating');
    });

    it('should parse single character identifiers', function () {

        var ast = parser.parse('$select=a,b');

        assert.equal(ast.$select[0], 'a');
        assert.equal(ast.$select[1], 'b');
    });

    it('should accept * in $select', function () {

        var ast = parser.parse('$select=*');

        assert.equal(ast.$select[0], '*');
    });

    it('should accept * and , and / in $select', function () {

        var ast = parser.parse('$select=*,Category/Name');

        assert.equal(ast.$select[0], '*');
        assert.equal(ast.$select[1], 'Category/Name');
    });

    it('should accept more than two fields', function () {

        var ast = parser.parse('$select=Rating, Name,LastName');

        assert.equal(ast.$select[0], 'Rating');
        assert.equal(ast.$select[1], 'Name');
        assert.equal(ast.$select[2], 'LastName');
    });

    // This select parameter is not currently supported.
    it('should accept * after . in $select', function () {

        var ast = parser.parse('$select=DemoService.*');

        assert.equal(ast.$select[0], 'DemoService.*');
    });

    it('should parse order by', function () {

        var ast = parser.parse('$orderby=ReleaseDate desc, Rating');

        assert.equal(ast.$orderby[0].ReleaseDate, 'desc');
        assert.equal(ast.$orderby[1].Rating, 'asc');

    });

    it('should parse $apply=compute(concat(x,y) as z)', function () {

        var ast = parser.parse("$apply=compute(concat( name, 'e') as elephant)");

        assert.equal(ast.$apply[0].type, "transformation");
        assert.equal(ast.$apply[0].func, "compute");
        assert.equal(ast.$apply[0].args[0].type, "alias");
        assert.equal(ast.$apply[0].args[0].name, "elephant");
        assert.equal(ast.$apply[0].args[0].expression.type, "functioncall");
        assert.equal(ast.$apply[0].args[0].expression.func, "concat");
        assert.equal(ast.$apply[0].args[0].expression.args[0].type, "property");
        assert.equal(ast.$apply[0].args[0].expression.args[0].name, "name");
        assert.equal(ast.$apply[0].args[0].expression.args[1].type, "literal");
        assert.equal(ast.$apply[0].args[0].expression.args[1].value, "e");
    });

    it('should parse $apply=compute(concat(x,y) as z, concat(a,b) as g)', function () {
      var ast = parser.parse("$apply=compute(concat(x,y) as z, concat(a,b) as g)");

      assert.equal(ast.$apply[0].type, "transformation");
      assert.equal(ast.$apply[0].func, "compute");
      assert.equal(ast.$apply[0].args[0].type, "alias");
      assert.equal(ast.$apply[0].args[0].name, "z");
      assert.equal(ast.$apply[0].args[0].expression.type, "functioncall");
      assert.equal(ast.$apply[0].args[0].expression.func, "concat");
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, "property");
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, "x");
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, "property");
      assert.equal(ast.$apply[0].args[0].expression.args[1].name, "y");
      assert.equal(ast.$apply[0].args[1].type, "alias");
      assert.equal(ast.$apply[0].args[1].name, "g");
      assert.equal(ast.$apply[0].args[1].expression.type, "functioncall");
      assert.equal(ast.$apply[0].args[1].expression.func, "concat");
      assert.equal(ast.$apply[0].args[1].expression.args[0].type, "property");
      assert.equal(ast.$apply[0].args[1].expression.args[0].name, "a");
      assert.equal(ast.$apply[0].args[1].expression.args[1].type, "property");
      assert.equal(ast.$apply[0].args[1].expression.args[1].name, "b");
    });

    it('should parse nested transformations. $apply=compute(identity)', function () {
      // not sure this in meaningful. the mapper will be checking for valid child types
      var ast = parser.parse("$apply=compute(identity)");

      assert.equal(ast.$apply[0].type, "transformation");
      assert.equal(ast.$apply[0].func, "compute");
      assert.equal(ast.$apply[0].args[0].type, "transformation");
      assert.equal(ast.$apply[0].args[0].func, "identity");
    });

    it('should parse $apply=compute(concat(x,y) as z, ( 1 add 2 ) as g)', function () {
      var ast = parser.parse("$apply=compute(concat(x,y) as z, ( 1 add 2 ) as g)");

      assert.equal(ast.$apply[0].type, "transformation");
      assert.equal(ast.$apply[0].func, "compute");
      assert.equal(ast.$apply[0].args[0].type, "alias");
      assert.equal(ast.$apply[0].args[0].name, "z");
      assert.equal(ast.$apply[0].args[0].expression.type, "functioncall");
      assert.equal(ast.$apply[0].args[0].expression.func, "concat");
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, "property");
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, "x");
      assert.equal(ast.$apply[0].args[0].expression.args[1].type, "property");
      assert.equal(ast.$apply[0].args[0].expression.args[1].name, "y");
      assert.equal(ast.$apply[0].args[1].type, "alias");
      assert.equal(ast.$apply[0].args[1].name, "g");
      assert.equal(ast.$apply[0].args[1].expression.type, "add");
      assert.equal(ast.$apply[0].args[1].expression.left.type, "literal");
      assert.equal(ast.$apply[0].args[1].expression.left.value, 1);
      assert.equal(ast.$apply[0].args[1].expression.right.type, "literal");
      assert.equal(ast.$apply[0].args[1].expression.right.value, 2);
    });

    it('should parse multiple aggregate transformations. $apply=aggregate(t1, t2)', function () {
      var ast = parser.parse("$apply=aggregate(money_amount with sum as total, money_amount with min as minimum)");

      assert.equal(ast.$apply[0].type, "transformation");
      assert.equal(ast.$apply[0].func, "aggregate");

      assert.equal(ast.$apply[0].args[0].type, "alias");
      assert.equal(ast.$apply[0].args[0].name, "total");
      assert.equal(ast.$apply[0].args[0].expression.type, "aggregate");
      assert.equal(ast.$apply[0].args[0].expression.func, "sum");
      assert.equal(ast.$apply[0].args[0].expression.args[0].type, "property");
      assert.equal(ast.$apply[0].args[0].expression.args[0].name, "money_amount");

      assert.equal(ast.$apply[0].args[1].type, "alias");
      assert.equal(ast.$apply[0].args[1].name, "minimum");
      assert.equal(ast.$apply[0].args[1].expression.type, "aggregate");
      assert.equal(ast.$apply[0].args[1].expression.func, "min");
      assert.equal(ast.$apply[0].args[1].expression.args[0].type, "property");
      assert.equal(ast.$apply[0].args[1].expression.args[0].name, "money_amount");
    });

    it('should parse serial transformations. $apply=filter()/aggregate()', function () {
      // not sure this in meaningful. the mapper will be checking for valid child types
      var ast = parser.parse("$apply=filter(nullable_integer eq 123)/aggregate(money_amount with sum as total)");

      assert.equal(ast.$apply[0].type, "transformation");
      assert.equal(ast.$apply[0].func, "filter");
      assert.equal(ast.$apply[0].args[0].type, "eq");
      assert.equal(ast.$apply[0].args[0].left.type, "property");
      assert.equal(ast.$apply[0].args[0].left.name, "nullable_integer");
      assert.equal(ast.$apply[0].args[0].right.type, "literal");
      assert.equal(ast.$apply[0].args[0].right.value, 123);

      assert.equal(ast.$apply[1].type, "transformation");
      assert.equal(ast.$apply[1].func, "aggregate");
      assert.equal(ast.$apply[1].args[0].type, "alias");
      assert.equal(ast.$apply[1].args[0].name, "total");
      assert.equal(ast.$apply[1].args[0].expression.type, "aggregate");
      assert.equal(ast.$apply[1].args[0].expression.func, "sum");
      assert.equal(ast.$apply[1].args[0].expression.args[0].type, "property");
      assert.equal(ast.$apply[1].args[0].expression.args[0].name, "money_amount");
    });

    it('should parse $filter', function () {

        var ast = parser.parse("$filter=Name eq 'Jef'");

        assert.equal(ast.$filter.type, "eq");
        assert.equal(ast.$filter.left.type, "property");
        assert.equal(ast.$filter.left.name, "Name");
        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, "Jef");
    });

    it('should parse $filter containing quote', function () {

        var ast = parser.parse("$filter=Name eq 'O''Neil'");

        assert.equal(ast.$filter.type, "eq");
        assert.equal(ast.$filter.left.type, "property");
        assert.equal(ast.$filter.left.name, "Name");
        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, "O'Neil");
    });

    it('should parse $filter with subproperty', function () {
      	var ast = parser.parse("$filter=User/Name eq 'Jef'");
      	assert.equal(ast.$filter.type, "eq");
      	assert.equal(ast.$filter.left.type, "property");
      	assert.equal(ast.$filter.left.name, "User/Name");
      	assert.equal(ast.$filter.right.type, "literal");
      	assert.equal(ast.$filter.right.value, "Jef");
    });

    it('should parse multiple conditions in a $filter', function () {

        var ast = parser.parse("$filter=Name eq 'John' and LastName lt 'Doe'");

        assert.equal(ast.$filter.type, "and");
        assert.equal(ast.$filter.left.type, "eq");
        assert.equal(ast.$filter.left.left.type, "property");
        assert.equal(ast.$filter.left.left.name, "Name");
        assert.equal(ast.$filter.left.right.type, "literal");
        assert.equal(ast.$filter.left.right.value, "John");
        assert.equal(ast.$filter.right.type, "lt");
        assert.equal(ast.$filter.right.left.type, "property");
        assert.equal(ast.$filter.right.left.name, "LastName");
        assert.equal(ast.$filter.right.right.type, "literal");
        assert.equal(ast.$filter.right.right.value, "Doe");
    });

    it('should parse substringof $filter', function () {

        var ast = parser.parse("$filter=substringof('nginx', Data)");

        assert.equal(ast.$filter.type, "functioncall");
        assert.equal(ast.$filter.func, "substringof");

        assert.equal(ast.$filter.args[0].type, "literal");
        assert.equal(ast.$filter.args[0].value, "nginx");

        assert.equal(ast.$filter.args[1].type, "property");
        assert.equal(ast.$filter.args[1].name, "Data");

    });

    it('should parse substringof $filter with empty string', function () {

        var ast = parser.parse("$filter=substringof('', Data)");

        assert.equal(ast.$filter.args[0].type, "literal");
        assert.equal(ast.$filter.args[0].value, "");

    });

    it('should parse substringof $filter with string containing quote', function () {

      var ast = parser.parse("$filter=substringof('ng''inx', Data)");
      assert.equal(ast.$filter.args[0].type, "literal");
      assert.equal(ast.$filter.args[0].value, "ng'inx");

    });

    it('should parse substringof $filter with string starting with quote', function () {

      var ast = parser.parse("$filter=substringof('''nginx', Data)");

      assert.equal(ast.$filter.args[0].type, "literal");
      assert.equal(ast.$filter.args[0].value, "'nginx");

    });

    it('should parse substringof $filter with string ending with quote', function () {

      var ast = parser.parse("$filter=substringof('nginx''', Data)");

      assert.equal(ast.$filter.args[0].type, "literal");
      assert.equal(ast.$filter.args[0].value, "nginx'");

    });

    it('should parse substringof eq true in $filter', function () {

        var ast = parser.parse("$filter=substringof('nginx', Data) eq true");

        assert.equal(ast.$filter.type, "eq");


        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.func, "substringof");
        assert.equal(ast.$filter.left.args[0].type, "literal");
        assert.equal(ast.$filter.left.args[0].value, "nginx");
        assert.equal(ast.$filter.left.args[1].type, "property");
        assert.equal(ast.$filter.left.args[1].name, "Data");

        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, true);
    });

    it('should parse startswith $filter', function () {

        var ast = parser.parse("$filter=startswith('nginx', Data)");

        assert.equal(ast.$filter.type, "functioncall");
        assert.equal(ast.$filter.func, "startswith");

        assert.equal(ast.$filter.args[0].type, "literal");
        assert.equal(ast.$filter.args[0].value, "nginx");

        assert.equal(ast.$filter.args[1].type, "property");
        assert.equal(ast.$filter.args[1].name, "Data");

    });

    it('should parse startswith $filter', function () {

        var ast = parser.parse("$filter=contains(Data, 'nginx')");

        assert.equal(ast.$filter.type, "functioncall");
        assert.equal(ast.$filter.func, "contains");

        assert.equal(ast.$filter.args[0].type, "property");
        assert.equal(ast.$filter.args[0].name, "Data");

        assert.equal(ast.$filter.args[1].type, "literal");
        assert.equal(ast.$filter.args[1].value, "nginx");

    });

    it('should parse any(lambdaFunc) eq true $filter', function () {

        var ast = parser.parse("$filter=linked_table/any_num_hops/string_list/any(list_item:list_item eq 'test') eq true");

        assert.equal(ast.$filter.type, "eq");

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.func, "any");

        assert.equal(ast.$filter.left.args[0].type, "property");
        assert.equal(ast.$filter.left.args[0].name, "linked_table/any_num_hops/string_list");

        assert.equal(ast.$filter.left.args[1].type, "lambda");
        assert.equal(ast.$filter.left.args[1].args[0].type, "property");
        assert.equal(ast.$filter.left.args[1].args[0].name, "list_item");
        assert.equal(ast.$filter.left.args[1].args[1].type, "eq");
        assert.equal(ast.$filter.left.args[1].args[1].left.type, "property");
        assert.equal(ast.$filter.left.args[1].args[1].left.name, "list_item");
        assert.equal(ast.$filter.left.args[1].args[1].right.type, "literal");
        assert.equal(ast.$filter.left.args[1].args[1].right.value, "test");

        assert.equal(ast.$filter.right.value.true);

    });

    it('should parse all(lambdaFunc) eq true $filter', function () {

        var ast = parser.parse("$filter=linked_table/any_num_hops/string_list/all(list_item:list_item eq 'test') eq true");

        assert.equal(ast.$filter.type, "eq");

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.func, "all");

        assert.equal(ast.$filter.left.args[0].type, "property");
        assert.equal(ast.$filter.left.args[0].name, "linked_table/any_num_hops/string_list");

        assert.equal(ast.$filter.left.args[1].type, "lambda");
        assert.equal(ast.$filter.left.args[1].args[0].type, "property");
        assert.equal(ast.$filter.left.args[1].args[0].name, "list_item");
        assert.equal(ast.$filter.left.args[1].args[1].type, "eq");
        assert.equal(ast.$filter.left.args[1].args[1].left.type, "property");
        assert.equal(ast.$filter.left.args[1].args[1].left.name, "list_item");
        assert.equal(ast.$filter.left.args[1].args[1].right.type, "literal");
        assert.equal(ast.$filter.left.args[1].args[1].right.value, "test");

        assert.equal(ast.$filter.right.value.true);

    });

    ['tolower', 'toupper', 'trim'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
          var ast = parser.parse("$filter=" + func + "(value) eq 'test'");

          assert.equal(ast.$filter.type, "eq");

          assert.equal(ast.$filter.left.type, "functioncall");
          assert.equal(ast.$filter.left.func, func);
          assert.equal(ast.$filter.left.args[0].type, "property");
          assert.equal(ast.$filter.left.args[0].name, "value");

          assert.equal(ast.$filter.right.type, "literal");
          assert.equal(ast.$filter.right.value, "test");
      });
    });

    ['year', 'month', 'day', 'hour', 'minute', 'second'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse("$filter=" + func + "(value) gt 0");

          assert.equal(ast.$filter.type, "gt");

          assert.equal(ast.$filter.left.type, "functioncall");
          assert.equal(ast.$filter.left.func, func);
          assert.equal(ast.$filter.left.args[0].type, "property");
          assert.equal(ast.$filter.left.args[0].name, "value");

          assert.equal(ast.$filter.right.type, "literal");
          assert.equal(ast.$filter.right.value, "0");
      });
    });

    ['indexof', 'concat', 'substring', 'replace'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse("$filter=" + func + "('haystack', needle) eq 'test'");

        assert.equal(ast.$filter.type, "eq");

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.func, func);
        assert.equal(ast.$filter.left.args[0].type, "literal");
        assert.equal(ast.$filter.left.args[0].value, "haystack");
        assert.equal(ast.$filter.left.args[1].type, "property");
        assert.equal(ast.$filter.left.args[1].name, "needle");

        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, "test");
      });
    });

    it('should return an error if invalid value', function() {

        var ast = parser.parse("$top=foo");

        assert.equal(ast.error, "invalid $top parameter");
    });


    it('should convert dates to javascript Date', function () {
        var ast = parser.parse("$top=2&$filter=Date gt datetime'2012-09-27T21:12:59'");
        assert.ok(ast.$filter.right.value instanceof Date);
        assert.equal(ast.$filter.right.literalType, 'datetime');
    });

    it('should parse boolean okay', function(){
        var ast = parser.parse('$filter=status eq true');
        assert.equal(ast.$filter.right.value, true);
        assert.equal(ast.$filter.right.literalType, 'boolean');
        var ast = parser.parse('$filter=status eq false');
        assert.equal(ast.$filter.right.value, false);
        assert.equal(ast.$filter.right.literalType, 'boolean');
    });

    it('should parse numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3');
        assert.equal(ast.$filter.right.value, 3);
        assert.equal(ast.$filter.right.literalType, 'integer');
        // Test multiple digits - problem of not joining digits to array
        ast = parser.parse('$filter=status eq 34');
        assert.equal(ast.$filter.right.value, 34);
        assert.equal(ast.$filter.right.literalType, 'integer');
        // Test number starting with 1 - problem of boolean rule order
        ast = parser.parse('$filter=status eq 12');
        assert.equal(ast.$filter.right.value, 12);
        assert.equal(ast.$filter.right.literalType, 'integer');
    });

    it('should parse negative numbers okay', function(){
        var ast = parser.parse('$filter=status eq -3');
        assert.equal(ast.$filter.right.value, -3);
        assert.equal(ast.$filter.right.literalType, 'integer');
        ast = parser.parse('$filter=status eq -34');
        assert.equal(ast.$filter.right.value, -34);
        assert.equal(ast.$filter.right.literalType, 'integer');
    });

    it('should parse decimal numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3.4');
        assert.equal(ast.$filter.right.value, '3.4');
        assert.equal(ast.$filter.right.literalType, 'decimal');
        ast = parser.parse('$filter=status eq -3.4');
        assert.equal(ast.$filter.right.value, '-3.4');
        assert.equal(ast.$filter.right.literalType, 'decimal');
    });

    it('should parse double numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3.4e1');
        assert.equal(ast.$filter.right.value, '3.4e1');
        assert.equal(ast.$filter.right.literalType, 'double');
        ast = parser.parse('$filter=status eq -3.4e-1');
        assert.equal(ast.$filter.right.value, '-3.4e-1');
        assert.equal(ast.$filter.right.literalType, 'double');
    });

    it('should parse cond with eq|le|ge|lt|gt as the root, with the mathOp as the subtree', function(){
        var ast = parser.parse('$filter=( 38 sub ( 83 add ( 8 mod 2 ) ) ) eq ( ( 2 mul 4 ) div 33 )');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'sub');
        assert.equal(ast.$filter.left.left.type, 'literal');
        assert.equal(ast.$filter.left.left.value, 38);
        assert.equal(ast.$filter.left.right.type, 'add');
        assert.equal(ast.$filter.left.right.left.type, 'literal');
        assert.equal(ast.$filter.left.right.left.value, 83);
        assert.equal(ast.$filter.left.right.right.type, 'mod');
        assert.equal(ast.$filter.left.right.right.left.type, 'literal');
        assert.equal(ast.$filter.left.right.right.left.value, 8);
        assert.equal(ast.$filter.left.right.right.right.type, 'literal');
        assert.equal(ast.$filter.left.right.right.right.value, 2);
        assert.equal(ast.$filter.right.type, 'div');
        assert.equal(ast.$filter.right.left.type, 'mul');
        assert.equal(ast.$filter.right.left.left.type, 'literal');
        assert.equal(ast.$filter.right.left.left.value, 2);
        assert.equal(ast.$filter.right.left.right.type, 'literal');
        assert.equal(ast.$filter.right.left.right.value, 4);
        assert.equal(ast.$filter.right.right.type, 'literal');
        assert.equal(ast.$filter.right.right.value, 33);
    });

    it('should parse identifer.unit in math equation', function(){
        var ast = parser.parse('$filter=( birthday.month() sub 1 ) eq 7');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'sub');
        assert.equal(ast.$filter.left.left.type, 'property');
        assert.equal(ast.$filter.left.left.name, 'birthday');
        assert.equal(ast.$filter.left.left.unit, 'month');
        assert.equal(ast.$filter.left.right.type, 'literal');
        assert.equal(ast.$filter.left.right.value, '1');
        assert.equal(ast.$filter.right.type, 'literal');
        assert.equal(ast.$filter.right.value, '7');
    });

    it('should parse identifer.unit now.unit for last month ', function(){
        var ast = parser.parse('$filter=birthday.month() eq ( now().month() sub 1 )');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'property');
        assert.equal(ast.$filter.left.name, 'birthday');
        assert.equal(ast.$filter.left.unit, 'month');
        assert.equal(ast.$filter.right.type, 'sub');
        assert.equal(ast.$filter.right.left.type, 'now');
        assert.equal(ast.$filter.right.left.unit, 'month');
        assert.equal(ast.$filter.right.right.type, 'literal');
        assert.equal(ast.$filter.right.right.value, '1');
    });

    it('should parse identifer.unit now.unit for last quarter ', function(){
        var ast = parser.parse('$filter=birthday.quarter() eq ( now().quarter() sub 1 )');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'property');
        assert.equal(ast.$filter.left.name, 'birthday');
        assert.equal(ast.$filter.left.unit, 'quarter');
        assert.equal(ast.$filter.right.type, 'sub');
        assert.equal(ast.$filter.right.left.type, 'now');
        assert.equal(ast.$filter.right.left.unit, 'quarter');
        assert.equal(ast.$filter.right.right.type, 'literal');
        assert.equal(ast.$filter.right.right.value, '1');
    });

    it('should parse identifer.unit now.unit for last week, with identifierPath ', function(){
        var ast = parser.parse('$filter=related/related/created_at.week() eq ( now().week() sub 1 )');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'property');
        assert.equal(ast.$filter.left.name, 'related/related/created_at');
        assert.equal(ast.$filter.left.unit, 'week');
        assert.equal(ast.$filter.right.type, 'sub');
        assert.equal(ast.$filter.right.left.type, 'now');
        assert.equal(ast.$filter.right.left.unit, 'week');
        assert.equal(ast.$filter.right.right.type, 'literal');
        assert.equal(ast.$filter.right.right.value, '1');
    });

    it('should parse identifer.unit now.unit for next month ', function(){
        var ast = parser.parse('$filter=birthday.month() eq ( now().month() add 1 )');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'property');
        assert.equal(ast.$filter.left.name, 'birthday');
        assert.equal(ast.$filter.left.unit, 'month');
        assert.equal(ast.$filter.right.type, 'add');
        assert.equal(ast.$filter.right.left.type, 'now');
        assert.equal(ast.$filter.right.left.unit, 'month');
        assert.equal(ast.$filter.right.right.type, 'literal');
        assert.equal(ast.$filter.right.right.value, '1');
    });

    it('should parse identifer.unit now.unit for this month ', function(){
        var ast = parser.parse('$filter=birthday.month() eq now().month()');
        assert.equal(ast.$filter.type, 'eq');
        assert.equal(ast.$filter.left.type, 'property');
        assert.equal(ast.$filter.left.name, 'birthday');
        assert.equal(ast.$filter.left.unit, 'month');
        assert.equal(ast.$filter.right.type, 'now');
        assert.equal(ast.$filter.right.unit, 'month');
    });

    it('should parse parameterAliasIdentifier', function(){
        var ast = parser.parse('$filter=closingDate eq @lx_date_this_week');
        assert.equal(ast.$filter.right.type, 'parameterAlias');
        assert.equal(ast.$filter.right.name, 'lx_date_this_week');
    });

    it('should parse parameterAliasExpression', function(){
        var ast = parser.parse('@lx_date_this_week=43242');
        assert.equal(ast.parameterAliasExpr.parameterAlias.type, 'parameterAlias');
        assert.equal(ast.parameterAliasExpr.parameterAlias.name, 'lx_date_this_week');
        assert.equal(ast.parameterAliasExpr.value.type, 'literal');
        assert.equal(ast.parameterAliasExpr.value.value, '43242');
    });

    it('should parse parameterAliasExpression with cond', function(){
        var ast = parser.parse("@lx_date_this_week=closingDate gt datetime'2012-09-27T21:12:59'");
        assert.equal(ast.parameterAliasExpr.parameterAlias.type, 'parameterAlias');
        assert.equal(ast.parameterAliasExpr.parameterAlias.name, 'lx_date_this_week');
        assert.equal(ast.parameterAliasExpr.value.type, 'gt');
        assert.equal(ast.parameterAliasExpr.value.left.type, 'property');
        assert.equal(ast.parameterAliasExpr.value.left.name, 'closingDate');
        assert.equal(ast.parameterAliasExpr.value.right.type, 'literal');
        // AssertionError: 2012-09-27T21:12:59.000Z == '2012-09-27T21:12:59.000Z'
    });


    it('should parse $expand and return an array of identifier paths', function () {
        var ast = parser.parse('$expand=Category,Products/Suppliers,Items($expand=ItemRatings;$select=ItemDetails;$search="foo")');
        assert.equal(ast.$expand[0].path, 'Category');
        assert.equal(ast.$expand[1].path, 'Products/Suppliers');
        assert.equal(ast.$expand[2].path, 'Items');
        assert.equal(ast.$expand[2].options.$expand[0].path, 'ItemRatings');
        assert.equal(ast.$expand[2].options.$select[0], 'ItemDetails');
        assert.equal(ast.$expand[2].options.$search, 'foo');
    });

    it('should not allow duplicate expand paths', function () {
        var ast = parser.parse('$expand=ItemRatings,ItemRatings');
        assert.equal(ast.error, 'duplicate $expand navigationProperty');
    });

    it('should allow only valid values for $count', function () {
        var ast = parser.parse('$count=true');
        assert.equal(ast.$count, true);

        ast = parser.parse('$count=false');
        assert.equal(ast.$count, false);

        ast = parser.parse('$count=');
        assert.equal(ast.error, 'invalid $count parameter');

        ast = parser.parse('$count=test');
        assert.equal(ast.error, 'invalid $count parameter');
    });

    it('should parse $format okay', function () {
        var ast = parser.parse('$format=application/atom+xml');
        assert.equal(ast.$format, 'application/atom+xml');

        ast = parser.parse('$format=');
        assert.equal(ast.error, 'invalid $format parameter');
    });

    it('should parse $search okay', function () {
        var ast = parser.parse('$search="foo bar baz"');
        assert.equal(ast.$search, 'foo bar baz');

        ast = parser.parse('$search=');
        assert.equal(ast.error, 'invalid $search parameter');
    });

    it('should parse long paths in $filter conditions', function () {
        var ast = parser.parse("$filter=publisher/president/likes/author/firstname eq 'John'");
        assert.equal(ast.$filter.left.name, "publisher/president/likes/author/firstname");
    });

    it('should parse $callback', function () {
        var ast = parser.parse("$callback=jQuery191039675481244921684_1424879147656");
        assert.equal(ast.$callback, "jQuery191039675481244921684_1424879147656");
    });
});

describe('odata path parser grammar', function () {

    it('should parse single resource', function () {
        var ast = parser.parse('Customers');
        assert.equal(ast.$path[0].name, 'Customers');
    });

    it('should parse resource with literal predicate', function () {
        var ast = parser.parse('Customers(1)');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[0].predicates[0].type, 'literal');
        assert.equal(ast.$path[0].predicates[0].value, 1);
    });

    it('should parse resource with property predicate', function () {
        var ast = parser.parse('Customers(CustomerID=1)');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[0].predicates[0].type, 'property');
        assert.equal(ast.$path[0].predicates[0].name, 'CustomerID');
        assert.equal(ast.$path[0].predicates[0].value, 1);
    });

    it('should parse resource with two property predicates', function () {
        var ast = parser.parse('Customers(CustomerID=1,ContactName=\'Joe\')');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[0].predicates[0].type, 'property');
        assert.equal(ast.$path[0].predicates[0].name, 'CustomerID');
        assert.equal(ast.$path[0].predicates[0].value, 1);
        assert.equal(ast.$path[0].predicates[1].type, 'property');
        assert.equal(ast.$path[0].predicates[1].name, 'ContactName');
        assert.equal(ast.$path[0].predicates[1].value, 'Joe');
    });

    it('should parse two resources', function () {
        var ast = parser.parse('Customers(1)/ContactName');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[1].name, 'ContactName');
    });

    it('should parse resources starting with $', function () {
        var ast = parser.parse('Customers(1)/$value');
        assert.equal(ast.$path[1].name, '$value');
        var ast = parser.parse('Customers/$count');
        assert.equal(ast.$path[1].name, '$count');
    });

});

describe('odata path and query parser grammar', function () {

    it('should parse both path and query', function () {
        var ast = parser.parse('Customers?$top=10');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$top, 10);
    });

});
