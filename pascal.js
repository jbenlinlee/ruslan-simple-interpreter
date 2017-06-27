const Interpreter = require('./lib/interpreter.js');
const Process = require('process');
const FS = require('fs');

function readProgram(fn) {
  return FS.readFileSync(fn, {encoding:'utf8', flag:'r'});
}

const fn = Process.argv[2];
const pgm = readProgram(fn);
const finalScope = Interpreter.evalProgram(pgm);

console.log(JSON.stringify(finalScope, null, 2));
