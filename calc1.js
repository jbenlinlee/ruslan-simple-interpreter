const Readline = require('readline');
const Interpreter = require('./lib/interpreter.js')

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  const result = Interpreter.evalStatement(input.trimRight());
  console.log(`>>> ${result}`);
});
