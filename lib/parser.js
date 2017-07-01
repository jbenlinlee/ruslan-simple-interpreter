let Lexer = require('./lexer.js');
let AST = require('./ast.js');

const OperatorsTerm = new Set([Lexer.TokenTypes.MULTIPLY, Lexer.TokenTypes.DIVIDE_INTEGER, Lexer.TokenTypes.DIVIDE_REAL]);
const OperatorsExpr = new Set([Lexer.TokenTypes.PLUS, Lexer.TokenTypes.MINUS]);

module.exports = class Parser {
  constructor(expr) {
    this.lexer = new Lexer.Lexer(expr);
    this.currentToken = undefined;
  }

  /* Gets next token if current token is of expected type */
  eat(expectedTokenType) {
    if (this.currentToken && this.currentToken.type.toUpperCase() == expectedTokenType) {
      this.currentToken = this.lexer.getNextToken();
      return true;
    } else {
      return false;
    }
  }

  /* Helper function to evaluate production rules of the form:
     rule: (subexpr|non-term1) ((op1|op2|...|opn) (subexpr|non-term1))*

     The nonterminalFunc should be a function that returns a Number
     or NaN if the current token doesn't start a valid non-terminal

     If we shouldn't accept sub expressions on either side, then
     pass acceptSubExpression = false.
  */
  binaryProduction(nonterminalFunc, validOperatorSet) {
    let tok = this.currentToken;
    let result = nonterminalFunc.call(this);

    if (result !== null) {
      while (this.currentToken && validOperatorSet.has(this.currentToken.type)) {
        let opTok = this.currentToken;
        this.eat(opTok.type); // Accept current type b/c we check in while

        let rhsTok = this.currentToken;
        let rhsNode = nonterminalFunc.call(this);
        if (rhsNode !== null) {
          result = new AST.BinOpNode(result, opTok, rhsNode);
        } else {
          result = null;
        }
      }
    } else {
      // Failed to evaluate LHS
      result = null;
    }

    return result;
  }

  /* Evaluates a factor and returns the value. If input cannot be evaluated
     as a valid factor, return NaN */
  factor() {
    let tok = this.currentToken;
    if (this.eat(Lexer.TokenTypes.INTEGER_CONST)) {
      return new AST.IntegerNode(tok.val, tok);
    } else if (this.eat(Lexer.TokenTypes.REAL_CONST)) {
      return new AST.RealNode(tok.val, tok);
    } else if (this.eat(Lexer.TokenTypes.SUBEXPR_START)) {
      let result = this.expr();
      if (!this.eat(Lexer.TokenTypes.SUBEXPR_END)) {
        console.log("Missing SUBEXPR_END");
      }

      return result;
    } else if (this.eat(Lexer.TokenTypes.PLUS) || this.eat(Lexer.TokenTypes.MINUS)) {
      const rhs = this.factor();
      if (rhs == null) {
        console.log("Invalid FACTOR after Unary Operator");
        return null;
      }
      return new AST.UnaryOpNode(tok, rhs);
    } else {
      return this.variable();
    }
  }

  /* Evaluates a term and returns the value. If input cannot be evaluated
     as a valid term, return NaN */
  term() {
    let result = this.binaryProduction(this.factor, OperatorsTerm);
    if (result == null) {
      console.log(`Error processing TERM: FACTOR ((MUL|DIV) FACTOR)*`);
    }

    return result;
  }

  /* Evaluates expression */
  expr() {
    let result = this.binaryProduction(this.term, OperatorsExpr);
    if (result == null) {
      console.log(`Error processing EXPR: TERM ((ADD|SUB) TERM)*`);
    }

    return result;
  }

  /* Evaluates a subexpression "(EXPR)" */
  subexpr() {
    if (this.eat(Lexer.TokenTypes.SUBEXPR_START)) {
      let result = this.expr();
      if (!this.eat(Lexer.TokenTypes.SUBEXPR_END)) {
        console.log(`SUBEXPR_START missing SUBEXPR_END`);
        return null;
      }

      return result;
    } else {
      console.log(`Error processing SUBEXPR: Expected "("`);
      return null;
    }
  }

  empty() {
    return new AST.NoopNode();
  }

  variable() {
    let tok = this.currentToken;
    if (this.eat(Lexer.TokenTypes.ID)) {
      return new AST.VarNode(tok);
    } else {
      return null;
    }
  }

  assignment_statement() {
    let lhs = this.variable();
    let opToken = this.currentToken;

    if (lhs !== null && this.eat(Lexer.TokenTypes.ASSIGN)) {
      let rhs = this.expr();
      if (rhs !== null) {
        return new AST.AssignmentNode(lhs, opToken, rhs);
      } else {
        return null;
      }
    } else {
      console.log(`Error processing ASSIGNMENT_STATEMENT: Expected VARIABLE or ASSIGN, got ${this.currentToken.type}`);
      return null;
    }
  }

  statement() {
    switch (this.currentToken.type) {
      case Lexer.TokenTypes.BEGIN:
        return this.compound_statement();
      case Lexer.TokenTypes.ID:
        return this.assignment_statement();
      default:
        return this.empty();
    }
  }

  statement_list() {
    let statements = [];
    let node = this.statement();

    if (node !== null) {
      statements.push(node);

      while (this.currentToken.type === Lexer.TokenTypes.SEMI) {
        this.eat(Lexer.TokenTypes.SEMI);
        let nextStatement = this.statement();
        if (nextStatement !== null) {
          statements.push(nextStatement);
        } else {
          return null;
        }
      }

      return statements;
    }
  }

  compound_statement() {
    let nodes = [];

    if (this.eat(Lexer.TokenTypes.BEGIN)) {
      nodes = this.statement_list();
      if (nodes === null) {
        return null;
      }
    } else {
      console.log(`Error processing COMPOUND: Expected BEGIN got ${this.currentToken.type}`);
      return null;
    }

    if (this.eat(Lexer.TokenTypes.END)) {
      let root = new AST.CompoundStatementNode();
      root.children = nodes;
      return root;
    } else {
      console.log(`Error processing COMPOUND: Expected END got ${this.currentToken.type}`);
      return null;
    }
  }

  type_spec() {
    let typeTok = this.currentToken;
    if (this.eat(Lexer.TokenTypes.TYPE_INTEGER) || this.eat(Lexer.TokenTypes.TYPE_REAL)) {
      return new AST.TypeNode(typeTok);
    } else {
      console.log(`Error processing TYPESPEC: Expecting TYPE_INTEGER or TYPE_REAL got ${this.currentToken.type}`);
      return null;
    }
  }

  pascal_declaration(declType) {
    /* Processes Pascal type declaration "lines" - A, B : INTEGER */
    let ids = [];
    let nextId = this.variable();

    while (nextId !== null) {
      ids.push(nextId);
      this.eat(Lexer.TokenTypes.COMMA);
      nextId = this.variable();
    }

    if (ids.length == 0) {
      return null;
    }

    this.eat(Lexer.TokenTypes.COLON);
    let typeDecl = this.type_spec();

    if (typeDecl !== null) {
      this.eat(Lexer.TokenTypes.SEMI);

      // Successfully got a type declaration, so we should be good to go
      let decls = [];
      for (let i = 0; i < ids.length; ++i) {
        decls.push(new (declType.bind(declType, ids[i], typeDecl))());
      }

      return decls;
    } else {
      console.log(`Error processing a variable/parameter declaration: Expected a type declaration got ${this.currentToken.type}`);
      return null;
    }

  }

  variable_declaration() {
    return this.pascal_declaration(AST.VarDeclNode);
  }

  parameter_declaration() {
    return this.pascal_declaration(AST.ParameterNode);
  }

  procedure_declaration() {
    let idToken = this.currentToken;
    if (this.eat(Lexer.TokenTypes.ID)) {
      let parameters = [];

      if (this.eat(Lexer.TokenTypes.SUBEXPR_START)) {
        // Read a parameter list
        let parameterDecls = this.parameter_declaration();
        while (parameterDecls !== null) {
          for (var decl of parameterDecls) {
            parameters.push(decl);
          }

          parameterDecls = this.parameter_declaration();
        }

        if (!this.eat(Lexer.TokenTypes.SUBEXPR_END)) {
          console.log(`Error processing PROCEDURE: Expected a ) at end of formal parameter list got ${this.currentToken.type}`);
          return null;
        }
      }

      if (this.eat(Lexer.TokenTypes.SEMI)) {
        // Got valid procedure start
        const procName = idToken.val;
        const procBlock = this.block();
        if (this.eat(Lexer.TokenTypes.SEMI)) {
          return new AST.ProcedureNode(procName, parameters, procBlock);
        } else {
          console.log(`Error processing PROCEDURE: Expected a semicolon got ${this.currentToken.type}`);
          return null;
        }
      }
    } else {
      console.log(`Error processing PROCEDURE: Expected a semicolon`);
      return null;
    }
  }

  declarations() {
    let decls = [];

    if (this.eat(Lexer.TokenTypes.VAR)) {
      let nextDecls = this.variable_declaration();
      while (nextDecls !== null) {
        for (var decl of nextDecls) {
          decls.push(decl);
        }

        nextDecls = this.variable_declaration();
      }
    }

    while (this.eat(Lexer.TokenTypes.PROCEDURE)) {
      let procDecl = this.procedure_declaration();
      if (procDecl !== null) {
        decls.push(procDecl);
      }
    }

    return decls;
  }

  block() {
    let declarations = this.declarations();
    let compound = this.compound_statement();

    return new AST.BlockNode(declarations, compound);
  }

  program() {
    /*
    PROGRAM myProgram;
    BEGIN
    ...
    END.
    */

    if (this.eat(Lexer.TokenTypes.PROGRAM)) {
      const nameTok = this.currentToken;

      if (this.eat(Lexer.TokenTypes.ID) && this.eat(Lexer.TokenTypes.SEMI)) {
        const programNode = new AST.ProgramNode(nameTok.val, this.block());
        return programNode;
      } else {
        console.log(`Error processing PROGRAM: Expected VAR got ${this.currentToken.type}`);
        return null;
      }
    }
  }

  _parseExpression() {
    // Advance to the first token
    this.currentToken = this.lexer.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    return this.expr();
  }

  _parseProgram() {
    this.currentToken = this.lexer.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    return this.program();
  }

  static parseExpression(stmt) {
    const parser = new Parser(stmt);
    return parser._parseExpression();
  }

  static parseProgram(pgm) {
    const parser = new Parser(pgm);
    return parser._parseProgram(pgm);
  }
}
