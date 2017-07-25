let Lexer = require('./lexer.js');
let AST = require('./ast.js');

const OperatorsBooleanExpr = new Set([Lexer.TokenTypes.LT, Lexer.TokenTypes.GT, Lexer.TokenTypes.EQ, Lexer.TokenTypes.LEQ, Lexer.TokenTypes.GEQ, Lexer.TokenTypes.NEQ]);
const OperatorsTerm = new Set([Lexer.TokenTypes.MULTIPLY, Lexer.TokenTypes.DIVIDE_INTEGER, Lexer.TokenTypes.DIVIDE_REAL, Lexer.TokenTypes.AND]);
const OperatorsExpr = new Set([Lexer.TokenTypes.PLUS, Lexer.TokenTypes.MINUS, Lexer.TokenTypes.OR]);

class ParserException {
  constructor(msg, tok, err) {
    this.message = msg;
    this.token = tok;
    this.err = err;
  }

  printStackTrace() {
    if (this.err) {
      this.err.printStackTrace();
    }

    console.log(this.message);
  }
}

module.exports = class Parser {
  constructor(expr) {
    this.lexer = new Lexer.Lexer(expr);
    this.currentToken = undefined;
  }

  /* Gets next token if current token is of expected type */
  eat(expectedTokenType) {
    try {
      if (this.currentToken && this.currentToken.type.toUpperCase() == expectedTokenType) {
        this.currentToken = this.lexer.getNextToken();
        return true;
      } else {
        let errMessage = `Expected ${expectedTokenType}: `;
        errMessage += this.currentToken ? `got ${this.currentToken.type}` : `No current token`;
        throw new ParserException(errMessage, this.currentToken);
      }
    } catch (e) {
      throw e
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

    while (this.currentToken && validOperatorSet.has(this.currentToken.type)) {
      let opTok = this.currentToken;
      this.eat(opTok.type); // Accept current type b/c we check in while

      let rhsTok = this.currentToken;
      let rhsNode = nonterminalFunc.call(this);
      result = new AST.BinOpNode(result, opTok, rhsNode);
    }

    return result;
  }

  /*
  factor : PLUS factor
         | MINUS factor
         | NOT factor
         | INTEGER_CONST
         | REAL_CONST
         | BOOLEAN_CONST
         | LPAREN boolean_expr RPAREN
         | function_call
         | variable
  */
  factor() {
    let startToken = this.currentToken;

    try {
      let tok = this.currentToken;
      let rhs = undefined;
      let result = undefined;

      switch (this.currentToken.type) {
        case Lexer.TokenTypes.INTEGER_CONST:
          this.eat(Lexer.TokenTypes.INTEGER_CONST);
          return new AST.IntegerNode(tok.val, tok);

        case Lexer.TokenTypes.REAL_CONST:
          this.eat(Lexer.TokenTypes.REAL_CONST);
          return new AST.RealNode(tok.val, tok);

        case Lexer.TokenTypes.BOOLEAN_CONST:
          this.eat(Lexer.TokenTypes.BOOLEAN_CONST);
          return new AST.BooleanNode(tok.val, tok);

        case Lexer.TokenTypes.NOT:
          this.eat(Lexer.TokenTypes.NOT);
          rhs = this.factor();
          return new AST.UnaryOpNode(tok, rhs);

        case Lexer.TokenTypes.LPAREN:
          this.eat(Lexer.TokenTypes.LPAREN);
          result = this.boolean_expr();
          this.eat(Lexer.TokenTypes.RPAREN);
          return result;

        case Lexer.TokenTypes.PLUS:
          this.eat(Lexer.TokenTypes.PLUS);
          rhs = this.factor();
          return new AST.UnaryOpNode(tok, rhs);

        case Lexer.TokenTypes.MINUS:
          this.eat(Lexer.TokenTypes.MINUS);
          rhs = this.factor();
          return new AST.UnaryOpNode(tok, rhs);

        case Lexer.TokenTypes.ID:
          this.eat(Lexer.TokenTypes.ID);
          if (this.currentToken.type === Lexer.TokenTypes.LPAREN) {
            return this.function_call(tok);
          } else {
            return this.variable(tok);
          }

        default:
          throw new ParserException('Invalid token for FACTOR', tok, e);
      }
    } catch(e) {
      throw new ParserException('Error processing FACTOR', startToken, e);
    }
  }

  /*
  term : factor ((MUL | INTEGER_DIV | FLOAT_DIV | AND) factor)*
  */
  term() {
    const startToken = this.currentToken;

    try {
      return this.binaryProduction(this.factor, OperatorsTerm);
    } catch (e) {
      throw new ParserException('Error processing TERM', startToken, e);
    }
  }

  /*
  expr : term ((ADD | SUB | OR) term)*
  */
  expr() {
    const startToken = this.currentToken;

    try {
      return this.binaryProduction(this.term, OperatorsExpr);
    } catch (e) {
      throw new ParserException('Error processing EXPR', startToken, e);
    }
  }

  /*
  boolean_expr : expr ((LT | GT | LEQ | GEQ | EQ | NEQ) expr)?
  */
  boolean_expr() {
    const startToken = this.currentToken;

    // boolean_expr : boolean_term ((AND | OR | XOR) boolean_term)*
    try {
      return this.binaryProduction(this.expr, OperatorsBooleanExpr);
    } catch (e) {
      throw new ParserException('Error processing BOOLEAN_EXPR', startToken, e);
    }
  }

  /* Evaluates a subexpression "(EXPR)" */
  /*
  subexpr() {
    let startToken = this.currentToken;

    try {
      this.eat(Lexer.TokenTypes.LPAREN);
      let result = this.expr();
      this.eat(Lexer.TokenTypes.RPAREN);

      return result;
    } catch (e) {
      throw new ParserException('Error processing SUBEXPR', startToken, e);
    }
  }
  */

  empty() {
    return new AST.NoopNode();
  }

  variable(idtok) {
    const startToken = this.currentToken;

    try {
      let tok = idtok;

      if (idtok === undefined) {
        tok = this.currentToken;
        this.eat(Lexer.TokenTypes.ID);
      }

      return new AST.VarNode(tok);
    } catch (e) {
      throw new ParserException('Error processing VARIABLE', startToken, e);
    }
  }

  /*
  assignment_statement : variable ASSIGN expr
  */
  assignment_statement(lhsToken) {
    const startToken = this.currentToken;

    try {
      let lhs = new AST.VarNode(lhsToken);
      let opToken = this.currentToken;
      this.eat(Lexer.TokenTypes.ASSIGN); // Assume that caller checks next token is ASSIGN
      let rhs = this.expr();
      return new AST.AssignmentNode(lhs, opToken, rhs);
    } catch (e) {
      throw new ParserException('Error processing ASSIGNMENT_STATMENT', startToken, e);
    }
  }

  /*
  procedure_declaration : PROCEDURE ID (LPAREN formal_parameter_declaration (SEMI formal_parameter_declaration)* RPAREN)? SEMI block SEMI
  */
  procedure_statement(idToken) {
    const startToken = this.currentToken;
    let params = [];

    if (this.currentToken.type === Lexer.TokenTypes.LPAREN) {
      this.eat(Lexer.TokenTypes.LPAREN);
      try {
        let nextExpr;
        do {
          try {
            nextExpr = this.expr();
            params.push(nextExpr);
            this.eat(Lexer.TokenTypes.COMMA);
          } catch (e) {
            nextExpr = null;
          }
        } while (nextExpr !== null);

        this.eat(Lexer.TokenTypes.RPAREN);
      } catch (e) {
        throw new ParserException('Error processing PROCEDURE_DECLARATION', startToken, e);
      }
    }

    return new AST.ProcedureCallNode(idToken.val, params);
  }

  /*
  function_call : function LPAREN ((expr (COMMA expr)*)? | empty) RPAREN
  */
  function_call(idToken) {
    const startToken = this.currentToken;
    let params = [];

    try {
      let nextExpr;
      this.eat(Lexer.TokenTypes.LPAREN);
      do {
        try {
          nextExpr = this.expr();
          params.push(nextExpr);
          this.eat(Lexer.TokenTypes.COMMA);
        } catch (e) {
          nextExpr = null;
        }
      } while (nextExpr !== null);

      this.eat(Lexer.TokenTypes.RPAREN);
    } catch (e) {
      throw new ParserException('Error processing FUNCTION_CALL', startToken, e);
    }

    return new AST.FunctionCallNode(idToken.val, params);
  }

  /*
  conditional_statement : IF boolean_expr THEN statement (ELSE statement)?
  */
  conditional_statement() {
    let testExpression, trueStatement, elseStatement;
    const startToken = this.currentToken;

    try {
      this.eat(Lexer.TokenTypes.IF);
      testExpression = this.boolean_expr();
      this.eat(Lexer.TokenTypes.THEN)
      trueStatement = this.statement();

      if (this.currentToken.type === Lexer.TokenTypes.ELSE) {
        this.eat(Lexer.TokenTypes.ELSE);
        elseStatement = this.statement();
      }

      return new AST.ConditionalNode(testExpression, trueStatement, elseStatement);
    } catch (e) {
      throw new ParserException('Error processing CONDITIONAL_STATEMENT', startToken, e);
    }
  }

  /*
  while_statement : WHILE boolean_expr DO statement
  */
  whiledo_statement() {
    const startToken = this.currentToken;
    let testExpression, loopStatement;

    try {
      this.eat(Lexer.TokenTypes.WHILE);
      testExpression = this.boolean_expr();

      this.eat(Lexer.TokenTypes.DO);
      loopStatement = this.statement();

      return new AST.WhileDoNode(testExpression, loopStatement);
    } catch (e) {
      throw new ParserException('Error processing WHILEDO_STATEMENT', startToken, e);
    }
  }

  /*
  repeat_statement : REPEAT statement UNTIL boolean_expr
  */
  repeatuntil_statement() {
    const startToken = this.currentToken;
    let testExpression, loopStatement;

    try {
      this.eat(Lexer.TokenTypes.REPEAT);
      loopStatement = this.statement();

      this.eat(Lexer.TokenTypes.UNTIL);
      testExpression = this.boolean_expr();

      return new AST.RepeatUntilNode(testExpression, loopStatement);
    } catch (e) {
      throw new ParserException('Error processing REPEATUNTIL_STATEMENT', startToken, e);
    }
  }

  /*
  statement : compound_statement
            | assignment_statement
            | procedure_call
            | conditional_statement
            | while_statement
            | repeat_statement
            | empty
  */
  statement() {
    const startToken = this.currentToken;

    try {
      switch (this.currentToken.type) {
        case Lexer.TokenTypes.BEGIN:
          return this.compound_statement();
        case Lexer.TokenTypes.IF:
          return this.conditional_statement();
        case Lexer.TokenTypes.WHILE:
          return this.whiledo_statement();
        case Lexer.TokenTypes.REPEAT:
          return this.repeatuntil_statement();
        case Lexer.TokenTypes.ID:
          // Statement starting with an ID could be either an assignment or a
          // procedure call. Need to determine by reading the _next_ token.

          let idToken = this.currentToken;
          this.eat(Lexer.TokenTypes.ID);

          if (this.currentToken.type === Lexer.TokenTypes.ASSIGN) {
            return this.assignment_statement(idToken);
          } else {
            return this.procedure_statement(idToken);
          }
        default:
          return this.empty();
      }
    } catch (e) {
      throw new ParserException('Error processing STATEMENT', startToken, e);
    }
  }

  /*
  statement_list : statement
                 | statement SEMI statement_list
  */
  statement_list() {
    const startToken = this.currentToken;

    try {
      let statements = [];
      let node = this.statement();
      statements.push(node);

      while (this.currentToken.type === Lexer.TokenTypes.SEMI) {
        this.eat(Lexer.TokenTypes.SEMI);
        statements.push(this.statement());
      }

      return statements;
    } catch (e) {
      return new ParserException('Error processing STATEMENT_LIST', startToken, e);
    }
  }

  /*
  compound_statement : BEGIN statement_list END
  */
  compound_statement() {
    const startToken = this.currentToken;
    let nodes = [];

    try {
      this.eat(Lexer.TokenTypes.BEGIN);
      nodes = this.statement_list();

      this.eat(Lexer.TokenTypes.END);
      let root = new AST.CompoundStatementNode();
      root.children = nodes;
      return root;
    } catch (e) {
      return new ParserException('Error processing COMPOUND_STATEMENT', startToken, e);
    }
  }

  /*
  type_spec : INTEGER | REAL | BOOLEAN
  */
  type_spec() {
    const startToken = this.currentToken;

    let typeTok = this.currentToken;
    if (typeTok.type === Lexer.TokenTypes.TYPE_INTEGER || typeTok.type === Lexer.TokenTypes.TYPE_REAL || typeTok.type === Lexer.TokenTypes.TYPE_BOOLEAN) {
      this.eat(typeTok.type);
      return new AST.TypeNode(typeTok);
    } else {
      throw new ParserException(`Error processing TYPESPEC: Expecting TYPE_INTEGER, TYPE_REAL, or TYPE_BOOLEAN got ${typeTok.type}`, startToken);
    }
  }

  pascal_declaration(declType) {
    /* Processes one or more Pascal type declaration "lines" - A, B : INTEGER */

    let ids = [];
    let nextId;

    do {
      try {
        nextId = this.variable();
        ids.push(nextId);
        this.eat(Lexer.TokenTypes.COMMA);
      } catch (e) {
        nextId = null;
      }
    } while (nextId !== null);

    this.eat(Lexer.TokenTypes.COLON);
    let typeDecl = this.type_spec();

    if (this.currentToken.type === Lexer.TokenTypes.SEMI) {
      this.eat(Lexer.TokenTypes.SEMI);
    }

    // Successfully got a type declaration, so we should be good to go
    let decls = [];
    for (let i = 0; i < ids.length; ++i) {
      decls.push(new (declType.bind(declType, ids[i], typeDecl))());
    }

    return decls;
  }

  /*
  variable_declaration : ID (COMMA ID)* COLON type_spec
  */
  variable_declaration() {
    const startToken = this.currentToken;

    try {
      return this.pascal_declaration(AST.VarDeclNode);
    } catch (e) {
      throw new ParserException('Error processing VARIABLE_DECLARATION', startToken, e);
    }
  }

  /*
  returns parameter nodes when processing parameter lists
  */
  parameter_declaration() {
    const startToken = this.currentToken;

    try {
      return this.pascal_declaration(AST.ParameterNode);
    } catch (e) {
      throw new ParserException('Error processing PARAMETER_DECLARATION', startToken, e);
    }
  }

  /*
  formal_parameter_declaration : variable_declaration
  */
  formal_parameter_declaration() {
    const startToken = this.currentToken;

    let parameters = [];
    if (this.currentToken.type === Lexer.TokenTypes.LPAREN) {
      this.eat(Lexer.TokenTypes.LPAREN);
      try {
        let parameterDecls;
        do {
          try {
            parameterDecls = this.parameter_declaration();
            for (var decl of parameterDecls) {
              parameters.push(decl);
            }
          } catch (e) {
            parameterDecls = null;
          }
        } while (parameterDecls !== null);

        this.eat(Lexer.TokenTypes.RPAREN);
      } catch (e) {
        throw new ParserException('Error processing formal parameter declaration', startToken, e);
      }
    }

    return parameters;
  }

  /*
  procedure_declaration : PROCEDURE ID (LPAREN formal_parameter_declaration (SEMI formal_parameter_declaration)* RPAREN)? SEMI block SEMI
  */
  procedure_declaration() {
    const startToken = this.currentToken;

    try {
      let idToken = this.currentToken;
      this.eat(Lexer.TokenTypes.ID);
      let parameters = this.formal_parameter_declaration();

      this.eat(Lexer.TokenTypes.SEMI);
      const procName = idToken.val;
      const procBlock = this.block();

      this.eat(Lexer.TokenTypes.SEMI);
      return new AST.ProcedureNode(procName, parameters, procBlock);
    } catch (e) {
      throw new ParserException('Error processing PROCEDURE_DECLARATION', startToken, e);
    }
  }

  /*
  function_declaration : FUNCTION ID (LPAREN formal_parameter_declaration (SEMI formal_parameter_declaration)* RPAREN)? COLON type_spec SEMI block SEMI
  */
  function_declaration() {
    const startToken = this.currentToken;

    try {
      let idToken = this.currentToken;
      this.eat(Lexer.TokenTypes.ID);
      let parameters = this.formal_parameter_declaration();

      this.eat(Lexer.TokenTypes.COLON);
      let typeSpec = this.type_spec();

      this.eat(Lexer.TokenTypes.SEMI);
      let block = this.block();

      this.eat(Lexer.TokenTypes.SEMI);
      return new AST.FunctionNode(idToken.val, parameters, typeSpec, block);
    } catch (e) {
      throw new ParserException('Error processing FUNCTION_DECLARATION', startToken, e);
    }
  }

  /*
  declarations : (VAR (variable_declaration SEMI)+)* (procedure_declaration | function_declaration)*
               | empty
  */
  declarations() {
    const startToken = this.currentToken;

    try {
      let decls = [];

      if (this.currentToken.type === Lexer.TokenTypes.VAR) {
        this.eat(Lexer.TokenTypes.VAR);
        let nextDecls;
        do {
          try {
            nextDecls = this.variable_declaration();
            for (var decl of nextDecls) {
              decls.push(decl);
            }
          } catch (e) {
            nextDecls = null;
          }
        } while (nextDecls !== null);
      }

      while (this.currentToken.type === Lexer.TokenTypes.PROCEDURE || this.currentToken.type === Lexer.TokenTypes.FUNCTION) {
        switch (this.currentToken.type) {
          case Lexer.TokenTypes.PROCEDURE:
            this.eat(Lexer.TokenTypes.PROCEDURE);
            decls.push(this.procedure_declaration());
            break;
          case Lexer.TokenTypes.FUNCTION:
            this.eat(Lexer.TokenTypes.FUNCTION);
            decls.push(this.function_declaration());
            break;
        }
      }

      return decls;
    } catch (e) {
      throw new ParserException('Error processing DECLARATIONS', startToken, e);
    }
  }

  /*
  block : declarations compound_statement
  */
  block() {
    const startToken = this.curr;

    let declarations = this.declarations();
    let compound = this.compound_statement();
    return new AST.BlockNode(declarations, compound);
  }

  /*
  program : variable SEMI block DOT
  */
  program() {
    /*
    PROGRAM myProgram;
    BEGIN
    ...
    END.
    */

    this.eat(Lexer.TokenTypes.PROGRAM);
    const nameTok = this.currentToken;

    this.eat(Lexer.TokenTypes.ID);
    this.eat(Lexer.TokenTypes.SEMI);
    return new AST.ProgramNode(nameTok.val, this.block())
  }

  _parseBooleanExpression() {
    this.currentToken = this.lexer.getNextToken();
    if (this.currentToken == null) {
      return undefined;
    }

    return this.boolean_expr();
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

  static parseBooleanExpression(stmt) {
    try {
      const parser = new Parser(stmt);
      return parser._parseBooleanExpression();
    } catch (e) {
      e.printStackTrace();
    }
  }

  static parseExpression(stmt) {
    try {
      const parser = new Parser(stmt);
      return parser._parseExpression();
    } catch (e) {
      e.printStackTrace();
    }
  }

  static parseProgram(pgm) {
    try {
      const parser = new Parser(pgm);
      return parser._parseProgram(pgm);
    } catch (e) {
      e.printStackTrace();
    }
  }
}
