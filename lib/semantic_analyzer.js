const SymbolTable = require('./symtable.js');

class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new SymbolTable.SymbolTable();
  }

  visit(node) {
    const visitor = this[`visit_${node.type}`];
    return visitor.call(this, node);
  }

  visit_PROGRAM(node) {
    return this.visit(node.block);
  }

  visit_PROCEDURE(node) {
    return true;
  }

  visit_BLOCK(node) {
    let ret = true;

    for (var decl of node.declarations) {
      ret = ret && this.visit(decl);
    }

    ret = ret && this.visit(node.compoundStatement);
    return ret;
  }

  visit_VARDECL(node) {
    // Get type symbol
    const type_name = node.varType.val;
    const type_symbol = this.symbolTable.lookup(type_name);

    // Get var symbol
    const var_name = node.var.val;
    if (this.symbolTable.lookup(var_name) === undefined) {
      const var_symbol = new SymbolTable.VarSymbol(var_name, type_symbol);
      this.symbolTable.define(var_symbol);
      return true;
    } else {
      console.log(`Symbol ${var_name} defined twice`);
      return false;
    }
  }

  visit_COMPOUND(node) {
    let ret = true;
    for (var stmt of node.children) {
      ret = ret && this.visit(stmt);
    }
    return ret;
  }

  visit_BINOP(node) {
    return this.visit(node.left) && this.visit(node.right);
  }

  visit_UNARYOP(node) {
    return this.visit(node.expr);
  }

  visit_INTEGER(node) {
    return true;
  }

  visit_REAL(node) {
    return true;
  }

  visit_NOOP(node) {
    return true;
  }

  visit_ASSIGN(node) {
    const var_name = node.left.val;
    const var_symbol = this.symbolTable.lookup(var_name);
    if (var_symbol === undefined) {
      console.log(`Unidentified symbol ${var_name}`);
      return false;
    }

    return this.visit(node.right);
  }

  visit_VAR(node) {
    const var_name = node.val;
    const var_symbol = this.symbolTable.lookup(var_name);
    if (var_symbol === undefined) {
      console.log(`Unidentified symbol ${var_name}`);
      return false;
    }

    return true;
  }
}
module.exports = SemanticAnalyzer;
