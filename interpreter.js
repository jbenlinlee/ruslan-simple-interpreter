const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const AST = require('./ast.js');

module.exports = class Interpreter {
  static visit_BINOP(node) {
    const lhs = Interpreter.evalTree(node.left);
    const rhs = Interpreter.evalTree(node.right);

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

  static visit_UNARYOP(node) {
    let factor = 1;
    if (node.op.type === Lexer.MINUS) {
      factor = -1;
    }

    return factor * Interpreter.evalTree(node.expr);
  }

  /* Evaluates AST starting from a root node */
  static evalTree(node) {
    const visitor = Interpreter[`visit_${node.type}`];
    return visitor.call(this, node);
  }

  static eval(stmt) {
    const parser = new Parser(stmt);
    const astree = parser.parse();

    // Use the AST to calculate the final result
    return Interpreter.evalTree(astree);
  }
}
