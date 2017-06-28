const AST = require('./ast.js');

class Symbol {
  constructor(name, type) {
    this.name = name;
    this.type = type || null;
  }
}
module.exports.Symbol = Symbol;

class BuiltinTypeSymbol extends Symbol {
  constructor(name) {
    super(name);
  }
}
module.exports.BuiltinTypeSymbol = BuiltinTypeSymbol;

class VarSymbol extends Symbol {
  constructor(name, type) {
    super(name, type);
  }
}
module.exports.VarSymbol = VarSymbol;

class SymbolTable {
  constructor() {
    this.symbols = new Map();
    this.initBuiltins();
  }

  initBuiltins() {
    this.define(new BuiltinTypeSymbol(AST.NodeTypes.INTEGER));
    this.define(new BuiltinTypeSymbol(AST.NodeTypes.REAL));
  }

  define(symbol) {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name) {
    return this.symbols.get(name);
  }
}
module.exports.SymbolTable = SymbolTable;

class SymbolTableBuilder {
  constructor() {
    this.symbolTable = new SymbolTable();
  }

  visit(node) {
    const visitor = this[`visit_${node.type}`];
    return visitor.call(this, node);
  }

  visit_PROGRAM(node) {
    return this.visit(node.block);
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
    const type_name = node.varType.val;
    const type_symbol = this.symbolTable.lookup(type_name);
    const var_name = node.var.val;
    const var_symbol = new VarSymbol(var_name, type_symbol);
    this.symbolTable.define(var_symbol);
    return true;
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
module.exports.SymbolTableBuilder = SymbolTableBuilder;
