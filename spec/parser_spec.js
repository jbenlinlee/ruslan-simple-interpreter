const Parser = require('../lib/parser.js');
const Lexer = require('../lib/lexer.js');
const AST = require('../lib/ast.js');
const Templates = require('../util/ast_template.js');
const assert = require('assert');

/* The parser takes an expression and uses the Lexer to
generate an abstract syntax tree (tree of nodes) which
the interpreter can then use to execute. Parser tests here
should test that the correct syntax tree is generated for
input expressions */

describe('Parser behavior', () => {
  // Copying in the Templates to clean up it-block code for readability
  integerNode = Templates.integerNode;
  realNode = Templates.realNode;
  booleanNode = Templates.booleanNode;
  binaryOp = Templates.binaryOp;
  unaryOp = Templates.unaryOp;
  assignmentNode = Templates.assignmentNode;
  procedureCallNode = Templates.procedureCallNode;
  varNode = Templates.varNode;
  noopNode = Templates.noopNode;
  compoundStatement = Templates.compoundStatement;
  varType = Templates.varType;
  declaration = Templates.declaration;
  block = Templates.block;
  procedure = Templates.procedure;
  parameter = Templates.parameter;
  program = Templates.program;

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

  describe('when processing boolean expressions', () => {
    it('should return a boolean node for constant true', () => {
      const node = Parser.parseBooleanExpression('TRUE');
      const expected = booleanNode(true);

      assert.deepEqual(node, expected);
    });

    it('should return a boolean node for constant false', () => {
      const node = Parser.parseBooleanExpression('false');
      const expected = booleanNode(false);

      assert.deepEqual(node, expected);
    });

    it('should correctly parse unary not', () => {
      const node = Parser.parseBooleanExpression('NoT true');
      const expected = unaryOp(booleanNode(true), 'NoT');

      assert.deepEqual(node, expected);
    });

    it('should correctly parse a boolean term with two constants', () => {
      const node = Parser.parseBooleanExpression('7 < 6');
      const expected = binaryOp(
        integerNode(7),
        integerNode(6),
        '<'
      );
    });

    it('should correctly parse a boolean term with a constant and an expression', () => {
      const node = Parser.parseBooleanExpression('1 + 3 < 10');
      const expected = binaryOp(
        binaryOp(
          integerNode(1),
          integerNode(3),
          '+'
        ),
        integerNode(10),
        '<'
      );

      assert.deepEqual(node, expected);
    });

    it('should correctly parse a boolean term with a constant and a parenthesized expression', () => {
      const node = Parser.parseBooleanExpression('(1 + 3) < 10');
      const expected = binaryOp(
        binaryOp(
          integerNode(1),
          integerNode(3),
          '+'
        ),
        integerNode(10),
        '<'
      );

      assert.deepEqual(node, expected);
    });

    it('should correctly parse a boolean expression with two constants', () => {
      const node = Parser.parseBooleanExpression('true AND FALSE');
      const expected = binaryOp(
        booleanNode(true),
        booleanNode(false),
        'AND'
      );

      assert.deepEqual(node, expected);
    });

    it('should correctly parse a boolean expression with a constant and a relational expression', () => {
      const node = Parser.parseBooleanExpression('6 < 7 AND true');
      const expected = binaryOp(
        binaryOp(
          integerNode(6),
          integerNode(7),
          '<'
        ),
        booleanNode(true),
        'AND'
      );
    });

    it('should correctly parse a boolean expression with a constant and a parenthesized relational expression', () => {
      const node = Parser.parseBooleanExpression('(6 >= 7) AND true');
      const expected = binaryOp(
        binaryOp(
          integerNode(6),
          integerNode(7),
          '>='
        ),
        booleanNode(true),
        'AND'
      );
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

  });

  describe('when processing declarations', () => {
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
            [],
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
              [],
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

    it('should return procedure nodes with one formal parameter specified', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE proc1(a:INTEGER); BEGIN END; BEGIN END.');
      const expected = program(
        'test',
        block(
          compoundStatement([noopNode()]),
          [
            procedure(
              'proc1',
              [
                parameter(varNode('a'), varType('INTEGER'))
              ],
              block(
                compoundStatement([noopNode()])
              )
            )
          ]
        )
      );

      assert.deepEqual(node, expected);
    });

    it('should return procedure nodes with more than one formal parameter specified', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE proc1(a:INTEGER; b:REAL); BEGIN END; BEGIN END.');
      const expected = program(
        'test',
        block(
          compoundStatement([noopNode()]),
          [
            procedure(
              'proc1',
              [
                parameter(varNode('a'), varType('INTEGER')),
                parameter(varNode('b'), varType('REAL'))
              ],
              block(
                compoundStatement([noopNode()])
              )
            )
          ]
        )
      );

      assert.deepEqual(node, expected);
    });
  });

  describe('when processing procedure call statements', () => {
    it('should return procedure call nodes with no parameters', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE proc1; BEGIN END; BEGIN proc1 END.');
      const expected = program(
        'test',
        block(
          compoundStatement([
            procedureCallNode('proc1', [])
          ]),
          [
            procedure(
              'proc1',
              [],
              block(
                compoundStatement([noopNode()])
              )
            )
          ]
        )
      );

      assert.deepEqual(node, expected);
    });

    it('should return procedure call nodes with parameters', () => {
      const node = Parser.parseProgram('PROGRAM test; PROCEDURE proc1(a : INTEGER; b : INTEGER); BEGIN END; BEGIN proc1(4, 5) END.');
      const expected = program(
        'test',
        block(
          compoundStatement([
            procedureCallNode('proc1', [
              integerNode(4),
              integerNode(5)
            ])
          ]),
          [
            procedure(
              'proc1',
              [
                parameter(varNode('a'), varType('INTEGER')),
                parameter(varNode('b'), varType('INTEGER'))
              ],
              block(
                compoundStatement([noopNode()])
              )
            )
          ]
        )
      );

      assert.deepEqual(node, expected);
    });
  });
});
