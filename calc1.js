const Readline = require('readline');

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
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
    // Get the next token
    this.currentToken = this.getNextToken();
    if (this.currentToken == null) {
      return NaN;
    }

    // Process the token as LHS (if valid number token)
    const left = this.currentToken;
    if (!this.eat(INTEGER)) {
      console.log(`Expected INTEGER got ${this.expr.charAt(this.pos)}`);
      return NaN;
    }

    // Process next token as plus operator
    const op = this.currentToken;
    if (!this.eat(PLUS) && !this.eat(MINUS)) {
      console.log(`Expected PLUS or MINUS got ${this.expr.charAt(this.pos)}`);
      return NaN;
    }

    // Process next token as RHS
    const right = this.currentToken;
    if (!this.eat(INTEGER)) {
      console.log(`Expected INTEGER got ${this.expr.charAt(this.pos)}`);
      return NaN;
    }

    if (op.type === PLUS) {
      return left.val + right.val;
    } else if (op.type === MINUS) {
      return left.val - right.val;
    }
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
