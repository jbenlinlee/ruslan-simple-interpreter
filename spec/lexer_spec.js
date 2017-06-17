const Lexer = require('../lexer.js');
const assert = require('assert');

describe('Lexer', () => {
  describe('Integer Handling', () => {
    it('should read a single-digit integer', () => {
      const lexer = new Lexer.Lexer("3");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.INTEGER);
      assert.equal(tok.val, 3);
    });

    it('should read a multi-digit integer', () => {
      const lexer = new Lexer.Lexer("456");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.INTEGER);
      assert.equal(tok.val, 456);
    });
  });

  describe('Whitespace Handling', () => {
    it('should skip leading whitespace', () => {
      const lexer = new Lexer.Lexer("  890");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.INTEGER);
      assert.equal(tok.val, 890);
    });

    it('should skip whitespace after a token but before next token', () => {
      const lexer = new Lexer.Lexer("890 *");
      let tok = lexer.getNextToken();
      tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.MULTIPLY);
    });

    it('should skip trailing whitespace', () => {
      const lexer = new Lexer.Lexer("890 ");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.INTEGER);
      assert.equal(tok.val, 890);
    });
  });

  it('should return null for a non-integer, non-operator, non-parenthesis input', () => {
    const lexer = new Lexer.Lexer("abc");
    const tok = lexer.getNextToken();
    assert.strictEqual(tok, null);
  })
});
