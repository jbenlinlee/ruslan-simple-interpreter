const Readline = require('readline');
const Interpreter = require('./interpreter.js')

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  const result = Interpreter.eval(input.trimRight());
  console.log(`>>> ${result}`);
});
