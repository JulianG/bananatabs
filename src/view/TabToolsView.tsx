import * as React from 'react';

const doNothing = () => {
  /**/
};

const Icons = {
  Share: require('./icons/share.svg'),
  Edit: require('./icons/edit.svg'),
  Delete: require('./icons/delete.svg')
};

interface Props {
  actionIconVisibility: {
    copy: boolean;
    rename: boolean;
    delete: boolean;
  };
  onRenameAction?(): void;
  onDeleteAction?(): void;
  onCopyAction?(): void;
}

interface State {
  tooltip: string;
}

export default class TabToolsView extends React.Component<Props, State> {
  readonly state: State = { tooltip: '' };

  constructor(props: Props) {
    super(props);
    this.handleRenameAction = this.handleRenameAction.bind(this);
    this.handleDeleteAction = this.handleDeleteAction.bind(this);
    this.handleCopyAction = this.handleCopyAction.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.resetToolTip = this.resetToolTip.bind(this);
  }

  render() {
    return (
      <div className="tab-tools" onMouseOut={this.resetToolTip}>
        <span className="tooltip">{this.state.tooltip}</span>&nbsp;
        {this.props.actionIconVisibility.copy && (
          <ToolButton
            id="share"
            src={Icons.Share}
            onClick={this.handleCopyAction}
            onMouseOver={this.handleMouseOver}
          />
        )}
        {this.props.actionIconVisibility.rename && (
          <ToolButton
            id="rename"
            src={Icons.Edit}
            onClick={this.handleRenameAction}
            onMouseOver={this.handleMouseOver}
          />
        )}
        {this.props.actionIconVisibility.delete && (
          <ToolButton
            id="delete"
            src={Icons.Delete}
            onClick={this.handleDeleteAction}
            onMouseOver={this.handleMouseOver}
          />
        )}
      </div>
    );
  }

  private handleRenameAction(e: React.MouseEvent<HTMLImageElement>) {
    (this.props.onRenameAction || doNothing)();
  }

  private handleDeleteAction(e: React.MouseEvent<HTMLImageElement>) {
    (this.props.onDeleteAction || doNothing)();
  }

  private handleCopyAction(e: React.MouseEvent<HTMLImageElement>) {
    (this.props.onCopyAction || doNothing)();
  }

  private handleMouseOver(e: React.MouseEvent<HTMLImageElement>) {
    this.setState({ tooltip: e.currentTarget.id });
  }

  private resetToolTip() {
    this.setState({ tooltip: '' });
  }
}

function ToolButton(props: {
  id: string;
  src: string;
  onClick: (e: React.MouseEvent) => void;
  onMouseOver: (e: React.MouseEvent) => void;
}) {
  return (
    <img
      id={props.id}
      title={props.id}
      alt={props.id}
      className="icon"
      src={props.src}
      onClick={props.onClick}
      onMouseOver={props.onMouseOver}
    />
  );
}
