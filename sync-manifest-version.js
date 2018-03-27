const fs = require('fs');
const package = require('./package.json');
const manifest_file = './public/manifest.json';

const manifest_text = fs.readFileSync(manifest_file);
const manifest = JSON.parse(manifest_text);


manifest.version = package.version;

fs.writeFile(manifest_file, JSON.stringify(manifest, null, 2), function (err) {
	if (err) return console.log(err);
	console.log(`Updated ${manifest_file} with version ${package.version}`);
  });