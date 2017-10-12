const shell = require('shelljs');
const path = require('path');

// console.log(shell.which('tsc'));
// process.exit(0);

const formatters = path.join(path.dirname(require.resolve('libkit')), 'lib', 'vscode');

shell.exec('/Users/pairing/Code/validations-dsl/node_modules/.bin/tsc -p tsconfig.json --noEmit > out.txt && cat out.txt');
shell.exec(`tslint -p . --formatters-dir ${formatters} --format tsc`);
