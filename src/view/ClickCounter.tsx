import * as React from 'react';

interface Props {
	onClick(count: number): void;
}

interface State {
	count: number;
}

export default class ClickCounter extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { count: 0 };

		this.handleClick = this.handleClick.bind(this);
	}

	render() {
		return <div onClick={this.handleClick}>{this.props.children}</div>;
	}

	private handleClick() {
		const updater = (prev: State) => { return { count: prev.count + 1 }; };
		const afterUpdate = () => this.props.onClick(this.state.count);
		this.setState(updater, afterUpdate);
	}
}