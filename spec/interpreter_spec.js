const Interpreter = require('../interpreter.js');
const assert = require('assert');

describe('Interpreter', () => {
  describe('when handling basic expressions', () => {
    it('should be able to add two integers', () => {
      const interpreter = new Interpreter("3 + 10");
      assert.equal(interpreter.eval(), 13);
    });

    it('should be able to subtract two integers', () => {
      const interpreter = new Interpreter("4 - 14");
      assert.equal(interpreter.eval(), -10);
    });

    it('should be able to multiply two integers', () => {
      const interpreter = new Interpreter("6 * 3");
      assert.equal(interpreter.eval(), 18);
    });

    it('should be able to divide two integers', () => {
      const interpreter = new Interpreter("12 / 4");
      assert.equal(interpreter.eval(), 3);
    });
  });

  describe('when handling expressions where precedence matters', () => {
    it('should multiply before adding', () => {
      const interpreter = new Interpreter("4 + 5 * 3"); // Should be 19 and not 27
      assert.equal(interpreter.eval(), 19);
    });

    it('should multiply before subtracting', () => {
      const interpreter = new Interpreter("15 - 3 * 2"); // Should be 9 and not 24
      assert.equal(interpreter.eval(), 9);
    });

    it('should divide before adding', () => {
      const interpreter = new Interpreter("20 + 12 / 3"); // Should be 24 and not (32 / 3)
      assert.equal(interpreter.eval(), 24);
    });

    it('should divide before subtracting', () => {
      const interpreter = new Interpreter("4 - 6 / 2"); // Should be 1 and not -1
      assert.equal(interpreter.eval(), 1);
    });

    it('should add and subtract from left to right', () => {
      const interpreter = new Interpreter("4 + 5 - 2");
      assert.equal(interpreter.eval(), 7);
    });

    it('should multiply and divide from left to right', () => {
      const interpreter = new Interpreter("12 * 2 / 3");
      assert.equal(interpreter.eval(), 8);
    });
  });

  describe('when handling expressions with parentheses', () => {
    it('should evaluate leading sub-expression before multiplication', () => {
      const interpreter = new Interpreter("(3 + 4) * 5"); // Should be 35 and not 23
      assert.equal(interpreter.eval(), 35);
    });

    it('should evaluate trailing sub-expression after multiplication', () => {
      const interpreter = new Interpreter("5 * (3 + 4)"); // Should be 35 and not 23
      assert.equal(interpreter.eval(), 35);
    });

    it('should evaluate leading sub-expression before division', () => {
      const interpreter = new Interpreter("(24 - 10) / 7"); // Should be 2 and not 24 - (10 / 7)
      assert.equal(interpreter.eval(), 2);
    });

    it('should evaluate trailing sub-expression after division', () => {
      const interpreter = new Interpreter("28 / (24 - 10)");
      assert.equal(interpreter.eval(), 2);
    });

    it('should evaluate sub-expression within a sub-expression', () => {
      const interpreter = new Interpreter("15 * ((24 - 10) / 7)");
      assert.equal(interpreter.eval(), 30);
    });
  });

  describe('when handling expressions with unary operators', () => {
    it('should evaluate the unary operator on the LHS factor before addition', () => {
      const interpreter = new Interpreter("-31 + 5");
      assert.equal(interpreter.eval(), -26);
    });

    it('should evaluate the unary operator on the RHS factor before addition', () => {
      const interpreter = new Interpreter("42 + -33");
      assert.equal(interpreter.eval(), 9);
    });

    it('should evaluate the unary operator on the LHS factor before subtraction', () => {
      const interpreter = new Interpreter("-7 - 5");
      assert.equal(interpreter.eval(), -12);
    });

    it('should evaluate the unary operator on the RHS factor before subtraction', () => {
      const interpreter = new Interpreter("6 - -5");
      assert.equal(interpreter.eval(), 11);
    });

    it('should evaluate the unary operator on the LHS factor before multiplication', () => {
      const interpreter = new Interpreter("-3 * 7");
      assert.equal(interpreter.eval(), -21);
    });

    it('should evaluate the unary operator on the RHS factor before multiplication', () => {
      const interpreter = new Interpreter("7 * -3");
      assert.equal(interpreter.eval(), -21);
    });

    it('should evaluate the unary operator on the LHS factor before division', () => {
      const interpreter = new Interpreter("-12 / 4");
      assert.equal(interpreter.eval(), -3);
    });

    it('should evaluate the unary operator on the RHS factor before division', () => {
      const interpreter = new Interpreter("12 / -4");
      assert.equal(interpreter.eval(), -3);
    });

    it('should handle sequences of unary operators', () => {
      const interpreter = new Interpreter("--4");
      assert.equal(interpreter.eval(), 4);
    });
  });
});
