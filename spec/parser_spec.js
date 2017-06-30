const Parser = require('../lib/parser.js');
const Lexer = require('../lib/lexer.js');
const AST = require('../lib/ast.js');
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
        type: Lexer.TokenTypes.INTEGER_CONST,
        val: num
      },
      val: num
    }
  }

  function realNode(num) {
    return {
      type: AST.NodeTypes.REAL,
      op: {
        type: Lexer.TokenTypes.REAL_CONST,
        val: num
      },
      val: num
    }
  }

  function binaryOp(lhs, rhs, opVal) {
    return {
      type: AST.NodeTypes.BINOP,
      op: {
        type: Lexer.LexemeTokenMap.get(opVal),
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
        type: Lexer.LexemeTokenMap.get(opVal),
        val: opVal
      },
      expr: operand
    }
  }

  function assignmentNode(lhs, rhs) {
    return {
      type: AST.NodeTypes.ASSIGN,
      op: {
        type: Lexer.TokenTypes.ASSIGN,
        val: ':='
      },
      left: lhs,
      right: rhs
    }
  }

  function varNode(varName) {
    return {
      type: AST.NodeTypes.VAR,
      token: {
        type: Lexer.TokenTypes.ID,
        val: varName
      },
      val: varName
    }
  }

  function noopNode() {
    return {
      type: AST.NodeTypes.NOOP
    }
  }

  function compoundStatement(statements) {
    return {
      type: AST.NodeTypes.COMPOUND,
      children: statements
    }
  }

  function varType(type) {
    return {
      type: AST.NodeTypes.TYPEDECL,
      tok: {
        type: type,
        val: type
      },
      val: type
    }
  }

  function declaration(name, type) {
    return {
      type: AST.NodeTypes.VARDECL,
      var: varNode(name),
      varType: varType(type)
    }
  }

  function block(compound, decls) {
    return {
      type: AST.NodeTypes.BLOCK,
      declarations: decls || [],
      compoundStatement: compound
    }
  }

  function procedure(name, block) {
    return {
      type: AST.NodeTypes.PROCEDURE,
      name: name,
      block: block
    }
  }

  function program(name, block) {
    return {
      type: AST.NodeTypes.PROGRAM,
      name: name,
      block: block
    }
  }

  describe('when processing expressions', () => {
    it('should return a number token for a multi-digit number', () => {
      const node = Parser.parseExpression('1234');
      const expected = integerNode(1234);

      assert.deepEqual(node, expected);
    });

    it('should return a real token for a real value', () => {
      const node = Parser.parseExpression('123.456');
      const expected = realNode(123.456);
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

    it('should return a binary operation node with integer RHS and real LHS', () => {
      const node = Parser.parseExpression('3.14 * 5');
      const expected = binaryOp(
        realNode(3.14),
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
    it('should return a noop for an empty program', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN END.');
      const expected = program('test', block(compoundStatement([noopNode()])));
      assert.deepEqual(node, expected);
    });

    it('should return a noop for an empty program with comments', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN {hello, world} END.');
      const expected = program('test', block(compoundStatement([noopNode()])));
      assert.deepEqual(node, expected);
    })

    // assignment statement
    it('should return an assignment node for := with a constant RHS', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN a := 5; END.');
      const expected = program('test', block(compoundStatement([
        assignmentNode(varNode('a'), integerNode(5)),
        noopNode()
      ])));

      assert.deepEqual(node, expected);
    });

    it('should return an assignment node for := with an expression RHS', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN a := (5 + 2) * 3; END.');
      const expected = program('test', block(compoundStatement([
        assignmentNode(
          varNode('a'),
          binaryOp(
            binaryOp(integerNode(5), integerNode(2), '+'),
            integerNode(3),
            '*')
        ),
        noopNode()
      ])));

      assert.deepEqual(node, expected);
    });

    it('should return an assignment node for := with a variable RHS', () => {
      const node = Parser.parseProgram('PROGRAM test; BEGIN a := 100; myvar := a; END.');
      const expected = program('test', block(compoundStatement([
        assignmentNode(varNode('a'), integerNode(100)),
        assignmentNode(varNode('myvar'), varNode('a')),
        noopNode()
      ])));

      assert.deepEqual(node, expected);
    });

    it('should return a single integer var node', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a:INTEGER; BEGIN END.');
      const expected = program('test',
        block(compoundStatement([noopNode()]),
          [declaration('a', 'INTEGER')]));

      assert.deepEqual(node, expected);
    });

    it('should return more than one real var node defined on a single line', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a,b:REAL; BEGIN END.');
      const expected = program('test',
        block(compoundStatement([noopNode()]),
          [declaration('a', 'REAL'), declaration('b', 'REAL')]));

      assert.deepEqual(node, expected);
    });

    it('should return var nodes defined on separate lines', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a:INTEGER; b:REAL; BEGIN END.');
      const expected = program('test',
        block(compoundStatement([noopNode()]),
          [declaration('a', 'INTEGER'), declaration('b', 'REAL')]));

      assert.deepEqual(node, expected);
    });

    it('should return procedure nodes with no var nodes', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE proc1; BEGIN END; BEGIN END.');
      const expected = program('test',
        block(compoundStatement([noopNode()]),
          [procedure('proc1',
            block(compoundStatement([noopNode()])))]
        ));

      assert.deepEqual(node, expected);
    });

    it('should return procedure nodes with an assignment alongside var nodes', () => {
      const node = Parser.parseProgram('PROGRAM test; VAR a : INTEGER; PROCEDURE proc1; BEGIN a := 5 END; BEGIN END.');
      const expected = program(
        'test',
        block(
          compoundStatement([noopNode()]),
          [
            declaration('a', 'INTEGER'),
            procedure(
              'proc1',
              block(
                compoundStatement([
                  assignmentNode(varNode('a'), integerNode(5))
                ])
              )
          )]
        )
      );

      assert.deepEqual(node, expected);
    });
  });
})
