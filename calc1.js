const Readline = require('readline');

const INTEGER = 'INTEGER';
const PLUS = 'PLUS';
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

    const currentChar = this.expr.charAt(this.pos);
    const parsedInt = Number.parseInt(currentChar);

    if (!Number.isNaN(parsedInt)) {
      this.pos++;
      return new Token(INTEGER, parsedInt);
    } else if (currentChar === '+') {
      this.pos++;
      return new Token(PLUS, currentChar);
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
      console.error(`Unexpected token: Expected ${expectedTokenType} got ${this.currentToken.type}`);
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
      return NaN;
    }

    // Process next token as plus operator
    const op = this.currentToken;
    if (!this.eat(PLUS)) {
      return NaN;
    }

    // Process next token as RHS
    const right = this.currentToken;
    if (!this.eat(INTEGER)) {
      return NaN;
    }

    return left.val + right.val;
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
