const assert = require('assert');
const AST = require('../lib/ast.js');
const SymbolTable = require('../lib/symtable.js');
const Templates = require('../util/ast_template.js');
const TypeAnalyzer = require('../lib/type_analyzer.js');

describe('Type Analyzer', () => {
  let globalSymbolTable;
  let analyzer;
  let INTEGER_Symbol = new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.INTEGER);
  let REAL_Symbol = new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.REAL)

  // Copying in the Templates to clean up it-block code for readability
  integerNode = Templates.integerNode;
  realNode = Templates.realNode;
  binaryOp = Templates.binaryOp;
  varNode = Templates.varNode;

  function testType(expectedTypeSymbol, node) {
    assert.equal(analyzer.visit(node), expectedTypeSymbol ? expectedTypeSymbol.name : undefined);
  }

  beforeEach(() => {
    globalSymbolTable = new SymbolTable.SymbolTable();
    globalSymbolTable.define(INTEGER_Symbol);
    globalSymbolTable.define(REAL_Symbol);
    globalSymbolTable.define(new SymbolTable.VarSymbol('intA', INTEGER_Symbol));
    globalSymbolTable.define(new SymbolTable.VarSymbol('realB', REAL_Symbol));

    analyzer = new TypeAnalyzer(globalSymbolTable);
  });

  describe('for builtin types', () => {
    it('should return INTEGER for an integer const', () => {
      testType(INTEGER_Symbol, integerNode(5));
    });

    it('should return REAL for a real const', () => {
      testType(REAL_Symbol, realNode(3.0));
    });
  });

  describe('for expressions', () => {
    it('should return INTEGER for addition of two integers', () => {
      testType(INTEGER_Symbol, binaryOp(
        integerNode(1),
        integerNode(3),
        '+'
      ));
    });

    it('should return REAL for addition of two reals', () => {
      testType(REAL_Symbol, binaryOp(
        realNode(1.0),
        realNode(34.2),
        '+'
      ));
    });

    it('should return REAL for addition of an integer and a real', () => {
      testType(REAL_Symbol, binaryOp(
        integerNode(10),
        realNode(3.1),
        '+'
      ));
    });

    it('should return INTEGER for subtraction of two integers', () => {
      testType(INTEGER_Symbol, binaryOp(
        integerNode(5),
        integerNode(21),
        '-'
      ));
    });

    it('should return REAL for subtraction of two reals', () => {
      testType(REAL_Symbol, binaryOp(
        realNode(3.14),
        realNode(0.21),
        '-'
      ));
    });

    it('should return REAL for subtraction of an integer and a real', () => {
      testType(REAL_Symbol, binaryOp(
        realNode(10.8),
        integerNode(3),
        '-'
      ));
    });

    it('should return INTEGER for multiplication of two integers', () => {
      testType(INTEGER_Symbol, binaryOp(
        integerNode(3),
        integerNode(7),
        '*'
      ));
    });

    it('should return REAL for multiplication of two reals', () => {
      testType(REAL_Symbol, binaryOp(
        realNode(6.54),
        realNode(1.23),
        '*'
      ));
    });

    it('should return REAL for multiplication of an integer and a real', () => {
      testType(REAL_Symbol, binaryOp(
        integerNode(3),
        realNode(7.5),
        '*'
      ));
    });

    it('should return INTEGER for integer division of two integers', () => {
      testType(INTEGER_Symbol, binaryOp(
        integerNode(21),
        integerNode(7),
        'DIV'
      ));
    });

    it('should return undefined for integer division of two reals', () => {
      testType(undefined, binaryOp(
        realNode(42.5),
        realNode(3.14),
        'DIV'
      ));
    });

    it('should return undefined for integer division of an integer and a real', () => {
      testType(undefined, binaryOp(
        integerNode(21),
        realNode(7.1),
        'DIV'
      ));
    });

    it('should return REAL for real division of two reals', () => {
      testType(REAL_Symbol, binaryOp(
        realNode(7.89),
        realNode(1.0),
        '/'
      ));
    });

    it('should return REAL for real division of two integers', () => {
      testType(REAL_Symbol, binaryOp(
        integerNode(10),
        integerNode(2),
        '/'
      ));
    });

    it('should return REAL for real division of an integer and a real', () => {
      testType(REAL_Symbol, binaryOp(
        integerNode(10),
        realNode(2.0),
        '/'
      ));
    });
  });

  describe('for variables', () => {
    beforeEach(() => {
      let localSymbolTable = new SymbolTable.SymbolTable(globalSymbolTable);
      localSymbolTable.define(new SymbolTable.VarSymbol('intA_prime', INTEGER_Symbol));
      localSymbolTable.define(new SymbolTable.VarSymbol('realB_prime', REAL_Symbol));

      analyzer = new TypeAnalyzer(localSymbolTable);
    });

    it('should return INTEGER for a defined integer variable in global scope', () => {
      testType(INTEGER_Symbol, varNode('intA'));
    });

    it('should return REAL for a defined real variable in global scope', () => {
      testType(REAL_Symbol, varNode('realB'));
    });

    it('should return INTEGER for a defined integer variable in local scope', () => {
      testType(INTEGER_Symbol, varNode('intA_prime'));
    });

    it('should return REAL for a defined real variable in local scope', () => {
      testType(REAL_Symbol, varNode('realB_prime'));
    });
  });
});
