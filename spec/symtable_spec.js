const Symtable = require('../lib/symtable.js');
const SemanticAnalyzer = require('../lib/semantic_analyzer.js');
const Parser = require('../lib/parser.js');
const AST = require('../lib/ast.js');
const assert = require('assert');

describe('Symbol Table', () => {
  let tbl = undefined;

  beforeEach(() => {
    tbl = new Symtable.SymbolTable();
  });

  it('should be able to save and return a symbol', () => {
    const symbol_name = 'someSymbol';
    const newSymbol = new Symtable.Symbol(symbol_name);
    tbl.define(newSymbol);

    const retrievedSymbol = tbl.lookup(symbol_name);
    assert.equal(retrievedSymbol, newSymbol);
  });

  it('should throw an exception when a symbol is declared twice', () => {
    assert.throws(() => {
      const symbol_name = 'someSymbol';
      const newSymbol = new Symtable.Symbol(symbol_name);
      tbl.define(newSymbol);
      tbl.define(newSymbol);
    });
  });
});
