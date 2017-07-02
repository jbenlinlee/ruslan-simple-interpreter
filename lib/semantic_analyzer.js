const SymbolTable = require('./symtable.js');
const AST = require('./ast.js');

class SemanticAnalyzer {
  constructor() {
    this.rootScope = new SymbolTable.SymbolTable();
    this.globalScope = new SymbolTable.SymbolTable(this.rootScope);
    this.symbolTable = this.rootScope;
  }

  visit(node) {
    const visitor = this[`visit_${node.type}`];
    return visitor.call(this, node);
  }

  visit_PROGRAM(node) {
    // Define builtins at the root scope
    this.rootScope.define(new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.INTEGER));
    this.rootScope.define(new SymbolTable.BuiltinTypeSymbol(AST.NodeTypes.REAL));
    
    this.symbolTable = this.globalScope;
    return this.visit(node.block);
  }

  visit_PROCEDURE(node) {
    const procedure_symbol = new SymbolTable.ProcedureSymbol(node.name, []);
    this.symbolTable.define(procedure_symbol);

    // Declare new scope
    this.symbolTable = new SymbolTable.SymbolTable(this.symbolTable);

    for (var param of node.params) {
      const param_type = this.symbolTable.lookup(param.type.val);
      const param_name = param.var.val;
      const varSymbol = new SymbolTable.VarSymbol(param_name, param_type);
      this.symbolTable.define(varSymbol);
      procedure_symbol.params.push(varSymbol);
    }

    const blockIsValid = this.visit_BLOCK(node.block);
    this.symbolTable = this.symbolTable.parentScope;
    return blockIsValid;
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
    // Get type symbol
    const type_name = node.varType.val;
    const type_symbol = this.symbolTable.lookup(type_name);

    // Get var symbol
    const var_name = node.var.val;
    if (this.symbolTable.lookup(var_name, false) === undefined) {
      const var_symbol = new SymbolTable.VarSymbol(var_name, type_symbol);
      this.symbolTable.define(var_symbol);
      return true;
    } else {
      console.log(`Symbol ${var_name} defined twice`);
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

  visit_NOOP(node) {
    return true;
  }

  visit_ASSIGN(node) {
    const var_name = node.left.val;
    const var_symbol = this.symbolTable.lookup(var_name);
    if (var_symbol === undefined) {
      console.log(`Unidentified symbol ${var_name}`);
      return false;
    }

    return this.visit(node.right);
  }

  visit_VAR(node) {
    const var_name = node.val;
    const var_symbol = this.symbolTable.lookup(var_name, true);
    if (var_symbol === undefined) {
      console.log(`Unidentified symbol ${var_name}`);
      return false;
    }

    return true;
  }
}
module.exports = SemanticAnalyzer;
