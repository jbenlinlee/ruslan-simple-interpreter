const Parser = require('../lib/parser.js');
const SemanticAnalyzer = require('../lib/semantic_analyzer.js');
const assert = require('assert');

describe('Semantic Analyzer', () => {
  let builder = undefined;

  beforeEach(() => {
    builder = new SemanticAnalyzer();
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

  it('should return false for a program with a var defined twice', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR x : INTEGER; x : REAL; BEGIN END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, false);
  });

  it('should return true for a program with a procedure that uses a local scoped var', () => {
    const node = Parser.parseProgram('PROGRAM test; PROCEDURE myproc; VAR x : INTEGER; BEGIN x := 5; END; BEGIN END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, true);
  });

  it('should return true for a program with a procedure that uses a procedure param', () => {
    const node = Parser.parseProgram('PROGRAM test; PROCEDURE myproc(a : INTEGER); VAR x : INTEGER; BEGIN x := a; END; BEGIN END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, true);
  });

  it('should return true for a program with a procedure that refers to a var in parent scope', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR x : REAL; PROCEDURE myproc; VAR a : REAL; BEGIN a := x; END; BEGIN END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, true);
  });

  it('should return true even if a local scoped var masks a parent scoped var', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR x : REAL; PROCEDURE myproc; VAR x : INTEGER; BEGIN END; BEGIN END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, true);
  });

  it('should return false for a program that tries to refer to a var outside of scope', () => {
    const node = Parser.parseProgram('PROGRAM test; VAR x : REAL; PROCEDURE myproc; VAR a : REAL; BEGIN END; BEGIN x := a; END.');
    const isValid = builder.visit(node);
    assert.equal(isValid, false);
  });
});
