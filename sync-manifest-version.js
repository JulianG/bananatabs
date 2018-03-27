const fs = require('fs');
const exec = require('child_process');

const package = require('./package.json');
const manifest_file = './public/manifest.json';

const manifest_text = fs.readFileSync(manifest_file);
const manifest = JSON.parse(manifest_text);


manifest.version = package.version;

fs.writeFileSync(manifest_file, JSON.stringify(manifest, null, 2));
// if (err) return console.log(err);
console.log(`Updated ${manifest_file} with version ${package.version}`);

// must call shell script here to git add ./public/manifest.json

let child = exec(`git add ${manifest_file}`, (err, stdout, stderr) => {
	if (err == null) {
		console.log(stdout);
	} else {
		console.error(stderr);
	}
});
