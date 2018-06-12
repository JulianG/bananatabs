import * as React from 'react';

import * as BT from '../model/CoreTypes';

import { windowsToString } from '../utils/SessionUtils';

interface Props {
	window: BT.Window;
	onClose(): void;
}

export default class TextWindowView extends React.Component<Props> {

	private textAreaRef: HTMLTextAreaElement | null;

	constructor(props: Props) {
		super(props);
		this.copyToClipboardAndClose = this.copyToClipboardAndClose.bind(this);
	}

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
					<button
						className="ok"
						onClick={this.copyToClipboardAndClose}
					>
						Copy to Clipboard
					</button>
					<button
						className="cancel"
						onClick={this.props.onClose}
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	componentDidMount() {
		if (this.textAreaRef) {
			this.textAreaRef.select();
		}
	}

	private copyToClipboardAndClose() {
		document.execCommand('copy');
		this.props.onClose();
	}
}


