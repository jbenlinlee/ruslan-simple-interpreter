const Parser = require('../parser.js');
const AST = require('../ast.js');
const assert = require('assert');

/* The parser takes an expression and uses the Lexer to
generate an abstract syntax tree (tree of nodes) which
the interpreter can then use to execute. Parser tests here
should test that the correct syntax tree is generated for
input expressions */

describe('Parser behavior', () => {
  describe('when processing individual tokens', () => {
    it('should return a number token for a multi-digit number', () => {
      const node = Parser.parseExpression('1234');
      assert.equal(node.type, AST.NodeTypes.INTEGER);
      assert.equal(node.val, 1234);
    });

    it.skip('should return an assignment token for :=', () => {});
    it.skip('should return an identifier token for a non-reserved alphanumeric word', () => {});
    it.skip('should return a begin token for BEGIN', () => {});
    it.skip('should return an end token for END', () => {});
  });

  describe('when processing expressions', () => {
    // binary operation
    // chain of binary operation w/o precedence
    // chain of binary operation w/precedence
    // unary operation
    // sub-expression
  });

  describe('when processing statements', () => {
    // assignment statement
    // compound statement
    // no-op program
  });
})
