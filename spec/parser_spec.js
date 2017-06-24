const Parser = require('../parser.js');
const Lexer = require('../lexer.js');
const AST = require('../ast.js');
const assert = require('assert');

/* The parser takes an expression and uses the Lexer to
generate an abstract syntax tree (tree of nodes) which
the interpreter can then use to execute. Parser tests here
should test that the correct syntax tree is generated for
input expressions */

describe('Parser behavior', () => {
  function integerNode(num) {
    return {
      type: AST.NodeTypes.INTEGER,
      op: {
        type: Lexer.INTEGER,
        val: num
      },
      val: num
    }
  }

  function binaryOp(lhs, rhs, opVal) {
    return {
      type: AST.NodeTypes.BINOP,
      op: {
        type: Lexer.OperatorCharacterMap.get(opVal),
        val: opVal
      },
      left: lhs,
      right: rhs
    }
  }

  function unaryOp(operand, opVal) {
    return {
      type: AST.NodeTypes.UNARYOP,
      op: {
        type: Lexer.OperatorCharacterMap.get(opVal),
        val: opVal
      },
      expr: operand
    }
  }

  describe('when processing expressions', () => {
    it('should return a number token for a multi-digit number', () => {
      const node = Parser.parseExpression('1234');
      const expected = integerNode(1234);

      assert.deepEqual(node, expected);
    });

    // binary operation
    it('should return a binary operation node with integer RHS and LHS', () => {
      const node = Parser.parseExpression('3 * 5');
      const expected = binaryOp(
        integerNode(3),
        integerNode(5),
        '*');

      assert.deepEqual(node, expected);
    });

    // chain of binary operation w/o precedence
    it('should return a tree of binary operation nodes for an expression that is evaluated left to right', () => {
      const node = Parser.parseExpression('1 + 2 - 3');
      const expected = binaryOp(
        binaryOp(
          integerNode(1),
          integerNode(2),
          '+'),
        integerNode(3),
        '-');

      assert.deepEqual(node, expected);
    });

    // chain of binary operation w/precedence
    it('should return a tree of binary operation nodes for an expression that involves precedence rules', () => {
      const node = Parser.parseExpression('1 + 5 * 2');
      const expected = binaryOp(
        integerNode(1),
        binaryOp(
          integerNode(5),
          integerNode(2),
          '*'),
        '+');

      assert.deepEqual(node, expected);
    });

    it('should return a binary operation node with integer LHS and sub-expression RHS', () => {
      const node = Parser.parseExpression('3 * (5+2)');
      const expected = binaryOp(
        integerNode(3),
        binaryOp(
          integerNode(5),
          integerNode(2),
          '+'),
        '*');

      assert.deepEqual(node, expected);
    });

    it('should return a binary operation node with sub-expression LHS and integer RHS', () => {
      const node = Parser.parseExpression('(5+2) * 3');
      const expected = binaryOp(
        binaryOp(
          integerNode(5),
          integerNode(2),
          '+'),
        integerNode(3),
        '*');

      assert.deepEqual(node, expected);
    });

    // unary operation
    it('should be able to return a tree of unary operation nodes', () => {
      const node = Parser.parseExpression('---5');
      const expected = unaryOp(unaryOp(unaryOp(integerNode(5), '-'), '-'), '-');

      assert.deepEqual(node, expected);
    });

    it('should return unary operations as highest precedence', () => {
      const node = Parser.parseExpression('5 * -3');
      const expected = binaryOp(integerNode(5), unaryOp(integerNode(3), '-'), '*');

      assert.deepEqual(node, expected);
    });
  });

  describe('when processing statements', () => {
    // no-op program

    it.skip('should return an assignment node for := with a constant RHS', () => {
      const node = Parser.parseProgram('BEGIN a := 5');
      assert.equal(node.type, AST.NodeTypes.ASSIGN);
      assert.equal(node.right.type, AST.NodeTypes.INTEGER);
      assert.equal(node.right.val, 5);
      assert.equal(node.left.type, AST.NodeTypes.VAR);
      assert.equal(node.right.val, 'a');
    })

    // assignment statement
    // compound statement
  });
})
