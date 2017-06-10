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
    this.currentToken = undefined;
  }

  getNextToken() {
    if (this.pos > this.expr.length - 1) {
      return new Token(EOF, null);
    }

    // Scan to next non-whitespace charAt
    while (this.expr.charAt(this.pos) === ' ') {
      this.pos++;
    }

    const currentChar = this.expr.charAt(this.pos);
    let parsedInt = Number.parseInt(currentChar);

    if (!Number.isNaN(parsedInt)) {
      let finalInt = 0;

      // If we got a number, consume all chars until we get a non-number,
      // storing the final integer in finalInt;
      while (!Number.isNaN(parsedInt)) {
        finalInt = (finalInt * 10) + parsedInt;
        this.pos++;
        parsedInt = Number.parseInt(this.expr.charAt(this.pos));
      }

      return new Token(INTEGER, finalInt);
    } else if (currentChar === '+') {
      this.pos++;
      return new Token(PLUS, currentChar);
    } else if (currentChar === '-') {
      this.pos++;
      return new Token(MINUS, currentChar);
    } else {
      console.error(`Unexpected token at ${this.pos}: ${currentChar}`);
      return null;
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
