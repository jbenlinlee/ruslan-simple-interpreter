const Readline = require('readline');

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MULTIPLY = 'MULTIPLY';
const DIVIDE = 'DIVIDE';
const SUBEXPR_START = '(';
const SUBEXPR_END = ')'
const EOF = 'EOF';

const OperatorsTerm = new Map();
OperatorsTerm.set(MULTIPLY, (lhs,rhs) => { return lhs * rhs });
OperatorsTerm.set(DIVIDE, (lhs,rhs) => { return lhs / rhs });

const OperatorsExpr = new Map();
OperatorsExpr.set(PLUS, (lhs,rhs) => { return lhs + rhs });
OperatorsExpr.set(MINUS, (lhs,rhs) => { return lhs - rhs });

const OperatorCharacterMap = new Map();
OperatorCharacterMap.set('+', PLUS);
OperatorCharacterMap.set('-', MINUS);
OperatorCharacterMap.set('*', MULTIPLY);
OperatorCharacterMap.set('/', DIVIDE);

const SubExprCharacterMap = new Map();
SubExprCharacterMap.set('(', SUBEXPR_START);
SubExprCharacterMap.set(')', SUBEXPR_END);

class Token {
  constructor(type, val) {
    this.type = type;
    this.val = val;
  }
}

class Lexer {
  constructor(expr) {
    this.expr = expr || "";
    this.pos = 0;
    this.currentCharacter = this.expr.charAt(this.pos);
    this.currentToken = undefined;
  }

  // Get next character
  advance() {
    this.pos++;
    if (this.pos < this.expr.length) {
      this.currentCharacter = this.expr.charAt(this.pos);
    } else {
      this.currentCharacter = undefined;
    }
  }

  // Scan to next non-whitespace
  skipWhitespace() {
    while (this.currentCharacter === ' ') {
      this.advance();
    }
  }

  // Scan in an entire integer
  scanInteger() {
    let finalInt = undefined;

    if (this.currentCharacter) {
      let parsedInt = Number.parseInt(this.currentCharacter);
      finalInt = 0;
      while (!Number.isNaN(parsedInt)) {
        finalInt = (finalInt * 10) + parsedInt;
        this.advance();
        parsedInt = Number.parseInt(this.currentCharacter);
      }
    }

    return finalInt;
  }

  getNextToken() {
    if (this.pos < this.expr.length) {
      // Skip any whitespace to get to the next non-whitespace char
      this.skipWhitespace();

      if (!Number.isNaN(Number.parseInt(this.currentCharacter))) {
        return new Token(INTEGER, this.scanInteger());
      } else if (OperatorCharacterMap.has(this.currentCharacter)) {
        let tok = new Token(OperatorCharacterMap.get(this.currentCharacter), this.currentCharacter);
        this.advance();
        return tok;
      } else if (SubExprCharacterMap.has(this.currentCharacter)) {
        let tok = new Token(SubExprCharacterMap.get(this.currentCharacter), this.currentCharacter);
        this.advance();
        return tok;
      } else {
        console.error(`Unexpected token at ${this.pos}: ${this.currentCharacter}`);
        return null;
      }
    } else {
      return new Token(EOF, null);
    }
  }

  getCurrentCharacter() {
    return this.currentCharacter;
  }
}

class Interpreter {
  constructor(expr) {
    this.lexer = new Lexer(expr);
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
  */
  binaryProduction(nonterminalFunc, operatorMap) {
    let tok = this.currentToken;
    let result = undefined;

    if (this.eat(SUBEXPR_START)) {
      result = this.expr();
      if (!this.eat(SUBEXPR_END)) {
        console.log(`Missing SUBEXPR_END`);
        return NaN;
      }
    } else {
      result = nonterminalFunc.call(this);
    }

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
      result = NaN;
    }

    return result;
  }

  /* Evaluates a factor and returns the value. If input cannot be evaluated
     as a valid factor, return NaN */
  factor() {
    let tok = this.currentToken;
    if (this.eat(INTEGER)) {
      return tok.val;
    } else {
      return NaN;
    }
  }

  /* Evaluates a term and returns the value. If input cannot be evaluated
     as a valid term, return NaN */
  term() {
    let result = this.binaryProduction(this.factor, OperatorsTerm);
    if (Number.isNaN(result)) {
      console.log(`Error processing TERM: FACTOR ((MUL|DIV) FACTOR)*`);
    }

    return result;
  }

  /* Evaluates expression */
  expr() {
    // Advance to the first token
    this.currentToken = this.lexer.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    let result = this.binaryProduction(this.term, OperatorsExpr);
    if (Number.isNaN(result)) {
      console.log(`Error processing EXPR: TERM ((ADD|SUB) TERM)*`);
    }

    return result;
  }

  /* Evaluates a subexpression "(EXPR)" */
  subexpr() {
    if (this.eat(SUBEXPR_START)) {
      return this.expr();
    } else {
      console.log(`Error processing SUBEXPR: Expected "("`);
      return NaN;
    }
  }
}

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  const interpreter = new Interpreter(input.trimRight());
  const result = interpreter.expr();
  console.log(`>>> ${result}`);
});
