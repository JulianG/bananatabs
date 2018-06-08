import * as React from 'react';

const Footer = ({ version }: { version: string }) => {
	return (
		<div className="credits">
			<p><strong>BananaTabs! v{version}</strong><br />
				Developed by Julian Garamendy.<br />
				Icons designed by Dave Gandy from&nbsp;
				<a href="https://www.flaticon.com/packs/font-awesome" target="_blank">FlatIcon</a>. -
				Banana icon by Freepik from&nbsp;
				<a href="https://www.flaticon.com/free-icon/banana_688828" target="_blank">FlatIcon</a>.</p>
		</div>
	);
};

export default Footer;