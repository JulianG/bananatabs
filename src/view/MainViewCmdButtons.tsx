import * as React from 'react';

interface Props {
	onPaste(): void;
	onCopyAll(): void;
}

const MainViewCmdButtons = (props: Props) => {
	return (
		<div className="command-buttons">
			<button className="ok" onClick={props.onPaste}>Add Links</button>
			<span />
			<button className="cancel" onClick={props.onCopyAll}>Share All Windows</button>
		</div>
	);
};

export default MainViewCmdButtons;