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
