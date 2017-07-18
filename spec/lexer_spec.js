const Lexer = require('../lib/lexer.js');
const assert = require('assert');

function tokenTypeCheck(expr, expectedType) {
  const lexer = new Lexer.Lexer(expr);
  const tok = lexer.getNextToken();
  assert.equal(tok.type, expectedType);

  return lexer;
}

describe('Lexer', () => {
  describe('Integer Handling', () => {
    it('should read a single-digit integer', () => {
      const lexer = new Lexer.Lexer("3");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.INTEGER_CONST);
      assert.equal(tok.val, 3);
    });

    it('should read a multi-digit integer', () => {
      const lexer = new Lexer.Lexer("456");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.INTEGER_CONST);
      assert.equal(tok.val, 456);
    });

    it('should read a real constant', () => {
      const lexer = new Lexer.Lexer("123.456");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.REAL_CONST);
      assert.equal(tok.val, 123.456);
    })
  });

  describe('Whitespace Handling', () => {
    it('should skip leading whitespace', () => {
      const lexer = new Lexer.Lexer("  890");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.INTEGER_CONST);
      assert.equal(tok.val, 890);
    });

    it('should skip whitespace after a token but before next token', () => {
      const lexer = new Lexer.Lexer("890 *");
      let tok = lexer.getNextToken();
      tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.MULTIPLY);
    });

    it('should skip trailing whitespace', () => {
      const lexer = new Lexer.Lexer("890 ");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.INTEGER_CONST);
      assert.equal(tok.val, 890);
    });
  });

  describe('Boolean Expression Handling', () => {
    it('should produce a BOOLEAN_CONST token for "true"', () => {
      const lexer = new Lexer.Lexer("true");
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.BOOLEAN_CONST);
      assert.equal(tok.val, true);
    });

    it('should produce a BOOLEAN_CONST token for "FALSE"', () => {
      const lexer = new Lexer.Lexer('false');
      const tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.BOOLEAN_CONST);
      assert.equal(tok.val, false);
    });

    it('should produce the correct token for >', () => {
      tokenTypeCheck('>', Lexer.TokenTypes.GT);
    });

    it('should produce the correct token for <', () => {
      tokenTypeCheck('<', Lexer.TokenTypes.LT);
    });

    it('should produce the correct token for =', () => {
      tokenTypeCheck('=', Lexer.TokenTypes.EQ);
    });

    it('should produce the correct token for <=', () => {
      tokenTypeCheck('<=', Lexer.TokenTypes.LEQ);
    });

    it('should produce the correct token for >=', () => {
      tokenTypeCheck('>=', Lexer.TokenTypes.GEQ);
    });

    it('should produce the correct token for <>', () => {
      tokenTypeCheck('<>', Lexer.TokenTypes.NEQ);
    });

    it('should produce the correct token for NOT', () => {
      tokenTypeCheck('NOT', Lexer.TokenTypes.NOT);
    });

    it('should produce the correct token for AND', () => {
      tokenTypeCheck('AND', Lexer.TokenTypes.AND);
    });

    it('should produce the correct token for OR', () => {
      tokenTypeCheck('OR', Lexer.TokenTypes.OR);
    });

    it('should produce the correct token for XOR', () => {
      tokenTypeCheck('XOR', Lexer.TokenTypes.XOR);
    });
  });

  describe('Statement Handling', () => {
    describe('for reserved keywords', () => {
      it('should return correct token for reserved keyword BEGIN in a case insensitive manner', () => {
        tokenTypeCheck('BEGIN', Lexer.TokenTypes.BEGIN);
        tokenTypeCheck('BeGiN', Lexer.TokenTypes.BEGIN);
      });

      it('should return correct token for reserved keyword END in a case insensitive manner', () => {
        tokenTypeCheck('END', Lexer.TokenTypes.END);
        tokenTypeCheck('EnD', Lexer.TokenTypes.END);
      });

      it('should return correct token for reserved keyword PROGRAM in a case insensitive manner', () => {
        tokenTypeCheck('PROGRAM', Lexer.TokenTypes.PROGRAM);
        tokenTypeCheck('PrOgRaM', Lexer.TokenTypes.PROGRAM);
      });

      it('should return correct token for reserved keyword VAR in a case insensitive manner', () => {
        tokenTypeCheck('VAR', Lexer.TokenTypes.VAR);
        tokenTypeCheck('VaR', Lexer.TokenTypes.VAR);
      });

      it('should return correct token for reserved keyword INTEGER in a case insensitive manner', () => {
        tokenTypeCheck('INTEGER', Lexer.TokenTypes.TYPE_INTEGER);
        tokenTypeCheck('InTeGeR', Lexer.TokenTypes.TYPE_INTEGER);
      });

      it('should return correct token for reserved keyword REAL in a case insensitive manner', () => {
        tokenTypeCheck('REAL', Lexer.TokenTypes.TYPE_REAL);
        tokenTypeCheck('ReAl', Lexer.TokenTypes.TYPE_REAL);
      });

      it('should return correct token for reserved keyword DIV in a case insensitive manner', () => {
        tokenTypeCheck('DIV', Lexer.TokenTypes.DIVIDE_INTEGER);
        tokenTypeCheck('DiV', Lexer.TokenTypes.DIVIDE_INTEGER);
      });

      it('should return correct token for reserved keyword PROCEDURE in a case insensitive manner', () => {
        tokenTypeCheck('PROCEDURE', Lexer.TokenTypes.PROCEDURE);
        tokenTypeCheck('pRoCeDuRe', Lexer.TokenTypes.PROCEDURE);
      });

      it('should return correct token for reserved word IF in a case insensitive manner', () => {
        tokenTypeCheck('IF', Lexer.TokenTypes.IF);
        tokenTypeCheck('iF', Lexer.TokenTypes.IF);
      });

      it('should return correct token for reserved word THEN in a case insensitive manner', () => {
        tokenTypeCheck('THEN', Lexer.TokenTypes.THEN);
        tokenTypeCheck('tHeN', Lexer.TokenTypes.THEN);
      });

      it('should return correct token for reserved word ELSE in a case insensitive manner', () => {
        tokenTypeCheck('ELSE', Lexer.TokenTypes.ELSE);
        tokenTypeCheck('eLsE', Lexer.TokenTypes.ELSE);
      });

      it('should return correct token for reserved word WHILE in a case insensitive manner', () => {
        tokenTypeCheck('WHILE', Lexer.TokenTypes.WHILE);
        tokenTypeCheck('WhIlE', Lexer.TokenTypes.WHILE);
      });

      it('should return correct token for reserved word DO in a case insensitive manner', () => {
        tokenTypeCheck('DO', Lexer.TokenTypes.DO);
        tokenTypeCheck('dO', Lexer.TokenTypes.DO);
      });

      it('should return correct token for reserved word REPEAT in a case insensitive manner', () => {
        tokenTypeCheck('REPEAT', Lexer.TokenTypes.REPEAT);
        tokenTypeCheck('RePeAt', Lexer.TokenTypes.REPEAT);
      });

      it('should return correct token for reserved word UNTIL in a case insensitive manner', () => {
        tokenTypeCheck('UNTIL', Lexer.TokenTypes.UNTIL);
        tokenTypeCheck('uNtIl', Lexer.TokenTypes.UNTIL);
      });
    });

    describe('for operators', () => {
      it('should return an assignment token for :=', () => {
        tokenTypeCheck(':=', Lexer.TokenTypes.ASSIGN);
      });

      it('should return a comma token for ,', () => {
        tokenTypeCheck(',', Lexer.TokenTypes.COMMA);
      });

      it('should return a plus token for +', () => {
        tokenTypeCheck('+', Lexer.TokenTypes.PLUS);
      });

      it('should return a minus token for -', () => {
        tokenTypeCheck('-', Lexer.TokenTypes.MINUS);
      });

      it('should return a multiply token for *', () => {
        tokenTypeCheck('*', Lexer.TokenTypes.MULTIPLY);
      });

      it('should return a DIVIDE_REAL token for /', () => {
        tokenTypeCheck('/', Lexer.TokenTypes.DIVIDE_REAL);
      });
    });

    it('should skip comments', () => {
      const lexer = new Lexer.Lexer('1234 {hello, world} begin');
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.INTEGER_CONST);
      assert.equal(tok.val, 1234);

      // Should skip over comments and return a begin token
      tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.BEGIN);
    });

    it('should skip a series of consecutive comments', () => {
      const lexer = new Lexer.Lexer('{this is}{a series}{of comments}');
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.EOF);
    });

    it('should skip a series of whitespace separated comments', () => {
      const lexer = new Lexer.Lexer('{this is} {a series} {of comments}');
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.EOF);
    });

    it('should return an identifier token for an alphanumeric input', () => {
      const id = "somevar"
      const lexer = new Lexer.Lexer(id);
      let tok = lexer.getNextToken();
      assert.equal(tok.type, Lexer.TokenTypes.ID);
      assert.equal(tok.val, id);
    });
  });
});
