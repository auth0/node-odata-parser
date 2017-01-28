/*
 * OData query expression grammar.
 * Note: use this gramar with pegjs:
 *  - http://pegjs.majda.cz/
 *  - https://github.com/dmajda/pegjs
 */

start                       = url

/*
 * Basic cons.
 */

WSP                         =  ' '  //Whitespace
DIGIT                       = [0-9]
INT                         = a:DIGIT+ { return a.join(''); }
HEXDIG                      =   [0-9a-fA-F]
//peg does not support repetition (ie: [a]{4})
HEXDIG2                     =   HEXDIG HEXDIG
HEXDIG4                     =   HEXDIG2 HEXDIG2
HEXDIG8                     =   HEXDIG4 HEXDIG8


SQUOTE                      =   "%x27" / "'"

DQUOTE                      =   "%x22" / "\""

// end: Basic cons

/*
 * OData literals - adapted from OData ABNF:
 *  - http://www.odata.org/media/30002/OData%20ABNF.html
 */
primitiveLiteral            =   null /
                                binary /
                                dateTime /
                                dateTimeOffset /
                                guid /
                                double /
                                decimal /
                                single /
                                int32 /
                                int64 /
                                byte /
                                sbyte /
                                boolean /
                                string


null                        =   "null" ( "'" identifier "'" )?
                                // The optional qualifiedTypeName is used to specify what type this null value should be considered.
                                // Knowing the type is useful for function overload resolution purposes.

binary                      =   ( "%d88" / "binary" )
                                SQUOTE
                                HEXDIG HEXDIG
                                SQUOTE
                                // note: "X" is case sensitive "binary" is not hence using the character code.

boolean                     =   "true" { return true; } /
                                "1" { return true; } /
                                "false" { return false; } /
                                "0" { return false; }

byte                        =   DIGIT DIGIT DIGIT
                                // numbers in the range from 0 to 257

dateTime                    =   "datetime" SQUOTE a:dateTimeBody SQUOTE { return new Date(a); }

dateTimeOffset              =   "datetimeoffset" SQUOTE dateTimeOffsetBody SQUOTE

dateTimeBodyA               =  a:year "-" b:month "-" c:day "T" d:hour ":" e:minute "Z"? {
                                    return a + '-' + b + '-' + c + "T" + d + ":" + e;
                                }
dateTimeBodyB               =  a:dateTimeBodyA ":" b:second "Z"? { return a + ":" + b; }
dateTimeBodyC               =  a:dateTimeBodyB "." b:nanoSeconds { return a + "." + b; }
dateTimeBodyD               =  a:dateTimeBodyC "-" b:zeroToTwentyFour ":" c:zeroToSixty {
                                    return a + "-" + b + ":" + c;
                                }
dateTimeBody                =
                               dateTimeBodyD
                             / dateTimeBodyC
                             / dateTimeBodyB
                             / dateTimeBodyA

dateTimeOffsetBody          =   dateTimeBody "Z" / // TODO: is the Z optional?
                                dateTimeBody sign zeroToThirteen ":00" /
                                dateTimeBody sign zeroToThirteen /
                                dateTimeBody sign zeroToTwelve ":" zeroToSixty /
                                dateTimeBody sign zeroToTwelve

decimal                     =  sign:sign? digit:DIGIT+ "." decimal:DIGIT+ ("M"/"m")? { return sign + digit.join('') + '.' + decimal.join(''); } /
                               sign? DIGIT+ ("M"/"m") { return sign + digit.join(''); }

double                      =  sign:sign? digit:DIGIT "." decimal:DIGIT+ ("e" / "E") signexp:sign? exp:DIGIT+ ("D" / "d")? { return sign + digit + '.' + decimal.join('') + 'e' + signexp + exp.join(''); } /
                               sign:sign? digit:DIGIT+ "." decimal:DIGIT+ ("D" / "d") { return sign + digit.join('') + '.' + decimal.join(''); } /
                               sign:sign? digit:DIGIT+ ("D" / "d") { return sign + digit.join(''); } /
                               nanInfinity ("D" / "d")?

