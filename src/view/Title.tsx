import * as React from 'react';

const Title = ({ onClick }: { onClick(): void }) => {
	return (
		<h3>
			<img
				className="app-icon"
				src="/icons/app-icon.png"
				onClick={onClick}
			/>
			<span>Banana Tabs!</span>&nbsp;
			<div style={{ display: 'inline' }} className="credits">BETA</div>
		</h3>
	);
};

export default Title;