const Lexer = require('./lexer.js');

const OperatorsTerm = new Map();
OperatorsTerm.set(Lexer.MULTIPLY, (lhs,rhs) => { return lhs * rhs });
OperatorsTerm.set(Lexer.DIVIDE, (lhs,rhs) => { return lhs / rhs });

const OperatorsExpr = new Map();
OperatorsExpr.set(Lexer.PLUS, (lhs,rhs) => { return lhs + rhs });
OperatorsExpr.set(Lexer.MINUS, (lhs,rhs) => { return lhs - rhs });

module.exports = class Interpreter {
  constructor(expr) {
    this.lexer = new Lexer.Lexer(expr);
    this.currentToken = undefined;
  }

  /* Gets next token if current token is of expected type */
  eat(expectedTokenType) {
    if (this.currentToken && this.currentToken.type == expectedTokenType) {
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

    if (!Number.isNaN(result)) {
      while (this.currentToken && operatorMap.has(this.currentToken.type)) {
        let opTok = this.currentToken;
        this.eat(opTok.type); // Accept current type b/c we check in while

        let rhsTok = this.currentToken;
        let rhsNum = nonterminalFunc.call(this);
        if (!Number.isNaN(rhsNum)) {
          result = operatorMap.get(opTok.type)(result, rhsNum);
        } else {
          result = NaN;
        }
      }
    } else {
      // Failed to evaluate LHS
      result = NaN;
    }

    return result;
  }

  /* Evaluates a factor and returns the value. If input cannot be evaluated
     as a valid factor, return NaN */
  factor() {
    let tok = this.currentToken;
    if (this.eat(Lexer.INTEGER)) {
      return tok.val;
    } else if (this.eat(Lexer.SUBEXPR_START)) {
      let result = this.expr();
      if (!this.eat(Lexer.SUBEXPR_END)) {
        console.log("Missing SUBEXPR_END");
      }

      return result;
    } else {
      return NaN;
    }
  }

  /* Evaluates a term and returns the value. If input cannot be evaluated
     as a valid term, return NaN */
  term() {
    let result = this.binaryProduction(this.factor, OperatorsTerm, true);
    if (Number.isNaN(result)) {
      console.log(`Error processing TERM: FACTOR ((MUL|DIV) FACTOR)*`);
    }

    return result;
  }

  /* Evaluates expression */
  expr() {
    let result = this.binaryProduction(this.term, OperatorsExpr, false);
    if (Number.isNaN(result)) {
      console.log(`Error processing EXPR: TERM ((ADD|SUB) TERM)*`);
    }

    return result;
  }

  /* Evaluates a subexpression "(EXPR)" */
  subexpr() {
    if (this.eat(Lexer.SUBEXPR_START)) {
      let result = this.expr();
      if (!this.eat(Lexer.SUBEXPR_END)) {
        console.log(`SUBEXPR_START missing SUBEXPR_END`);
        return NaN;
      }

      return result;
    } else {
      console.log(`Error processing SUBEXPR: Expected "("`);
      return NaN;
    }
  }

  eval() {
    // Advance to the first token
    this.currentToken = this.lexer.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    return this.expr();
  }
}
