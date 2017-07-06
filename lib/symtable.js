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

class ProcedureSymbol extends Symbol {
  constructor(name, blockNode, symbolTable) {
    super(name);
    this.params = [];
    this.block = blockNode;
    this.symbolTable = symbolTable;
  }
}
module.exports.ProcedureSymbol = ProcedureSymbol;

class ProgramSymbol extends Symbol {
  constructor(name) {
    super(name);
  }
}
module.exports.ProgramSymbol = ProgramSymbol;

class SymbolTable {
  constructor(parentScope) {
    this.symbols = new Map();
    this.parentScope = parentScope || null;
  }

  define(symbol) {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name, inParentScope) {
    const symbol = this.symbols.get(name);
    if (symbol !== undefined) {
      return symbol;
    } else if (this.parentScope !== null && inParentScope) {
      return this.parentScope.lookup(name, inParentScope);
    } else {
      return undefined;
    }
  }

  dumpTable() {
    for (let entry of this.symbols.entries()) {
      let varName = entry[0];
      console.log(`${varName}`);
    }

    if (this.parentScope) {
      console.log("----------");
      this.parentScope.dumpTable();
    }
  }
}
module.exports.SymbolTable = SymbolTable;
