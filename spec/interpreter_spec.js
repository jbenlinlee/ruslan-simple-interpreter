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
    it.skip('should multiply before adding', () => {});
    it.skip('should multiply before subtracting', () => {});
    it.skip('should divide before adding', () => {});
    it.skip('should divide before subtracting', () => {});
    it.skip('should add and subtract from left to right', () => {});
    it.skip('should multiply and divide from left to right', () => {});
  });

  describe('when handling expressions with parentheses', () => {
    it.skip('should evaluate sub-expression before addition', () => {});
    it.skip('should evaluate sub-expression before subtraction', () => {});
    it.skip('should evaluate sub-expression before multiplication', () => {});
    it.skip('should evaluate sub-expression before division', () => {});
    it.skip('should evaluate sub-expression within a sub-expression', () => {});
  });
});
