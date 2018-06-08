import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import { windowsToString, stringToWindows } from '../utils/SessionUtils';

interface Props {
	version: string;
	windows: BT.Window[];
	sessionMutator: SessionMutator;
	onClose(): void;
}

interface State {
	text: string;
	edited: boolean;
}

export default class TextSessionView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		let windows: string = windowsToString(this.props.windows);
		this.state = { text: windows, edited: false };
		//
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.updateWindows = this.updateWindows.bind(this);
	}

	componentWillReceiveProps(props: Props) {
		if (!this.state.edited) {
			this.setState({ text: windowsToString(props.windows) });
		}
	}

	render() {
		const text = this.state.text;
		const rows = text.split('\n').length;
		return (
			<div className="textsession">
				<textarea
					rows={rows}
					autoComplete="off"
					wrap="off"
					value={text}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyPress}
				/>
				<div >
					<button onClick={this.updateWindows}>Apply</button>
					<button onClick={this.props.onClose}>Cancel</button>
				</div>
			</div>
		);
	}

	private handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
		this.setState({ text: event.target.value, edited: true });
	}

	private handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.keyCode === 13 && e.ctrlKey) {
			this.updateWindows();
		}
	}

	private updateWindows() {
		const windows = stringToWindows(this.state.text);
		this.props.sessionMutator.updateWindows(windows);
		this.props.onClose();
	}

}