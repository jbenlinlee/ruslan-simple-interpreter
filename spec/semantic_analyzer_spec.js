const Parser = require('../lib/parser.js');
const SemanticAnalyzer = require('../lib/semantic_analyzer.js');
const assert = require('assert');

describe('Semantic Analyzer', () => {
  let builder = undefined;

  beforeEach(() => {
    builder = new SemanticAnalyzer();
  });

  describe('when handling assignments', () => {
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
  });

  describe('when checking types', () => {
    it('should return true for a program that assigns an integer const to an integer var', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := 10; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });

    it('should return false for a program that assigns a real const to an integer var', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := 5.0; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, false);
    });

    it('should return true for a program that assigns a real const to a real var', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : REAL; BEGIN a := 5.0; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });

    it('should return false for a program that assigns an integer const to a real var', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : REAL; BEGIN a := 5; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, false);
    });

    it('should return true for a program that assigns a real expression to a real var', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : REAL; BEGIN a := 5.0 / 3; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });

    it('should return false for a program that assigns a real expression to an integer var', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := 5.0 / 3; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, false);
    });
  });

  describe('when handling declarations', () => {
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
  });

  describe('when handling variable refs and scoping', () => {
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

    it('should create a symbol table containing INTEGER and REAL builtins as well as program name', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, true);
      assert.notStrictEqual(builder.rootScope.lookup('INTEGER'), undefined);
      assert.notStrictEqual(builder.rootScope.lookup('REAL'), undefined);
      assert.notStrictEqual(builder.rootScope.lookup('test'), undefined);
    });
  });

  describe('when handling procedure calls', () => {
    it('should return true for a program with a valid procedure call', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE myproc; BEGIN END; BEGIN myproc; END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, true);
    });

    it('should return false if a procedure call is for an undefined procedure', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE someproc; BEGIN END; BEGIN myproc; END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, false);
    });

    it('should return false if a procedure call is for something other than a procedure', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR x : INTEGER; BEGIN x; END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, false);
    });

    it('should return true for a procedure call with valid const arguments', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE myproc(a : INTEGER); BEGIN END; BEGIN myproc(5); END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, true);
    });

    it('should return true for a procedure call with valid var arguments', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR x : INTEGER; PROCEDURE myproc(a : INTEGER); BEGIN END; BEGIN myproc(x); END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, true);
    });

    it('should return false for a procedure call with invalid var arguments', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR x : INTEGER; PROCEDURE myproc(a : INTEGER); BEGIN END; BEGIN myproc(y); END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, false);
    });
  });

  describe('when handling conditional statements', () => {
    it('should return false for a conditional with a non-boolean test expression', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN IF 10 + 3.4 THEN; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, false);
    });

    it('should return true for a conditional with a boolean expression that has two consts', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN IF true AND false THEN; END.');
      const isValid = builder.visit(node);

      assert.equal(isValid, true);
    });

    it('should return true for a conditional with a boolean expression that has a const and a variable', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : BOOLEAN; BEGIN IF a OR true THEN; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });

    it('should return true for a conditional with a boolean expression that contains a relational expression', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN IF 6 < 7 THEN; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });
  });

  describe('when handling WHILE-DO statements', () => {
    it('should return false for a non-boolean test expression', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN WHILE 1 + 3 DO END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, false);
    });

    it('should return false for an invalid loop body', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN WHILE true DO a := 1 END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, false);
    });

    it('should return true for a boolean const test expression', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN WHILE true DO END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });

    it('should return true for a valid loop body', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN WHILE true DO a := a + 1 END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });

    it('should return true for a compound statement loop body', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; BEGIN WHILE true DO BEGIN a := a + 1 END; END.');
      const isValid = builder.visit(node);
      assert.equal(isValid, true);
    });
  });
});
