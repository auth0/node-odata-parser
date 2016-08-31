

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

        var ast = parser.parse("$filter=string_list|any(list_item:list_item eq 'test') eq true");

        // assert.equal(ast.$filter.type, "eq");

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.path, "string_list");
        assert.equal(ast.$filter.left.func, "any");

        assert.equal(ast.$filter.left.args[0].type, "eq");
        assert.equal(ast.$filter.left.args[0].type, "eq");
        assert.equal(ast.$filter.left.args[0].left, "list_item");
        assert.equal(ast.$filter.left.args[0].right.value, "test");

        assert.equal(ast.$filter.right.value.true);

    });

    it('should parse all(lambdaFunc) eq true $filter', function () {

        var ast = parser.parse("$filter=string_list|all(list_item:list_item eq 'test') eq true");

        // assert.equal(ast.$filter.type, "eq");

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.path, "string_list");
        assert.equal(ast.$filter.left.func, "all");

        assert.equal(ast.$filter.left.args[0].type, "eq");
        assert.equal(ast.$filter.left.args[0].left, "list_item");
        assert.equal(ast.$filter.left.args[0].right.value, "test");

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
    });

    it('should parse boolean okay', function(){
        var ast = parser.parse('$filter=status eq true');
        assert.equal(ast.$filter.right.value, true);
        var ast = parser.parse('$filter=status eq false');
        assert.equal(ast.$filter.right.value, false);
    });

    it('should parse numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3');
        assert.equal(ast.$filter.right.value, 3);
        // Test multiple digits - problem of not joining digits to array
        ast = parser.parse('$filter=status eq 34');
        assert.equal(ast.$filter.right.value, 34);
        // Test number starting with 1 - problem of boolean rule order
        ast = parser.parse('$filter=status eq 12');
        assert.equal(ast.$filter.right.value, 12);
    });

    it('should parse negative numbers okay', function(){
        var ast = parser.parse('$filter=status eq -3');
        assert.equal(ast.$filter.right.value, -3);
        ast = parser.parse('$filter=status eq -34');
        assert.equal(ast.$filter.right.value, -34);
    });

    it('should parse decimal numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3.4');
        assert.equal(ast.$filter.right.value, '3.4');
        ast = parser.parse('$filter=status eq -3.4');
        assert.equal(ast.$filter.right.value, '-3.4');
    });

    it('should parse double numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3.4e1');
        assert.equal(ast.$filter.right.value, '3.4e1');
        ast = parser.parse('$filter=status eq -3.4e-1');
        assert.equal(ast.$filter.right.value, '-3.4e-1');
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