guid                        =   "guid" SQUOTE HEXDIG8 "-" HEXDIG4 "-" HEXDIG4 "-" HEXDIG8 HEXDIG4 SQUOTE

int32                       =   sign:sign? digit:DIGIT+ { return parseInt(digit.join('')) * (sign === '-' ? -1 : 1); }
                                // numbers in the range from -2147483648 to 2147483647

int64                       =   sign? DIGIT+ ( "L" / "l" )?
                                // numbers in the range from -9223372036854775808 to 9223372036854775807

sbyte                       =   sign? DIGIT DIGIT? DIGIT?
                                // numbers in the range from -128 to 127

single                      =   (
                                    sign DIGIT "." DIGIT+ ( "e" / "E" ) sign DIGIT+ /
                                    sign DIGIT* "." DIGIT+ /
                                    sign DIGIT+
                                ) ("F" / "f") /
                                nanInfinity ( "F" / "f" )?

string                      =   l:SQUOTE v:validstring  r:SQUOTE { return v; }


oneToNine                   =   [1-9]

zeroToTwelve                =   a:"0" b:[1-9] { return a + b;} / a:"1" b:[0-2] { return a + b; }

zeroToThirteen              =   zeroToTwelve / "13"

zeroToSixty                 =   "60" / a:[0-5] b:DIGIT { return a + b; }

zeroToThirtyOne             =   "3" a:[0-1] { return "3" + a; } / a:[0-2] b:DIGIT { return a + b; }

zeroToTwentyFour            =   "2" a:[0-4] { return "2" + a; } / a:[0-1] b:DIGIT { return a + b; }

year                        =  a:DIGIT b:DIGIT c:DIGIT d:DIGIT { return a + b + c + d; }

month                       =   zeroToTwelve

day                         =   zeroToThirtyOne

hour                        =   zeroToTwentyFour

minute                      =   zeroToSixty

second                      =   zeroToSixty

nanoSeconds                 =  INT

sign                        =   "+" / "-"

nan                         =   "NaN"

negativeInfinity            =   "-INF"

positiveInfinity            =   "INF"

nanInfinity                 =   nan / negativeInfinity / positiveInfinity

// end: OData literals

/*
 * OData identifiers
 */

unreserved                  = [a-zA-Z0-9-_]

