const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const SymbolTable = require('./symtable.js');
const SemanticAnalyzer = require('./semantic_analyzer.js');
const AST = require('./ast.js');
const CallStack = require('./callstack.js');

module.exports = class Interpreter {
  constructor(tree, globalSymbolTable) {
    this.tree = tree;
    this.symbolTable_global = globalSymbolTable;
    this.symbolTable_current = undefined;
    this.callStack = [];
    this.currentStackFrame = undefined;
  }

  visit_BINOP(node) {
    const lhs = this.evalTree(node.left);
    const rhs = this.evalTree(node.right);

    switch (node.op.type) {
      case Lexer.TokenTypes.PLUS:
        return lhs + rhs;
      case Lexer.TokenTypes.MINUS:
        return lhs - rhs;
      case Lexer.TokenTypes.MULTIPLY:
        return lhs * rhs;
      case Lexer.TokenTypes.DIVIDE_INTEGER:
        return Math.floor(lhs / rhs);
      case Lexer.TokenTypes.DIVIDE_REAL:
        return lhs / rhs;
      case Lexer.TokenTypes.AND:
        return lhs && rhs;
      case Lexer.TokenTypes.OR:
        return lhs || rhs;
      case Lexer.TokenTypes.XOR:
        return ((lhs === true && rhs === false) || (lhs === false && rhs === true));
      case Lexer.TokenTypes.LT:
        return lhs < rhs;
      case Lexer.TokenTypes.GT:
        return lhs > rhs;
      case Lexer.TokenTypes.LEQ:
        return lhs <= rhs;
      case Lexer.TokenTypes.GEQ:
        return lhs >= rhs;
      case Lexer.TokenTypes.EQ:
        return lhs === rhs;
      case Lexer.TokenTypes.NEQ:
        return lhs !== rhs;
    }
  }

  visit_INTEGER(node) {
    return node.val;
  }

  visit_REAL(node) {
    return node.val;
  }

  visit_BOOLEAN(node) {
    return node.val;
  }

  visit_UNARYOP(node) {
    let factor = 1;
    if (node.op.type === Lexer.TokenTypes.MINUS) {
      factor = -1;
    }

    return factor * this.evalTree(node.expr);
  }

  visit_COMPOUND(node) {
    for (let i = 0; i < node.children.length; ++i) {
      this.evalTree(node.children[i]);
    }

    return this.currentStackFrame.asReturnObject();
  }

  visit_ASSIGN(node) {
    const varName = node.left.val;
    this.currentStackFrame.set(varName, this.evalTree(node.right));
  }

  visit_VAR(node) {
    return this.currentStackFrame.lookup(node.val.toUpperCase());
  }

  visit_NOOP(node) {
    return;
  }

  visit_BLOCK(node) {
    return this.evalTree(node.compoundStatement);
  }

  visit_PROCEDURECALL(node) {
    const procedureSymbol = this.symbolTable_current.lookup(node.name);
    const procedureFrame = new CallStack.CallStackFrame(this.currentStackFrame, procedureSymbol.symbolTable);

    // Push frame onto call stack
    this.pushStackFrame(procedureFrame);

    // Resolve parameter values and setup frame
    for (let i = 0; i < procedureSymbol.params.length; ++i) {
      const paramName = procedureSymbol.params[i].name;
      const paramVal = this.evalTree(node.params[i]); // Should be an expression of some sort
      procedureFrame.set(paramName, paramVal);
    }

    // Start executing block
    this.visit_BLOCK(procedureSymbol.block);
    this.popStackFrame();
    return;
  }

  visit_PROGRAM(node) {
    const entryFrame = new CallStack.CallStackFrame(undefined, this.symbolTable_global);
    this.pushStackFrame(entryFrame);
    return this.evalTree(node.block);
  }

  pushStackFrame(frame) {
    for (let symbolEntry of frame.symbolTable.symbols.entries()) {
      const symbolName = symbolEntry[0];
      const symbol = symbolEntry[1];

      if (symbol instanceof SymbolTable.VarSymbol) {
        frame.define(symbolName);
      }
    }

    this.callStack.push(frame);
    this.currentStackFrame = frame;
    this.symbolTable_current = frame.symbolTable;
  }

  popStackFrame() {
    let prevFrame = this.callStack.pop();
    this.currentStackFrame = this.callStack[this.callStack.length - 1];
    this.symbolTable_current = this.currentStackFrame.symbolTable;
    return prevFrame;
  }

  /* Evaluates AST starting from a root node */
  evalTree(node) {
    const visitor = this[`visit_${node.type}`];
    if (visitor) {
      return visitor.call(this, node);
    } else {
      console.log(`No visitor for node type ${node.type}`);
      return null;
    }
  }

  eval() {
    return this.evalTree(this.tree);
  }

  static evalStatement(stmt) {
    const astree = Parser.parseExpression(stmt);

    // Use the AST to calculate the final result
    const interpreter = new Interpreter(astree);
    return interpreter.eval();
  }

  static evalProgram(pgm) {
    const astree = Parser.parseProgram(pgm);
    const analyzer = new SemanticAnalyzer();
    const isValid = analyzer.visit(astree);

    if (isValid) {
      const interpreter = new Interpreter(astree, analyzer.globalScope);
      const varTable = interpreter.eval();
      return varTable;
    } else {
      console.log("Program has invalid symbols");
      return null;
    }
  }
}
