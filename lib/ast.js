const BINOP = 'BINOP';
const UNARYOP = 'UNARYOP';
const INTEGER = 'INTEGER';
const COMPOUND = 'COMPOUND';
const ASSIGN = 'ASSIGN';
const VAR = 'VAR';
const NOOP = 'NOOP';

NodeTypes = {
  PROGRAM: 'PROGRAM',
  BLOCK: 'BLOCK',
  BINOP: BINOP,
  UNARYOP: UNARYOP,
  INTEGER: INTEGER,
  COMPOUND: COMPOUND,
  ASSIGN: ASSIGN,
  VAR: VAR,
  VARDECL: 'VARDECL',
  TYPEDECL: 'TYPEDECL',
  NOOP: NOOP
}

module.exports.NodeTypes = NodeTypes;

module.exports.BinOpNode = class BinOpNode {
  /* left and right should be other AST nodes.
     op should be a binary operator token */
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = BINOP;
  }
};

module.exports.UnaryOpNode = class UnaryOpNode {
    /* op should be a unary operator, and expr should be another AST node */
    constructor(op, expr) {
      this.op = op;
      this.expr = expr
      this.type = UNARYOP;
    }
};

module.exports.IntegerNode = class IntegerNode {
  constructor(val, op) {
    this.val = val;
    this.op = op;
    this.type = INTEGER;
  }
};

module.exports.CompoundStatementNode = class CompoundStatementNode {
  constructor() {
    this.children = [];
    this.type = COMPOUND;
  }
};

module.exports.AssignmentNode = class AssignmentNode {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = ASSIGN;
  }
};

module.exports.VarNode = class VarNode {
  constructor(token) {
    this.token = token;
    this.val = token.val;
    this.type = VAR;
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
    this.type = NOOP;
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
