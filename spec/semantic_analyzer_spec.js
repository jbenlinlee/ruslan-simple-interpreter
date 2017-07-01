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
});
