const Lexer = require('../lib/lexer.js');
const AST = require('../lib/ast.js');

module.exports.integerNode = function integerNode(num) {
  return {
    type: AST.NodeTypes.INTEGER,
    op: {
      type: Lexer.TokenTypes.INTEGER_CONST,
      val: num
    },
    val: num
  }
}

module.exports.realNode = function realNode(num) {
  return {
    type: AST.NodeTypes.REAL,
    op: {
      type: Lexer.TokenTypes.REAL_CONST,
      val: num
    },
    val: num
  }
}

module.exports.booleanNode = function (bool) {
  return {
    type: AST.NodeTypes.BOOLEAN,
    op: {
      type: Lexer.TokenTypes.BOOLEAN_CONST,
      val: bool
    },
    val: bool
  }
}

module.exports.binaryOp = function binaryOp(lhs, rhs, opVal) {
  return {
    type: AST.NodeTypes.BINOP,
    op: {
      type: Lexer.LexemeTokenMap.get(opVal.toUpperCase()),
      val: opVal
    },
    left: lhs,
    right: rhs
  }
}

module.exports.unaryOp = function unaryOp(operand, opVal) {
  return {
    type: AST.NodeTypes.UNARYOP,
    op: {
      type: Lexer.LexemeTokenMap.get(opVal.toUpperCase()),
      val: opVal
    },
    expr: operand
  }
}

module.exports.assignmentNode = function assignmentNode(lhs, rhs) {
  return {
    type: AST.NodeTypes.ASSIGN,
    op: {
      type: Lexer.TokenTypes.ASSIGN,
      val: ':='
    },
    left: lhs,
    right: rhs
  }
}

module.exports.conditionalNode = function conditionalNode(test, trueBlock, elseBlock) {
  return {
    type: AST.NodeTypes.CONDITIONAL,
    test: test,
    trueBlock: trueBlock,
    elseBlock: elseBlock
  }
}

module.exports.whileDoNode = function whileDoNode(test, body) {
  return {
    type: AST.NodeTypes.WHILEDO,
    test: test,
    body: body
  }
}

module.exports.repeatUntilNode = function repeatUntilNode(test, body) {
  return {
    type: AST.NodeTypes.REPEATUNTIL,
    test: test,
    body: body
  }
}

module.exports.procedureCallNode = function procedureCallNode(procName, params) {
  return {
    type: AST.NodeTypes.PROCEDURECALL,
    name: procName,
    params: params
  }
}

module.exports.functionCallNode = function functionCallNode(funcName, params) {
  return {
    type: AST.NodeTypes.FUNCTIONCALL,
    name: funcName,
    params: params
  }
}

module.exports.varNode = function varNode(varName) {
  return {
    type: AST.NodeTypes.VAR,
    token: {
      type: Lexer.TokenTypes.ID,
      val: varName
    },
    val: varName
  }
}

module.exports.noopNode = function noopNode() {
  return {
    type: AST.NodeTypes.NOOP
  }
}

module.exports.compoundStatement = function compoundStatement(statements) {
  return {
    type: AST.NodeTypes.COMPOUND,
    children: statements
  }
}

module.exports.varType = function varType(type) {
  return {
    type: AST.NodeTypes.TYPEDECL,
    tok: {
      type: type,
      val: type
    },
    val: type
  }
}

module.exports.declaration = function declaration(name, type) {
  return {
    type: AST.NodeTypes.VARDECL,
    var: varNode(name),
    varType: varType(type)
  }
}

module.exports.block = function block(compound, decls) {
  return {
    type: AST.NodeTypes.BLOCK,
    declarations: decls || [],
    compoundStatement: compound
  }
}

module.exports.procedure = function procedure(name, params, block) {
  return {
    type: AST.NodeTypes.PROCEDURE,
    name: name,
    params: params,
    block: block
  }
}

module.exports.functionNode = function functionNode(name, params, type, block) {
  return {
    type: AST.NodeTypes.FUNCTION,
    name: name,
    params: params,
    returnType: type,
    block: block
  }
}

module.exports.parameter = function parameter(varNode, typeNode) {
  return {
    type: AST.NodeTypes.PARAMETER,
    var: varNode,
    type: typeNode
  }
}

module.exports.program = function program(name, block) {
  return {
    type: AST.NodeTypes.PROGRAM,
    name: name,
    block: block
  }
}
