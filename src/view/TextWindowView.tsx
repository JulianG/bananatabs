import * as React from 'react';
import * as BT from '../model/CoreTypes';

import { windowsToString } from '../utils/SessionUtils';

interface Props {
	window: BT.Window;
	onClose(): void;
}

const TextWindowView = (props: Props) => {
	const text = windowsToString([props.window]);
	const rows = text.split('\n').length;
	return (
		<div className="textsession">
			<textarea
				rows={rows}
				autoComplete="off"
				wrap="off"
				value={text}
			/>
			<div >
				<button className="apply" onClick={props.onClose}>ok</button>&nbsp;
				</div>
		</div>
	);
};

export default TextWindowView;