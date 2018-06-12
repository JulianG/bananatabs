import * as React from 'react';

import * as BT from '../model/CoreTypes';

import { windowsToString } from '../utils/SessionUtils';

interface Props {
	window: BT.Window;
	onClose(): void;
}

export default class TextWindowView extends React.Component<Props> {

	private textAreaRef: HTMLTextAreaElement | null;

	render() {
		const text = windowsToString([this.props.window]);
		const rows = text.split('\n').length;
		return (
			<div className="textsession">
				<textarea
					ref={(ref) => this.textAreaRef = ref}
					readOnly={true}
					rows={rows}
					autoComplete="off"
					wrap="off"
					value={text}
				/>
				<div >
					<button className="apply" onClick={this.props.onClose}>ok</button>&nbsp;
						</div>
			</div>
		);
	}

	componentDidMount() {
		if (this.textAreaRef) {
			this.textAreaRef.select();
		}
	}
}