//pctEncodedUnescaped =       = "%" [01346789A-F] HEXDIG
//                            / "%2" [013456789A-F]
//                            / "%5" [0-9ABDEF]
validstring                 = a:([^']/escapedQuote)* { return a.join('').replace(/('')/g, "'"); }
escapedQuote                = a:"''" { return a; }

// Fixme: this is wrong.
QCHAR_NO_AMP_DQUOTE         = [^"]

identifierPart              = a:[a-zA-Z] b:unreserved* { return a + b.join(''); }

identifier                  = identifierPart

// denote when an identifier is a parameter alias. So the mapper can search for the matching parameterAliasExpr
parameterAliasIdentifier    = "@" a:identifier {
                                return {
                                    type:'parameterAlias',
                                    name: a
                                }
                            }

identifierPathParts         =   "/" i:identifierPart list:identifierPathParts? {
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    return "/" + i + list;
                                }

identifierPath              =   a:identifier b:identifierPathParts? { return a + b; }

// FIXME: cannot place aliasExpression as option here. Because in odata ABNF, is only in transformations.
identifierRoot              = parameterAliasIdentifier /
                              n:identifierPath u:unit? {
                                if (u) {
                                  return {
                                      type: 'property',
                                      name: n,
                                      unit: u
                                  }
                                } else {
                                  return {
                                      type: 'property',
                                      name: n
                                  }
                                }
                              }

unit                        = "." u:unitArg "()" {
                                return u ;
                              }

// everything which accepts a timestamp for unit extraction
unitArg                    = "microseconds" / "milliseconds" / "second" / "minute" /
                              "hour" / "day" / "week" / "month" / "quarter" / "year" /
                              "decade" / "century" / "millennium"

// end: OData identifiers

/*
 * OData query options
 */

// callback
callback                    =   "$callback=" a:identifier { return { '$callback': a }; }

// $top
top                         =   "$top=" a:INT { return { '$top': ~~a }; }
                            /   "$top=" .* { return {"error": 'invalid $top parameter'}; }

// $expand
expand                      =   "$expand=" list:expandList {
                                    if (typeof list.error === 'string') {
                                      return { "error": list.error }
                                    }
                                    return { "$expand": list };
                                }
                            /   "$expand=" .* { return {"error": 'invalid $expand parameter'}; }

expandList                  =   p:identifierPath opts:("(" WSP? o:expandOptionList WSP? ")" { return o; })? list:("," WSP? l:expandList {return l;})? {
                                    if (opts === "") opts = [];
                                    var options = {};
                                    for(var i in opts){

                                        if (opts[i] !== "") {
                                            var paramName = Object.keys(opts[i])[0]; //ie: $top
                                            options[paramName] = opts[i][paramName];
                                            if (paramName === 'error') {
                                              return { "error": opts[i][paramName] };
                                            }
                                        }
                                    }
                                    if (list === "") list = [];
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    if (typeof list.error === 'string') {
                                      return { "error": list.error }
                                    }
                                    // FIXME: Make this just look at the navigation property, not the ancillary type information,
                                    // and store the rest of the type information elsewhere in the structure.
                                    if (list.findIndex(function (entry) { return entry.path === p; }) !== -1) {
                                      return {"error": 'duplicate $expand navigationProperty'};
                                    }
                                    list.unshift({ path: p, options: options });
                                    return list;
                                }

expandOption                =
                                expand /
                                filter /
                                search /
                                orderby /
                                skip /
                                top /
                                inlinecount /
                                select /
                                unsupported

expandOptionList            = e:expandOption WSP? ";" WSP? el:expandOptionList { return [e].concat(el); } /
                              e:expandOption { return [e]; }

//$skip
skip                        =   "$skip=" a:INT {return {'$skip': ~~a }; }
                            /   "$skip=" .* { return {"error": 'invalid $skip parameter'}; }

//$format
format                      =   "$format=" v:.+ { return {'$format': v.join('') }; }
                            /   "$format=" .* { return {"error": 'invalid $format parameter'}; }
//$inlinecount
inlinecount                 =   "$count=" v:boolean { return {'$count': v }; }
                            /   "$count=" .* { return {"error": 'invalid $count parameter'}; }

search                      =   "$search=" WSP? s:searchExpr { return { '$search': s } }
                            /   "$search=" .* { return {"error": 'invalid $search parameter'}; }

searchExpr                  =	 s:searchTerm { return s }

// FIXME: Support NOT n:('NOT' WSP)?
searchTerm                  = s:positiveSearchTerm { return s }

positiveSearchTerm          = s:searchPhrase { return s }
														// / s:searchWord

searchPhrase                = DQUOTE s:QCHAR_NO_AMP_DQUOTE+ DQUOTE { return s.join('') }

//searchWord                // Not implementing yet, but can't be AND, OR, or NOT and can match one or more of any character from the Unicode categories L or Nl

// $orderby
orderby                     =   "$orderby=" list:orderbyList {
                                    return { "$orderby": list }; }
                            /   "$orderby=" .* { return {"error": 'invalid $orderby parameter'}; }

orderbyList                 = i:(id:identifierPath ord:(WSP ("asc"/"desc"))? {
                                    var result = {};
                                    result[id] = ord[1] || 'asc';
                                    return result;
                                })
                              list:("," WSP? l:orderbyList{return l;})? {

                                    if (list === "") list = [];
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(i);
                                    return list;
                                }


//$select
select                      =   "$select=" list:selectList { return { "$select":list }; }
                            /   "$select=" .* { return {"error": 'invalid $select parameter'}; }

selectList                  =
                                i:(a:identifierPath b:".*"?{return a + b;}/"*") list:("," WSP? l:selectList {return l;})? {
                                    if (list === "") list = [];
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(i);
                                    return list;
                                }



//$apply
apply                      =  "$apply=" WSP? t:transformationsList
                                {
                                  return {
                                    "$apply": t
                                  }
                                }

transformationsList        =  i:transformation WSP? list:("/" WSP? l:transformationsList)? {
                                    if (list === "") list = [];
                                    list = list.filter(f => f !== "/" && f !== " ");
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(i);
                                    return list;
                                }

transformation             =  t:transformationArg "(" WSP? list:applyList WSP? ")"
                                {
                                  return {
                                    "type": "transformation",
                                    "func": t,
                                    "args": list
                                  };
                                } /
                              t:"identity"
                                {
                                  return {
                                    "type": "transformation",
                                    "func": t,
                                    "args": []
                                  };
                                } /
                              t:"aggregate" "(" WSP? list:aggregateExprList WSP? ")"
                                {
                                  return {
                                    "type": "transformation",
                                    "func": t,
                                    "args": list
                                  };
                                }

// FIXME: the syntax for groupby (e.g. rollup, $all) is not yet supported
// FIXME: the syntax for concat (set concat) is not yet supported
transformationArg          =
                              "topcount" /
                              "topsum" /
                              "toppercent" /
                              "bottomcount" /
                              "bottomsum" /
                              "bottompercent" /
                              // "concat" /
                              // "groupby" /
                              "filter" /
                              "expand" /
                              "search" /
                              "compute"

applyList                 =  i:applyItem WSP? list:("," WSP? l:applyList)? {
                                    if (list === "") list = [];
                                    list = list.filter(f => f !== "," && f !== " ");
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(i);
                                    return list;
                                }

// collectionFuncExpr is allowed in AST. Decide if odata compliant, (if enable in mapper).
applyItem                  =  transformation /
                              aliasExpression /
                              part

aggregateExprList          =  i:aggregateExprItem WSP? list:("," WSP? l:aggregateExprList)? {
                                    if (list === "") list = [];
                                    list = list.filter(f => f !== "," && f !== " ");
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(i);
                                    return list;
                                }

// FIXME: this is the grammar (no ambiguity atm).
// nodes are not yet being created/returned
aggregateExprItem          =  identifierRoot WSP+ "with" WSP+ m:aggregateMethod WSP+ "as" a:identifier /
                              "$count" WSP+ "as" WSP+ a:identifier /
                              identifierRoot WSP+ "as" WSP+ a:identifier /
                              identifierRoot

aggregateMethod            = "sum" / "min" / "max" / "average" / "countdistinct"

aliasExpression             =
                             p:part WSP+ "as" WSP+ a:identifier
                              {
                                return {
                                  "type": "alias",
                                  "name": a,
                                  "expression":p
                                };
                              }



//filter
filter                      =   "$filter=" list:filterExpr {
                                    return {
                                        "$filter": list
                                    };
                                }
                            /   "$filter=" .* { return {"error": 'invalid $filter parameter'}; }

filterExpr                  =
                              "(" WSP? filterExpr WSP? ")" ( WSP ("and"/"or") WSP filterExpr)? /
                              left:cond right:( WSP type:("and"/"or") WSP value:filterExpr{
                                    return { type: type, value: value}
                              })? {

                                if (right) {
                                    return {
                                        type: right.type,
                                        left: left,
                                        right: right.value
                                    }
                                } else {
                                    return left;
                                }
                              }

booleanFunctions2Args       = "substringof" / "endswith" / "startswith" / "IsOf" / "contains"

booleanFunc                 =  f:booleanFunctions2Args "(" arg0:part "," WSP? arg1:part ")" {
                                    return {
                                        type: "functioncall",
                                        func: f,
                                        args: [arg0, arg1]
                                    }
                                } /
                                "IsOf(" arg0:part ")" {
                                    return {
                                        type: "functioncall",
                                        func: "IsOf",
                                        args: [arg0]
                                    }
                                }

otherFunctions1Arg          = "tolower" / "toupper" / "trim" / "length" / "year" /
                              "month" / "day" / "hour" / "minute" / "second" /
                              "round" / "floor" / "ceiling"

otherFunc1                  = f:otherFunctions1Arg "(" arg0:part ")" {
                                  return {
                                      type: "functioncall",
                                      func: f,
                                      args: [arg0]
                                  }
                              }

// collection functions include a path expression at the start (unlike other field functions)
    // this refers to the path to the set (e.g. the field in the record)
// then the internal identifier (in the lambdaFunc), refers to the local variable. E.g. for x in listField

collectionFuncExpr         = p:idPathANDfuncArgExpr "(" arg0:lambdaFunc ")" {
                                  return {
                                      type: "functioncall",
                                      func: p.func,
                                      args: [{
                                        type: "property",
                                        name: p.idPath
                                        }, arg0
                                      ]
                                  }
                              }

// pegjs has a problem handling identifierPath/any(). This gets around it.
idPathANDfuncArgExpr       = a:identifier b:idPartANDfuncArg* {
                                 // throw if the last item in not a collectionFunction name
                                 var collectionFunctionsArg = ["any", "all"]
                                 if (collectionFunctionsArg.indexOf(b[b.length-1]) !== -1) {
                                    throw "Incorrect collection function name: " + b[b.length-1];
                                 }
                                 var idPath = [];
                                 idPath.push(a);
                                 for(var i in b) {
                                    if (b[i].func) {
                                        return {idPath:idPath.join('/'), func:b[i].func } ;
                                    }
                                    idPath.push(b[i]);
                                 }
                              }
idPartANDfuncArg           = a:"/" b:identifier {
                                var collectionFunctionsArg = ["any", "all"]
                                if (collectionFunctionsArg.indexOf(b) !== -1) {
                                  return {func:b}
                                }
                                return b;
                             }

lambdaFunc                 = arg0:lambdaVar ":" a:lambdaVar WSP op:op WSP b:part {
                                return {
                                        type: "lambda",
                                        args: [
                                          arg0,
                                          {
                                            type: op,
                                            left: a,
                                            right: b
                                          }
                                        ]
                                }
                             }

// do not let lambdaVar be a primitiveLiteral, because ambiguity with datetime (int:int)
lambdaVar                  = identifierRoot

otherFunctions2Arg         = "indexof" / "concat" / "substring" / "replace"

otherFunc2                 = f:otherFunctions2Arg "(" WSP? arg0:part "," WSP? arg1:part ")" {
                                  return {
                                      type: "functioncall",
                                      func: f,
                                      args: [arg0, arg1]
                                  }
                              } /
                              "substring(" "(" arg0:part "," WSP? arg1:part "," WSP? arg2:part ")" {
                                  return {
                                      type: "functioncall",
                                      func: "substring",
                                      args: [arg0, arg1, arg2]
                                  }
                              } /
                              "replace(" "(" arg0:part "," WSP? arg1:part "," WSP? arg2:part ")" {
                                  return {
                                      type: "functioncall",
                                      func: "replace",
                                      args: [arg0, arg1, arg2]
                                  }
                              }

cond                        = a:part WSP op:op WSP b:part {
                                    return {
                                        type: op,
                                        left: a,
                                        right: b
                                    };
                                } / booleanFunc

/* Does not have operator precedence. (peg decides path per each token.) Use nesting. */
mathCond                   = a:part WSP? op:mathOp WSP? b:part {
                                    return {
                                        type: op,
                                        left: a,
                                        right: b
                                    };
                                }

part                        =   collectionFuncExpr /
                                booleanFunc /
                                otherFunc2 /
                                otherFunc1 /
                                "(" WSP? c:mathCond WSP? ")" {
                                  return c ;
                                } /
                                l:primitiveLiteral {
                                    return {
                                        type: 'literal',
                                        value: l
                                    };
                                } /
                                nowUnit /
                                identifierRoot

nowUnit                     = "now()" u:unit? {
                                if (u) {
                                  return {
                                    type: "now",
                                    unit: u
                                  }
                                }
                                return {
                                  type: "now"
                                }
                              }

/* op is used at the root cond expression of the subtree. The mathOp is used in the subtrees. */
op                          =
                                "eq" /
                                "ne" /
                                "lt" /
                                "le" /
                                "gt" /
                                "ge"

mathOp                      =
                                "add" /
                                "sub" /
                                "mul" /
                                "div" /
                                "mod"

unsupported                 =   "$" er:.* { return { error: "unsupported method: " + er }; }

//end: OData query options

/*
 * OData query
 */

expList                     = e:exp "&" el:expList { return [e].concat(el); } /
                              e:exp { return [e]; }


exp                         =   parameterAliasExpr /
                                expand /
                                apply /
                                filter /
                                orderby /
                                skip /
                                top /
                                format /
                                inlinecount /
                                select /
                                callback /
                                search /
                                unsupported

// because of the way that query works, each exp (e.g. filter, parameterAliasExpr) can only have a single root
parameterAliasExpr          = n:parameterAliasIdentifier "=" v:parameterAliasValue {
                                  return { 'parameterAliasExpr': {
                                      parameterAlias: n,
                                      value: v
                                  }};
                              }

// from the odata spec: the parameterAliasValue can be a cond, collection of literals, or a literal
// we don't yet support a collection of literals. E.g. `@lx_colors:permitted=['red', 'green']`
parameterAliasValue         = cond /
                              part


query                       = list:expList {
                                    //turn the array into an object like:
                                    // { $top: 5, $skip: 10 }
                                    var result = {};
                                    list = list || [];
                                    for(var i in list){

                                        if (list[i] !== "") {
                                            var paramName = Object.keys(list[i])[0]; //ie: $top
                                            result[paramName] = list[i][paramName];
                                        }
                                    }
                                    return result;
                                }

// end: OData query

/*
 * OData path
 */

predicate                   = n:identifier "=" v:primitiveLiteral {
                                  return {
                                      type: 'property',
                                      name: n,
                                      value: v
                                  };
                              }

predicateList               = e:predicate "," WSP? l:predicateList {
                                  return [e].concat(l);
                              } /
                              e:predicate {
                                  return [e];
                              } /
                              v:primitiveLiteral {
                                  return [{
                                      type: 'literal',
                                      value: v
                                  }];
                              }

resource                    = n:identifier "(" p:predicateList ")" {
                                  return {
                                      name: n,
                                      predicates: p
                                  };
                              } /
                              n:identifier {
                                  return {
                                      name: n
                                  };
                              }

path                        = e:resource "/" l:endPath {
                                  return [e].concat(l);
                              } /
                              e:resource {
                                  return [e];
                              }

endPath                     = e:resource "/" l:endPath {
                                  return [e].concat(l);
                              } /
                              e:resource {
                                  return [e];
                              } /
                              v:("$value" / "$count") {
                                  return {
                                      name: v
                                  };
                              }
// end: OData path

/*
 * OData url
 */

url                         = p:path "?" q:query {
                                  q.$path = p;
                                  return q;
                              } /
                              p:path {
                                  return {$path: p};
                              } /
                              q:query {
                                  return q;
                              }

// end: OData url
