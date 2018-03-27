const fs = require('fs');
const exec = require('child_process').exec;

const zip_path = 'bananatabs-v';
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

	if (err == null) {
		console.log(stdout);
		const zip_file = zip_path + manifest.version + '.zip';
		const zip_cmd = `zip -r ${zip_file} ./build `;
		console.log('\n' + zip_cmd);
		exec(zip_cmd, execLog);
	} else {
		console.error(stderr);
	}

});