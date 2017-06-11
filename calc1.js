const Readline = require('readline');

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MULTIPLY = 'MULTIPLY';
const DIVIDE = 'DIVIDE';
const EOF = 'EOF';

const operators = new Set([PLUS,MINUS,MULTIPLY,DIVIDE]);

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
    while (this.pos < this.expr.length) {

      if (this.currentCharacter === ' ') {
        this.skipWhitespace();
      }

      if (!Number.isNaN(Number.parseInt(this.currentCharacter))) {
        return new Token(INTEGER, this.scanInteger());
      } else if (this.currentCharacter === '+') {
        this.advance();
        return new Token(PLUS, '+');
      } else if (this.currentCharacter === '-') {
        this.advance();
        return new Token(MINUS, '-');
      } else if (this.currentCharacter === '*') {
        this.advance();
        return new Token(MULTIPLY, '*');
      } else if (this.currentCharacter === '/') {
        this.advance();
        return new Token(DIVIDE, '/');
      } else {
        console.error(`Unexpected token at ${this.pos}: ${this.currentCharacter}`);
        return null;
      }
    }

    if (this.pos > this.expr.length - 1) {
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
    } else if (this.currentToken) {
      return false;
    } else {
      return false;
    }
  }

  /* Evaluates expression */
  eval() {
    let lastToken = undefined;

    // Advance to the first token
    this.currentToken = this.lexer.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    let result = undefined;

    // Read tokens until we reach EOF
    while (this.currentToken.type !== EOF) {
      const tok = this.currentToken;

      // If no last token processed then
      // expect and read an integer, otherwise eat an operator
      // and the following integer

      if (lastToken === undefined) {
        if (!this.eat(INTEGER)) {
          console.log(`Expected INTEGER got ${this.lexer.currentCharacter}`);
          return undefined;
        } else {
          result = tok.val;
        }
      } else {
        if (!this.eat(PLUS) && !this.eat(MINUS) && !this.eat(MULTIPLY) && !this.eat(DIVIDE)) {
          console.log(`Expected PLUS, MINUS, MULTIPLY, or DIVIDE got ${this.lexer.currentCharacter}`);
          return NaN;
        } else {
          let numTok = this.currentToken;
          if (this.eat(INTEGER)) {
            switch (tok.type) {
              case PLUS:
                result += numTok.val;
                break;
              case MINUS:
                result -= numTok.val;
                break;
              case MULTIPLY:
                result *= numTok.val;
                break;
              case DIVIDE:
                result /= numTok.val;
                break;
              default:
                return undefined;
            }
          } else {
            console.log(`Expected INTEGER got ${numTok.type}`);
            return undefined;
          }
        }
      }

      // Token is valid and in order
      lastToken = tok;
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
  const result = interpreter.eval();
  console.log(`>>> ${result}`);
});
