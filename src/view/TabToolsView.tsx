import * as React from 'react';

const doNothing = () => {
  /**/
};

const Icons = {
  Share: require('./icons/share.svg'),
  Edit: require('./icons/edit.svg'),
  Delete: require('./icons/delete.svg'),
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

export const TabToolsView = React.memo((props: Props) => {
  
  const {
    onRenameAction = doNothing,
    onDeleteAction = doNothing,
    onCopyAction = doNothing,
    actionIconVisibility
  } = props;
  
  const [tooltip, setTooltip] = React.useState('');

  function dispatchRenameAction(e: React.MouseEvent) {
    (onRenameAction || doNothing)();
  }

  function dispatchDeleteAction(e: React.MouseEvent) {
    (onDeleteAction || doNothing)();
  }

  function dispatchCopyAction(e: React.MouseEvent) {
    (onCopyAction || doNothing)();
  }

  function handleMouseOver(e: { currentTarget: { id: string } }) {
    setTooltip(e.currentTarget.id);
  }

  function resetToolTip() {
    setTooltip('');
  }

  return (
    <div className="tab-tools" onMouseOut={resetToolTip}>
      <span className="tooltip">{tooltip}</span>&nbsp;
      {actionIconVisibility.copy && (
        <ToolButton
          id="share"
          src={Icons.Share}
          onClick={dispatchCopyAction}
          onMouseOver={handleMouseOver}
        />
      )}
      {actionIconVisibility.rename && (
        <ToolButton
          id="rename"
          src={Icons.Edit}
          onClick={dispatchRenameAction}
          onMouseOver={handleMouseOver}
        />
      )}
      {actionIconVisibility.delete && (
        <ToolButton
          id="delete"
          src={Icons.Delete}
          onClick={dispatchDeleteAction}
          onMouseOver={handleMouseOver}
        />
      )}
    </div>
  );
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return (
    nextProps.actionIconVisibility.copy ===
      prevProps.actionIconVisibility.copy &&
    nextProps.actionIconVisibility.rename ===
      prevProps.actionIconVisibility.rename &&
    nextProps.actionIconVisibility.delete ==
      prevProps.actionIconVisibility.delete
  );
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
