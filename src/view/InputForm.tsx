import * as React from 'react';

const doNothing = () => { /**/ };

interface Props {
	text: string;
	className?: string;
	inlineStyles?: {};
	onSubmit?(text: string): void;
	onCancel?(): void;
}

interface State {
	tempText: string;
}

export default class InputForm extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = { tempText: this.props.text };

		this.handleChange = this.handleChange.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	render() {
		const text = this.state.tempText;
		return (
			<input
				className={this.props.className}
				style={this.props.inlineStyles}
				autoFocus={true}
				type="text"
				defaultValue={text}
				onChange={this.handleChange}
				onKeyUp={this.handleKeyUp}
				onBlur={this.handleBlur}
			/>
		);
	}

	private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({ tempText: event.target.value });
	}

	private handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
		switch (event.keyCode) {
			case 13: // enter
				(this.props.onSubmit || doNothing)(this.state.tempText);
				break;
			case 27: // esc
				this.setState({ tempText: this.props.text });
				(this.props.onCancel || doNothing)();
				break;
			default:
		}
	}

	private handleBlur(event: React.FocusEvent<HTMLInputElement>) {
		this.setState({ tempText: this.props.text });
		(this.props.onCancel || doNothing)();
	}

}