const Lexer = require('./lexer.js');

module.exports.BinOpNode = class BinOpNode {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = 'BinOp';
  }
}

module.exports.IntegerNode = class IntegerNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
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

  /* Determines the type of a node */
  static node_type(node) {
    if (node.op.type === Lexer.INTEGER) {
      return 'INTEGER';
    } else {
      return 'BINOP';
    }
  }

  /* Evaluates AST starting from a root node */
  static eval(node) {
    const nodeType = AST.node_type(node);
    const visitor = AST[`visit_${nodeType}`];
    return visitor.call(this, node);
  }
}
