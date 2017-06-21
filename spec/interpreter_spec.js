const Interpreter = require('../interpreter.js');
const assert = require('assert');

function testMathStatement(stmt, val) {
  const outcome = Interpreter.eval(stmt);
  assert.equal(outcome, val);
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
      testMathStatement("12 / 4", 3);
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
      testMathStatement("20 + 12 / 3", 24); // Should be 24 and not (32 / 3)
    });

    it('should divide before subtracting', () => {
      testMathStatement("4 - 6 / 2", 1); // Should be 1 and not -1
    });

    it('should add and subtract from left to right', () => {
      testMathStatement("4 + 5 - 2", 7);
    });

    it('should multiply and divide from left to right', () => {
      testMathStatement("12 * 2 / 3", 8);
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
      testMathStatement("(24 - 10) / 7", 2); // Should be 2 and not 24 - (10 / 7)
    });

    it('should evaluate trailing sub-expression after division', () => {
      testMathStatement("28 / (24 - 10)", 2);
    });

    it('should evaluate sub-expression within a sub-expression', () => {
      testMathStatement("15 * ((24 - 10) / 7)", 30);
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
      testMathStatement("-12 / 4", -3);
    });

    it('should evaluate the unary operator on the RHS factor before division', () => {
      testMathStatement("12 / -4", -3);
    });

    it('should handle sequences of unary operators', () => {
      testMathStatement("--4", 4);
    });
  });
});
