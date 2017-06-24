const Lexer = require('../lib/lexer.js');
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

  describe('Statement Handling', () => {
    it('should return correct token for a reserved keyword', () => {
      const lexer = new Lexer.Lexer("BEGIN");
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.BEGIN);
    });

    it('should return an identifier token for an alphanumeric input', () => {
      const id = "somevar"
      const lexer = new Lexer.Lexer(id);
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.ID);
      assert.equal(tok.val, id);
    });

    it('should return an assignment token for :=', () => {
      const lexer = new Lexer.Lexer(":=");
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.ASSIGN);
    });
  });
});
