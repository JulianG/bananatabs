const fs = require('fs');
const exec = require('child_process').exec;

const zip_path = './dist/bananatabs-v';
const manifest_file = './public/manifest.json';
const manifest_text = fs.readFileSync(manifest_file);
const manifest = JSON.parse(manifest_text);

const execLog = (err, stdout, stderr) => {
	if (err == null) {
		console.log(stdout);
	} else {
		console.error(stderr);
	}
};

console.log('building...');
exec('npm run-script build', (err, stdout, stderr) => {

	console.log('done!');
	if (err == null) {
		const zip_file = zip_path + manifest.version + '.zip';
		console.log('zipping...');
		exec(`zip ${zip_file} ./build `, execLog);
	} else {
		console.error(stderr);
	}

});