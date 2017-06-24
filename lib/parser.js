let Lexer = require('./lexer.js');
let AST = require('./ast.js');

const OperatorsTerm = new Map();
OperatorsTerm.set(Lexer.TokenTypes.MULTIPLY, (lhs,rhs) => { return lhs * rhs });
OperatorsTerm.set(Lexer.TokenTypes.DIVIDE, (lhs,rhs) => { return lhs / rhs });

const OperatorsExpr = new Map();
OperatorsExpr.set(Lexer.TokenTypes.PLUS, (lhs,rhs) => { return lhs + rhs });
OperatorsExpr.set(Lexer.TokenTypes.MINUS, (lhs,rhs) => { return lhs - rhs });

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
  binaryProduction(nonterminalFunc, operatorMap, acceptSubExpression) {
    let tok = this.currentToken;
    let result = nonterminalFunc.call(this);

    if (result !== null) {
      while (this.currentToken && operatorMap.has(this.currentToken.type)) {
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
    if (this.eat(Lexer.TokenTypes.INTEGER)) {
      return new AST.IntegerNode(tok.val, tok);
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
    let result = this.binaryProduction(this.factor, OperatorsTerm, true);
    if (result == null) {
      console.log(`Error processing TERM: FACTOR ((MUL|DIV) FACTOR)*`);
    }

    return result;
  }

  /* Evaluates expression */
  expr() {
    let result = this.binaryProduction(this.term, OperatorsExpr, false);
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

  program() {
    const node = this.compound_statement();
    if (this.eat(Lexer.TokenTypes.DOT)) {
      return node;
    } else {
      console.log("Missing DOT");
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
