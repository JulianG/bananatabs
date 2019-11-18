const fs = require('fs');
const exec = require('child_process').exec;

const execLog = (err, stdout, stderr) => {
  if (err == null) {
    console.log(stdout);
  } else {
    console.error(stderr);
  }
};

console.log('building...');
exec('npm run-script build', (err, stdout, stderr) => {
  if (err == null) {
    console.log(stdout);
    const cmd = `cp -R ./build/ ../bananatabs-qa-build`;
    console.log('\n' + cmd);
    exec(cmd, execLog);
  } else {
    console.error(stderr);
  }
});
