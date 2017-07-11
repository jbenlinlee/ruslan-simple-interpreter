NodeTypes = {
  PROGRAM: 'PROGRAM',
  PROCEDURE: 'PROCEDURE',
  PROCEDURECALL: 'PROCEDURECALL',
  PARAMETER: 'PARAMETER',
  BLOCK: 'BLOCK',
  BINOP: 'BINOP',
  UNARYOP: 'UNARYOP',
  INTEGER: 'INTEGER',
  REAL: 'REAL',
  BOOLEAN: 'BOOLEAN',
  COMPOUND: 'COMPOUND',
  ASSIGN: 'ASSIGN',
  VAR: 'VAR',
  VARDECL: 'VARDECL',
  TYPEDECL: 'TYPEDECL',
  NOOP: 'NOOP'
}

module.exports.NodeTypes = NodeTypes;

module.exports.BinOpNode = class BinOpNode {
  /* left and right should be other AST nodes.
     op should be a binary operator token */
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = NodeTypes.BINOP;
  }
};

module.exports.UnaryOpNode = class UnaryOpNode {
    /* op should be a unary operator, and expr should be another AST node */
    constructor(op, expr) {
      this.op = op;
      this.expr = expr
      this.type = NodeTypes.UNARYOP;
    }
};

module.exports.IntegerNode = class IntegerNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
    this.type = NodeTypes.INTEGER;
  }
};

module.exports.RealNode = class RealNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
    this.type = NodeTypes.REAL;
  }
};

module.exports.BooleanNode = class BooleanNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
    this.type = NodeTypes.BOOLEAN;
  }
}

module.exports.CompoundStatementNode = class CompoundStatementNode {
  constructor() {
    this.children = [];
    this.type = NodeTypes.COMPOUND;
  }
};

module.exports.AssignmentNode = class AssignmentNode {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = NodeTypes.ASSIGN;
  }
};

module.exports.VarNode = class VarNode {
  constructor(token) {
    this.token = token;
    this.val = token.val;
    this.type = NodeTypes.VAR;
  }
};

module.exports.TypeNode = class TypeNode {
  constructor(tok) {
    this.type = NodeTypes.TYPEDECL;
    this.tok = tok;
    this.val = tok.val;
  }
};

module.exports.VarDeclNode = class VarDeclNode {
  constructor(varNode, varType) {
    this.type = NodeTypes.VARDECL;
    this.var = varNode;
    this.varType = varType;
  }
};

module.exports.NoopNode = class NoopNode {
  constructor() {
    this.type = NodeTypes.NOOP;
  }
};

module.exports.ProgramNode = class ProgramNode {
  constructor(name, block) {
    this.type = NodeTypes.PROGRAM;
    this.name = name;
    this.block = block;
  }
};

module.exports.BlockNode = class BlockNode {
  constructor(declarations, compoundStatement) {
    this.type = NodeTypes.BLOCK;
    this.declarations = declarations;
    this.compoundStatement = compoundStatement;
  }
}

module.exports.ProcedureNode = class ProcedureNode {
  constructor(name, params, block) {
    this.type = NodeTypes.PROCEDURE;
    this.name = name;
    this.params = params;
    this.block = block;
  }
}

module.exports.ProcedureCallNode = class ProcedureCallNode {
  constructor(name, params) {
    this.type = NodeTypes.PROCEDURECALL;
    this.name = name;
    this.params = params;
  }
}

module.exports.ParameterNode = class ParameterNode {
  constructor(varNode, typeNode) {
    this.type = NodeTypes.PARAMETER;
    this.var = varNode;
    this.type = typeNode;
  }
}
