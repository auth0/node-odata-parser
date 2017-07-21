// @flow
export type ODataAST = {|
  $path?: $path,
  $select?: $select,
  $expand?: $expand,
  $filter?: $filter,
  $orderby?: $orderby,
  $callback?: string,
  $format?: string,
  $search?: string,
  $count?: boolean,
  $skip?: number,
  $top?: number
|} | {|
  $apply: $apply
|}

export type $apply = Array<transformation>
export type $filter = filterExpr
export type $orderby = Array<{ [key: string]: 'asc' | 'desc' }>
export type $select = Array<string>
export type $expand = Array<{|
  path: string,
  options: ODataAST
|}>
export type $path = Array<{|
  name: string,
  predicates?: Array<primitiveLiteral | ODataLiteralNode>
|}>

export type ODataTransformationNode = transformation
export type ODataExpressionNode = equalityExpr | mathExpr | andOrExpr | lambdaArg2
export type ODataNode = ODataLiteralNode | ODataFuncNode | lambdaFunc | identifierRoot | ODataNowNode | ODataCastNode | ODataAliasNode | ODataExpressionNode | transformation | aggregateExpr | aggregateAlias | andOrTransformationExpr | primitiveLiteral
export type ODataNowUnit = 'microseconds' | 'milliseconds' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'decade' | 'century' | 'millennium';
export type ODataPropertyNode = identifierRoot
export type ODataAliasNode = aliasExpression
export type ODataLiteralNode = ODataLiteralNode$Null | ODataLiteralNode$NaNInf | ODataLiteralNode$ParamAlias | ODataLiteralNode$String | ODataLiteralNode$Number | ODataLiteralNode$Boolean
export type ODataLiteralNode$Null = {|
  type: 'literal',
  literalType: 'null',
  value: nullValue
|}
export type ODataLiteralNode$NaNInf = {|
  type: 'literal',
  literalType: 'NaN/Infinity',
  value: 'NaN' | 'INF' | '-INF'
|}
export type ODataLiteralNode$ParamAlias = {|
  type: 'literal',
  literalType: 'parameter-alias',
  value: '@lx_myUser_Id' | '@lx_myOrg_Id' | '@lx_myUser_Timezone' | '@lx_myTeam' | '@lx_myWorkflows'
|}
export type ODataLiteralNode$String = {|
  type: 'literal',
  literalType: 'string' | 'timeOfDay' | 'date' | 'dateTimeOffset' | 'decimal',
  value: string
|}
export type ODataLiteralNode$Number = {|
  type: 'literal',
  literalType: 'integer',
  value: number
|}
export type ODataLiteralNode$Boolean = {|
  type: 'literal',
  literalType: 'boolean',
  value: boolean
|}
export type ODataLambdaNode = lambdaFunc
export type ODataNowNode = {|
  type: 'now',
  unit: ODataNowUnit
|}
export type ODataCastNode = {|
  type: 'cast',
  args: [
    ODataLiteralNode,
    'Edm.Boolean' | 'Edm.String' | 'Edm.Decimal' | 'Edm.Int32' | 'Edm.TimeOfDay' | 'Edm.Date' | 'Edm.DateTimeOffset'
  ]
|}

export type ODataFuncNode = ODataFuncNode$Bool | ODataFuncNode$Collection | ODataFuncNode$Other1 | ODataFuncNode$Other2
export type ODataFuncNode$Bool = {|
  type: 'functioncall',
  func: 'startswith' | 'endswith' | 'substringof' | 'IsOf' | 'contains',
  args: [part, part]
|} | {|
  type: 'functioncall',
  func: 'IsOf',
  args: [part]
|}
export type ODataFuncNode$Collection = {|
  type: 'functioncall',
  func: 'any' | 'all',
  args: [
    identifierRoot,
    lambdaFunc | ODataFuncNode$Collection
  ]
|}
export type ODataFuncNode$Other1 = {|
  type: 'functioncall',
  func: 'tolower' | 'toupper' | 'trim' | 'length' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'round' | 'floor' | 'ceiling',
  args: [part]
|}
export type ODataFuncNode$Other2 = {|
  type: 'functioncall',
  func: 'indexof' | 'concat' | 'substring' | 'replace',
  args: [part, part]
|} | {|
  type: 'functioncall',
  func: 'substring' | 'replace',
  args: [part, part, part]
|}

type nullValue = ['null', string]

type identifierRoot = {|
  type: 'property',
  name: string,
  unit?: ODataNowUnit
|}

type primitiveLiteral = {|
  type: 'property',
  name: string,
  value: string | number | boolean | nullValue
|}

type part =
  | ODataFuncNode
  | ODataCastNode
  | ODataLiteralNode
  | ODataNowNode
  | identifierRoot

type op = 'eq' | 'ne' | 'ge' | 'gt' | 'le' | 'lt'
type andOrOp = 'and' | 'or'
type additiveOp = 'add' | 'sub'
type multiplicativeOp = 'mul' | 'div' | 'mod'
type mathOp = additiveOp | multiplicativeOp

type mathExpr = {|
  type: mathOp,
  left: mathExpr | part,
  right: mathExpr | part
|}

type equalityExpr = {|
  type: op,
  left: mathExpr | part,
  right: mathExpr | part
|}

type andOrExpr = {|
  type: andOrOp,
  left: filterExpr,
  right: filterExpr
|}

type filterExpr = ODataFuncNode$Bool | equalityExpr | andOrExpr

// transaction expressions

type transformation = transformationAggregate | transformationIdentity | transformationFilter | transformationApply

type transformationArg = 'topcount' | 'topsum' | 'toppercent' | 'bottomcount' | 'bottomsum' | 'bottompercent' | 'expand' | 'search' | 'compute'

type aggregateExpr = {|
  type: 'aggregate',
  func: 'sum' | 'min' | 'max' | 'average' | 'countdistinct',
  args: [identifierRoot]
|}

type aggregateAlias = {|
  type: 'alias',
  name: string,
  expression: aggregateExpr
|}

type transformationAggregate = {|
  type: 'transformation',
  func: 'aggregate',
  args: Array<transformation | aliasExpression | part | aggregateAlias>
|}

type transformationIdentity = {|
  type: 'transformation',
  func: 'identity',
  args: []
|}

type transformationFilter = {|
  type: 'transformation',
  func: 'filter',
  args: [filterTransformationExpr]
|}

type transformationApply = {|
  type: 'transformation',
  func: transformationArg,
  args: Array<transformation | aliasExpression | part | aggregateAlias>
|}

type andOrTransformationExpr = {|
  type: andOrOp,
  left: filterTransformationExpr,
  right: filterTransformationExpr
|}

type filterTransformationExpr = ODataFuncNode$Collection | ODataFuncNode$Bool | equalityExpr | andOrTransformationExpr


// alias expressions

type aliasExpression = {|
  type: 'alias',
  name: string,
  expression: mathExpr | part | transformation
|}

// lambda

type lambdaArg2 = {|
  type: op,
  left: identifierRoot,
  right: part
|}

type lambdaFunc = {|
  type: 'lambda',
  args: [
    identifierRoot,
    lambdaArg2
  ]
|}
