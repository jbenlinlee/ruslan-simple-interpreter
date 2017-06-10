const Readline = require('readline');

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MULTIPLY = 'MULTIPLY';
const DIVIDE = 'DIVIDE';
const EOF = 'EOF';

class Token {
  constructor(type, val) {
    this.type = type;
    this.val = val;
  }
}

class Interpreter {
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

  /* Gets next token if current token is of expected type */
  eat(expectedTokenType) {
    if (this.currentToken && this.currentToken.type == expectedTokenType) {
      this.currentToken = this.getNextToken();
      return true;
    } else if (this.currentToken) {
      return false;
    } else {
      return false;
    }
  }

  /* Evaluates expression */
  eval() {
    let parsedOps = [];
    let lastToken = undefined;

    // Get the next token
    this.currentToken = this.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    // Read tokens until we reach EOF
    while (this.currentToken.type !== EOF) {
      const tok = this.currentToken;

      // If no last token processed or last token was an operator, then
      // expect and read an integer, otherwise expect and eat an operator
      if (lastToken === undefined || lastToken.type === PLUS || lastToken.type === MINUS || lastToken.type === MULTIPLY || lastToken.type === DIVIDE) {
        if (!this.eat(INTEGER)) {
          console.log(`Expected INTEGER got ${this.expr.charAt(this.pos)}`);
          return NaN;
        }
      } else {
        if (!this.eat(PLUS) && !this.eat(MINUS) && !this.eat(MULTIPLY) && !this.eat(DIVIDE)) {
          console.log(`Expected PLUS, MINUS, MULTIPLY, or DIVIDE got ${this.expr.charAt(this.pos)}`);
          return NaN;
        }
      }

      // Token is valid and in order
      lastToken = tok;
      parsedOps.push(tok);
    }

    let accum = parsedOps[0].val; // First value is number
    let op = undefined;
    let right = undefined;

    for (let i = 1; i < parsedOps.length; i += 2) {
      op = parsedOps[i];
      right = parsedOps[i + 1];

      if (right === undefined) {
        console.log(`Missing INTEGER at end of expression`);
        return undefined;
      }

      switch (op.type) {
        case PLUS:
          accum += right.val;
          break;
        case MINUS:
          accum -= right.val;
          break;
        case MULTIPLY:
          accum *= right.val;
          break;
        case DIVIDE:
          accum /= right.val;
          break;
        default:
          return undefined;
      }
    }

    return accum;
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
