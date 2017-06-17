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
    it.skip('should evaluate sub-expression before addition', () => {});
    it.skip('should evaluate sub-expression before subtraction', () => {});
    it.skip('should evaluate sub-expression before multiplication', () => {});
    it.skip('should evaluate sub-expression before division', () => {});
    it.skip('should evaluate sub-expression within a sub-expression', () => {});
  });
});
