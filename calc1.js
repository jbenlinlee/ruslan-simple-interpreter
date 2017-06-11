const Readline = require('readline');

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MULTIPLY = 'MULTIPLY';
const DIVIDE = 'DIVIDE';
const EOF = 'EOF';

const Operators = new Set([PLUS,MINUS,MULTIPLY,DIVIDE]);
const OperatorsTerm = new Set([MULTIPLY,DIVIDE]);
const OperatorsExpr = new Set([PLUS,MINUS]);

const OperatorCharacterMap = new Map();
OperatorCharacterMap.set('+', PLUS);
OperatorCharacterMap.set('-', MINUS);
OperatorCharacterMap.set('*', MULTIPLY);
OperatorCharacterMap.set('/', DIVIDE);

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
    let tok = this.currentToken;
    let result = this.factor();
    if (!Number.isNaN(result)) {
      while (this.currentToken && OperatorsTerm.has(this.currentToken.type)) {
        let opTok = this.currentToken;
        this.eat(opTok.type);

        let rhsTok = this.currentToken;
        let rhsNum = this.factor();
        if (!Number.isNaN(rhsNum)) {
          switch(opTok.type) {
            case MULTIPLY:
              result *= rhsNum;
              break;
            case DIVIDE:
              result /= rhsNum;
              break;
          }
        } else {
          console.log(`Expected FACTOR to follow ${opTok.type}, got ${rhsTok.type}`);
        }
      }
    } else {
      console.log(`Expected TERM to start with FACTOR, got ${tok.type}`);
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

    // Any expression needs to start with a term
    let result = this.term();
    if (Number.isNaN(result)) {
      const currentChar = this.lexer.getCurrentCharacter();
      console.log(`Expected expression to start with TERM`);
      return undefined;
    }

    // Read tokens until we reach EOF
    while (this.currentToken && OperatorsExpr.has(this.currentToken.type)) {
      const opTok = this.currentToken;
      this.eat(opTok.type); // Accept any operator that is in valid op set

      let rhsTok = this.currentToken;
      let num = this.term();
      if (!Number.isNaN(num)) {
        switch (opTok.type) {
          case PLUS:
            result += num;
            break;
          case MINUS:
            result -= num;
            break;
        }
      } else {
        console.log(`Expected TERM to follow operator ${opTok.type}, got ${rhsTok.type}`);
        return undefined;
      }
    }

    return result;
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
