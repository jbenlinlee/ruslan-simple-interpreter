const Lexer = require('./lexer.js');

const BINOP = 'BINOP';
const UNARYOP = 'UNARYOP';
const INTEGER = 'INTEGER';

module.exports.BinOpNode = class BinOpNode {
  /* left and right should be other AST nodes.
     op should be a binary operator token */
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = BINOP;
  }
}

module.exports.UnaryOpNode = class UnaryOpNode {
    /* op should be a unary operator, and expr should be another AST node */
    constructor(op, expr) {
      this.op = op;
      this.expr = expr
      this.type = UNARYOP;
    }
}

module.exports.IntegerNode = class IntegerNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
    this.type = INTEGER;
  }
}

module.exports.Visitor = class AST {
  static visit_BINOP(node) {
    const lhs = AST.eval(node.left);
    const rhs = AST.eval(node.right);

    switch (node.op.type) {
      case Lexer.PLUS:
        return lhs + rhs;
      case Lexer.MINUS:
        return lhs - rhs;
      case Lexer.MULTIPLY:
        return lhs * rhs;
      case Lexer.DIVIDE:
        return lhs / rhs;
    }
  }

  static visit_INTEGER(node) {
    return node.val;
  }

  /* Evaluates AST starting from a root node */
  static eval(node) {
    const visitor = AST[`visit_${node.type}`];
    return visitor.call(this, node);
  }
}
