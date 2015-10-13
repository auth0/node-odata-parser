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
identifierPart              = a:[a-zA-Z] b:unreserved* { return a + b.join(''); }
identifier                  =
                                a:identifierPart list:("." i:identifier {return i;})? {
                                    if (list === "") list = [];
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(a);
                                    return list.join('.');
                                }

// Fixme: this is wrong.
QCHAR_NO_AMP_DQUOTE         = [^"]

// --

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

identifierPathParts         =   "/" i:identifierPart list:identifierPathParts? {
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    return "/" + i + list;
                                }
identifierPath              =   a:identifier b:identifierPathParts? { return a + b; }
selectList                  =
                                i:(a:identifierPath b:".*"?{return a + b;}/"*") list:("," WSP? l:selectList {return l;})? {
                                    if (list === "") list = [];
                                    if (require('util').isArray(list[0])) {
                                        list = list[0];
                                    }
                                    list.unshift(i);
                                    return list;
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

otherFunctions2Arg         = "indexof" / "concat" / "substring" / "replace"

otherFunc2                 = f:otherFunctions2Arg "(" arg0:part "," WSP? arg1:part ")" {
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
                                      args: [arg0, arg1, ag2]
                                  }
                              } /
                              "replace(" "(" arg0:part "," WSP? arg1:part "," WSP? arg2:part ")" {
                                  return {
                                      type: "functioncall",
                                      func: "replace",
                                      args: [arg0, arg1, ag2]
                                  }
                              }

cond                        = a:part WSP op:op WSP b:part {
                                    return {
                                        type: op,
                                        left: a,
                                        right: b
                                    };
                                } / booleanFunc

part                        =   booleanFunc /
                                otherFunc2 /
                                otherFunc1 /
                                l:primitiveLiteral {
                                    return {
                                        type: 'literal',
                                        value: l
                                    };
                                } /
                                (u:identifierPath {
                                    return {
                                        type: 'property', name: u
                                    };
                                })

op                          =
                                "eq" /
                                "ne" /
                                "lt" /
                                "le" /
                                "gt" /
                                "ge" /
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


exp                         =
                                expand /
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
