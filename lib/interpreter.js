const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const SemanticAnalyzer = require('./semantic_analyzer.js');
const AST = require('./ast.js');

module.exports = class Interpreter {
  constructor(tree) {
    this.tree = tree;
    this.GLOBAL_SCOPE = {};
  }

  visit_BINOP(node) {
    const lhs = this.evalTree(node.left);
    const rhs = this.evalTree(node.right);

    switch (node.op.type) {
      case Lexer.TokenTypes.PLUS:
        return lhs + rhs;
      case Lexer.TokenTypes.MINUS:
        return lhs - rhs;
      case Lexer.TokenTypes.MULTIPLY:
        return lhs * rhs;
      case Lexer.TokenTypes.DIVIDE_INTEGER:
        return Math.floor(lhs / rhs);
      case Lexer.TokenTypes.DIVIDE_REAL:
        return lhs / rhs;
    }
  }

  visit_INTEGER(node) {
    return node.val;
  }

  visit_REAL(node) {
    return node.val;
  }

  visit_UNARYOP(node) {
    let factor = 1;
    if (node.op.type === Lexer.TokenTypes.MINUS) {
      factor = -1;
    }

    return factor * this.evalTree(node.expr);
  }

  visit_COMPOUND(node) {
    for (let i = 0; i < node.children.length; ++i) {
      this.evalTree(node.children[i]);
    }

    return this.GLOBAL_SCOPE;
  }

  visit_ASSIGN(node) {
    const varName = node.left.val;
    this.GLOBAL_SCOPE[varName.toUpperCase()] = this.evalTree(node.right);
  }

  visit_VAR(node) {
    return this.GLOBAL_SCOPE[node.val.toUpperCase()];
  }

  visit_NOOP(node) {
    return;
  }

  visit_BLOCK(node) {
    return this.evalTree(node.compoundStatement);
  }

  visit_PROGRAM(node) {
    return this.evalTree(node.block);
  }

  /* Evaluates AST starting from a root node */
  evalTree(node) {
    const visitor = this[`visit_${node.type}`];
    if (visitor) {
      return visitor.call(this, node);
    } else {
      console.log(`No visitor for node type ${node.type}`);
      return null;
    }
  }

  eval() {
    return this.evalTree(this.tree);
  }

  static evalStatement(stmt) {
    const astree = Parser.parseExpression(stmt);

    // Use the AST to calculate the final result
    const interpreter = new Interpreter(astree);
    return interpreter.eval();
  }

  static evalProgram(pgm) {
    const astree = Parser.parseProgram(pgm);
    const analyzer = new SemanticAnalyzer();
    const isValid = analyzer.visit(astree);

    if (isValid) {
      const interpreter = new Interpreter(astree);
      const varTable = interpreter.eval();
      return varTable;
    } else {
      console.log("Program has invalid symbols");
      return null;
    }
  }
}
