const Lexer = require('./lexer.js');
const AST = require('./ast.js');

module.exports = class TypeAnalyzer {
  constructor(symbolTable) {
    this.symbolTable = symbolTable;
    this.INTEGER = symbolTable.lookup(AST.NodeTypes.INTEGER, true).name;
    this.REAL = symbolTable.lookup(AST.NodeTypes.REAL, true).name;
    this.BOOLEAN = symbolTable.lookup(AST.NodeTypes.BOOLEAN, true).name;
  }

  visit(node) {
    const visitor = this[`visit_${node.type}`];
    return visitor !== undefined ? visitor.call(this, node) : undefined;
  }

  visit_VAR(node) {
    const varSymbol = this.symbolTable.lookup(node.val, true);
    if (varSymbol !== undefined) {
      return varSymbol.type.name;
    } else {
      return undefined;
    }
  }

  visit_INTEGER(node) {
    return this.INTEGER;
  }

  visit_REAL(node) {
    return this.REAL;
  }

  visit_BOOLEAN(node) {
    return this.BOOLEAN;
  }

  visit_UNARYOP(node) {
    return this.visit(node.expr, table);
  }

  visit_FUNCTIONCALL(node) {
    return this.symbolTable.lookup(node.name, true).type.name;
  }

  realOrIntegerType(lhsType, rhsType) {
    if (lhsType === this.INTEGER && rhsType === this.INTEGER) {
      return this.INTEGER;
    } else if ((lhsType === this.INTEGER || lhsType === this.REAL) && (rhsType === this.INTEGER || rhsType === this.REAL)) {
      return this.REAL;
    } else {
      return undefined;
    }
  }

  setOperatorType(lhsType, rhsType) {
    if (lhsType === this.BOOLEAN && rhsType === this.BOOLEAN) {
      return this.BOOLEAN;
    } else {
      return undefined;
    }
  }

  relationalOperatorType(lhsType, rhsType) {
    if ((lhsType === this.INTEGER || lhsType === this.REAL) && (rhsType === this.INTEGER || rhsType === this.REAL)) {
      return this.BOOLEAN;
    } else {
      return undefined;
    }
  }

  visit_BINOP(node) {
    switch(node.op.type) {
      case Lexer.TokenTypes.PLUS:
        return this.realOrIntegerType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.MINUS:
        return this.realOrIntegerType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.MULTIPLY:
        return this.realOrIntegerType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.DIVIDE_REAL:
        if (this.realOrIntegerType(this.visit(node.left), this.visit(node.right)) !== undefined) {
          return this.REAL;
        }
      case Lexer.TokenTypes.DIVIDE_INTEGER:
        if (this.realOrIntegerType(this.visit(node.left), this.visit(node.right)) === this.INTEGER) {
          return this.INTEGER;
        }
      case Lexer.TokenTypes.AND:
        return this.setOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.OR:
        return this.setOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.XOR:
        return this.setOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.LT:
        return this.relationalOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.GT:
        return this.relationalOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.LEQ:
        return this.relationalOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.GEQ:
        return this.relationalOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.EQ:
        return this.relationalOperatorType(this.visit(node.left), this.visit(node.right));
      case Lexer.TokenTypes.NEQ:
        return this.relationalOperatorType(this.visit(node.left), this.visit(node.right));
      default:
        return undefined;
    }
  }
};
