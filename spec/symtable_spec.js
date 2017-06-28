const Symtable = require('../lib/symtable.js');
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

describe('Symbol Table Builder', () => {
  let builder = undefined;

  beforeEach(() => {
    builder = new Symtable.SymbolTableBuilder();
  });

  it('should return true for a program with valid assignments', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := 5; END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, true);
  });

  it('should return false for a program with an invalid assignment LHS', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN b := 5; END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, false);
  });

  it('should return false for a program with an invalid assignment RHS', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := b; END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, false);
  });

  it('should return true for a program with a procedure declaration', () => {
    const node = Parser.parseProgram('PROGRAM test; PROCEDURE myproc; BEGIN END; BEGIN END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, true);
  });
});
