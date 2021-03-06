const SymbolTable = require('./symtable.js');
const Lexer = require('./lexer.js');
const AST = require('./ast.js');
const TypeAnalyzer = require('./type_analyzer.js');

class SemanticAnalyzer {
  constructor() {
    this.rootScope = new SymbolTable.SymbolTable();
    this.globalScope = new SymbolTable.SymbolTable(this.rootScope);
    this.symbolTable = this.rootScope;
  }

  visit(node) {
    const visitor = this[`visit_${node.type}`];
    return visitor !== undefined ? visitor.call(this, node) : false;
  }

  visit_PROGRAM(node) {
    // Define builtins at the root scope
    this.rootScope.define(new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.INTEGER));
    this.rootScope.define(new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.REAL));
    this.rootScope.define(new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.BOOLEAN));

    // Add program name to root scope
    this.rootScope.define(new SymbolTable.ProgramSymbol(node.name));

    this.symbolTable = this.globalScope;
    return this.visit(node.block);
  }

  visit_PROCEDURE(node) {
    try {
      const procedure_table = new SymbolTable.SymbolTable(this.symbolTable);
      const procedure_symbol = new SymbolTable.ProcedureSymbol(node.name, node.block, procedure_table);
      this.symbolTable.define(procedure_symbol);

      // Declare new scope
      this.symbolTable = procedure_table;

      for (var param of node.params) {
        const param_type = this.symbolTable.lookup(param.type.val, true);
        const param_name = param.var.val;
        const varSymbol = new SymbolTable.VarSymbol(param_name, param_type);
        this.symbolTable.define(varSymbol);
        procedure_symbol.params.push(varSymbol);
      }

      const blockIsValid = this.visit_BLOCK(node.block);
      this.symbolTable = this.symbolTable.parentScope;
      return blockIsValid;
    } catch (e) {
      return false;
    }
  }

  visit_FUNCTION(node) {
    try {
      const function_table = new SymbolTable.SymbolTable(this.symbolTable);
      const function_type = this.symbolTable.lookup(node.returnType.val, true);
      const function_symbol = new SymbolTable.FunctionSymbol(node.name, node.block, function_type, function_table);
      this.symbolTable.define(function_symbol);

      this.symbolTable = function_table;

      for (var param of node.params) {
        const param_type = this.symbolTable.lookup(param.type.val, true);
        const param_name = param.var.val;
        const varSymbol = new SymbolTable.VarSymbol(param_name, param_type);
        this.symbolTable.define(varSymbol);
        function_symbol.params.push(varSymbol);
      }

      const blockIsValid = this.visit_BLOCK(node.block);
      this.symbolTable = this.symbolTable.parentScope;
      return blockIsValid;
    } catch (e) {
      return false;
    }
  }

  visit_PROCEDURECALL(node) {
    // Procedure needs to have been previously declared and be a procedure
    let procedureSymbol = this.symbolTable.lookup(node.name);
    let isValid = procedureSymbol && procedureSymbol instanceof SymbolTable.ProcedureSymbol;

    if (isValid) {
      // validate all params
      return node.params.reduce((valid, paramNode) => { return valid && this.visit(paramNode) }, true);
    } else {
      return false;
    }
  }

  visit_FUNCTIONCALL(node) {
    // Function needs to have been previously declared, be a function, and
    // have valid arguments

    let functionSymbol = this.symbolTable.lookup(node.name);
    let isValid = functionSymbol && functionSymbol instanceof SymbolTable.FunctionSymbol;
    if (isValid) {
      return node.params.reduce((valid, paramNode) => { return valid && this.visit(paramNode) }, true);
    } else {
      return false;
    }
  }

  visit_CONDITIONAL(node) {
    // If-then-else
    // Condition test should evaluate to boolean type and be valid
    // StatementIfTrue should be valid
    // StatementIfFalse should be valid
    if (this.visit(node.test) && this.visit(node.trueBlock) && (node.elseBlock !== undefined ? this.visit(node.elseBlock) : true)) {
      let testType = new TypeAnalyzer(this.symbolTable).visit(node.test);
      return testType === this.symbolTable.lookup(AST.NodeTypes.BOOLEAN, true).name;
    } else {
      return false;
    }
  }

  visit_WHILEDO(node) {
    if (this.visit(node.test) && this.visit(node.body)) {
      let testType = new TypeAnalyzer(this.symbolTable).visit(node.test);
      return testType === this.symbolTable.lookup(AST.NodeTypes.BOOLEAN, true).name;
    } else {
      return false;
    }
  }

  visit_REPEATUNTIL(node) {
    if (this.visit(node.test) && this.visit(node.body)) {
      let testType = new TypeAnalyzer(this.symbolTable).visit(node.test);
      return testType === this.symbolTable.lookup(AST.NodeTypes.BOOLEAN, true).name;
    } else {
      return false;
    }
  }

  visit_BLOCK(node) {
    let ret = true;

    for (var decl of node.declarations) {
      ret = ret && this.visit(decl);
    }

    ret = ret && this.visit(node.compoundStatement);
    return ret;
  }

  visit_VARDECL(node) {
    try {
      // Get type symbol
      const type_name = node.varType.val;
      const type_symbol = this.symbolTable.lookup(type_name, true);

      // Get var symbol
      const var_name = node.var.val;
      const var_symbol = new SymbolTable.VarSymbol(var_name, type_symbol);
      this.symbolTable.define(var_symbol);
      return true;
    } catch (e) {
      return false;
    }
  }

  visit_COMPOUND(node) {
    let ret = true;
    for (var stmt of node.children) {
      ret = ret && this.visit(stmt);
    }
    return ret;
  }

  visit_BINOP(node) {
    return this.visit(node.left) && this.visit(node.right);
  }

  visit_UNARYOP(node) {
    return this.visit(node.expr);
  }

  visit_INTEGER(node) {
    return true;
  }

  visit_REAL(node) {
    return true;
  }

  visit_BOOLEAN(node) {
    return true;
  }

  visit_NOOP(node) {
    return true;
  }

  visit_ASSIGN(node) {
    const var_name = node.left.val;
    const var_symbol = this.symbolTable.lookup(var_name, true);

    if (var_symbol === undefined) {
      console.log(`Unidentified symbol ${var_name} on assignment LHS`);
      this.symbolTable.dumpTable();
      return false;
    }

    const lhsType = var_symbol.type.name;
    const rhsType = new TypeAnalyzer(this.symbolTable).visit(node.right);

    // RHS has to be valid and types have to match
    return this.visit(node.right) && lhsType === rhsType;
  }

  visit_VAR(node) {
    const var_name = node.val;
    const var_symbol = this.symbolTable.lookup(var_name, true);
    if (var_symbol === undefined) {
      console.log(`Unidentified symbol ${var_name} for VAR`);
      this.symbolTable.dumpTable();
      return false;
    }

    return true;
  }
}
module.exports = SemanticAnalyzer;
