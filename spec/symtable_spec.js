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

  it('should return INTEGER builtin type symbol', () => {
    const intBuiltin = tbl.lookup(AST.NodeTypes.INTEGER);
    assert.equal(intBuiltin instanceof Symtable.BuiltinTypeSymbol, true);
    assert.equal(intBuiltin.name, AST.NodeTypes.INTEGER);
  });

  it('should return REAL builtin type symbol', () => {
    const realBuiltin = tbl.lookup(AST.NodeTypes.REAL);
    assert.equal(realBuiltin instanceof Symtable.BuiltinTypeSymbol, true);
    assert.equal(realBuiltin.name, AST.NodeTypes.REAL);
  });
});
