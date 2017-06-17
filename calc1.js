const Readline = require('readline');
const Interpreter = require('./interpreter.js')

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  const interpreter = new Interpreter(input.trimRight());
  const result = interpreter.eval();
  console.log(`>>> ${result}`);
});
