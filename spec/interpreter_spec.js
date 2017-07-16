const Interpreter = require('../lib/interpreter.js');
const assert = require('assert');

function testMathStatement(stmt, val) {
  const outcome = Interpreter.evalStatement(stmt);
  assert.equal(outcome, val);
}

function testProgram(pgm, vals) {
  const outcome = Interpreter.evalProgram(pgm);
  assert.deepEqual(outcome, vals);
}

describe('Interpreter', () => {
  describe('when handling basic expressions', () => {
    it('should be able to add two integers', () => {
      testMathStatement("3 + 10", 13);
    });

    it('should be able to subtract two integers', () => {
      testMathStatement("4 - 14", -10);
    });

    it('should be able to multiply two integers', () => {
      testMathStatement("6 * 3", 18);
    });

    it('should be able to divide two integers', () => {
      testMathStatement("12 DIV 4", 3);
    });

    it('should return the integer portion of an integer division', () => {
      testMathStatement("7 DIV 2", 3);
    });

    it('should return a floating point result for floating point division with integer inputs', () => {
      testMathStatement("10 / 4", 2.5);
    });

    it('should return a floating point result for floating point division floating point inputs', () => {
      testMathStatement("6.25 / 2.0", 3.125);
    });
  });

  describe('when handling expressions where precedence matters', () => {
    it('should multiply before adding', () => {
      testMathStatement("4 + 5 * 3", 19); // Should be 19 and not 27
    });

    it('should multiply before subtracting', () => {
      testMathStatement("15 - 3 * 2", 9); // Should be 9 and not 24
    });

    it('should divide before adding', () => {
      testMathStatement("20 + 12 DIV 3", 24); // Should be 24 and not (32 / 3)
    });

    it('should divide before subtracting', () => {
      testMathStatement("4 - 6 DIV 2", 1); // Should be 1 and not -1
    });

    it('should add and subtract from left to right', () => {
      testMathStatement("4 + 5 - 2", 7);
    });

    it('should multiply and divide from left to right', () => {
      testMathStatement("12 * 2 DIV 3", 8);
    });
  });

  describe('when handling expressions with parentheses', () => {
    it('should evaluate leading sub-expression before multiplication', () => {
      testMathStatement("(3 + 4) * 5", 35); // Should be 35 and not 23
    });

    it('should evaluate trailing sub-expression after multiplication', () => {
      testMathStatement("5 * (3 + 4)", 35); // Should be 35 and not 23
    });

    it('should evaluate leading sub-expression before division', () => {
      testMathStatement("(24 - 10) DIV 7", 2); // Should be 2 and not 24 - (10 / 7)
    });

    it('should evaluate trailing sub-expression after division', () => {
      testMathStatement("28 DIV (24 - 10)", 2);
    });

    it('should evaluate sub-expression within a sub-expression', () => {
      testMathStatement("15 * ((24 - 10) DIV 7)", 30);
    });
  });

  describe('when handling expressions with unary operators', () => {
    it('should evaluate the unary operator on the LHS factor before addition', () => {
      testMathStatement("-31 + 5", -26);
    });

    it('should evaluate the unary operator on the RHS factor before addition', () => {
      testMathStatement("42 + -33", 9);
    });

    it('should evaluate the unary operator on the LHS factor before subtraction', () => {
      testMathStatement("-7 - 5", -12);
    });

    it('should evaluate the unary operator on the RHS factor before subtraction', () => {
      testMathStatement("6 - -5", 11);
    });

    it('should evaluate the unary operator on the LHS factor before multiplication', () => {
      testMathStatement("-3 * 7", -21);
    });

    it('should evaluate the unary operator on the RHS factor before multiplication', () => {
      testMathStatement("7 * -3", -21);
    });

    it('should evaluate the unary operator on the LHS factor before division', () => {
      testMathStatement("-12 DIV 4", -3);
    });

    it('should evaluate the unary operator on the RHS factor before division', () => {
      testMathStatement("12 DIV -4", -3);
    });

    it('should handle sequences of unary operators', () => {
      testMathStatement("--4", 4);
    });
  });

  describe('when handling programs', () => {
    describe('that use assignment', () => {
      it('should evaluate a basic assignment to a static value correctly', () => {
        testProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := 5; END.', {A: 5});
      });

      it('should evaluate a basic assignment to an expression RHS correctly', () => {
        testProgram('PROGRAM test; VAR a : INTEGER; BEGIN a := 5 + 2 * 3; END.', {A: 11});
      });

      it('should evaluate assigning a var to another var correctly', () => {
        testProgram('PROGRAM test; VAR var1, var2 : INTEGER; BEGIN var1 := 10; var2 := var1; END.', {VAR1: 10, VAR2: 10});
      });

      it('should evaluate assigning an expression using a var to another var correctly', () => {
        testProgram('PROGRAM test; VAR var1, var2 : INTEGER; BEGIN var1 := 3; var2 := (var1 + 5) * 10; END.', {VAR1: 3, VAR2: 80});
      });
    });

    describe('that make procedure calls', () => {
      it('should reflect changes in vars made during a procedure call', () => {
        testProgram('PROGRAM test; VAR var1 : INTEGER; PROCEDURE myproc(a : INTEGER); BEGIN var1 := 2 * a; END; BEGIN myproc(3); END.', {VAR1: 6});
      });

      it('should not reflect changes to masked vars made during a procedure call', () => {
        testProgram('PROGRAM test; VAR var1 : INTEGER; PROCEDURE myproc; VAR var1 : INTEGER; BEGIN var1 := 5 END; BEGIN var1 := 3; myproc; END.', {VAR1: 3});
      });
    });

    describe('that use conditional statements', () => {
      it('should execute statement if true when test is true', () => {
        testProgram('PROGRAM test; VAR var1 : INTEGER; BEGIN var1 := 100; IF true THEN var1 := 50 END.', {VAR1: 50});
      });

      it('should not execute statement if true when test is false', () => {
        testProgram('PROGRAM test; VAR var1 : INTEGER; BEGIN var1 := 100; IF false THEN var1 := 50 END.', {VAR1: 100});
      });

      it('should execute else statement when test is false', () => {
        testProgram('PROGRAM test; VAR var1 : INTEGER; BEGIN var1 := 100; IF false THEN var1 := 50 ELSE var1 := 42 END.', {VAR1 : 42});
      });
    });
  });
});
