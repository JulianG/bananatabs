import * as React from 'react';
import { CONFIG } from '../config';

import * as BT from '../model/core/CoreTypes';
import { TabView } from './TabView';
import { TabToolsView } from './TabToolsView';
import { InputForm } from './InputForm';
import { createDebugInfo } from '../utils/DebugUtils';
import { WindowMutator, TabMutator } from '../model/core/Mutators';
import { compareWindow } from '../model/core/CoreComparisons';

const Icons = {
  Edit: require('./icons/edit.svg'),
  On: require('./icons/on.svg'),
  Off: require('./icons/off.svg'),
  Delete: require('./icons/delete.svg'),
  ArrowDown: require('./icons/arrow-down.svg'),
  ArrowRight: require('./icons/arrow-right.svg'),
};

interface Props {
  window: BT.Window;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onCopy(windowId: number): void;
}

export const WindowView = React.memo((props: Props) => {
  const [areToolsVisible, setToolsVisible] = React.useState(false); // could be moved to renderHeader
  const [renaming, setRenaming] = React.useState(false);

  const w = props.window;

  const classNames = [
    'window-group',
    w.focused ? 'focused' : '',
    w.visible ? 'visible' : 'hidden',
  ].filter(c => !!c);

  return (
    <div
      id="window-group"
      data-testid="window-group"
      className={classNames.join(' ')}
    >
      {renderHeader(
        props,
        areToolsVisible,
        setToolsVisible,
        renaming,
        setRenaming
      )}
      {CONFIG.debug && createDebugInfo(w, ['id'])}
      {renderTabs(w, props.tabMutator)}
    </div>
  );
}, shouldNotRerender);

function shouldNotRerender(prevProps: Props, nextProps: Props) {
  return compareWindow(prevProps.window, nextProps.window);
}

function renderHeader(
  props: Props,
  areToolsVisible: boolean,
  setToolsVisible: (b: boolean) => void,
  renaming: boolean,
  setRenaming: (b: boolean) => void
) {
  const w = props.window;
  return (
    <div
      className="item-row"
      onMouseEnter={() => setToolsVisible(true)}
      onMouseLeave={() => setToolsVisible(false)}
    >
      {renderDisclosureButton(props)}
      {renderVisibilityIcon(props)}
      {!renaming && areToolsVisible && renderTools(props, setRenaming)}
      {renaming
        ? renderInputTitle(w, props.windowMutator, setRenaming)
        : renderStaticTitle(w, setRenaming)}
      {renaming && <div className="hint">&nbsp;Enter to save&nbsp;</div>}
    </div>
  );
}

function renderVisibilityIcon(props: Props) {
  const w = props.window;
  const visibilityIconSrc = w.visible ? Icons.On : Icons.Off;
  const visibilityIconText = w.visible ? 'Hide Window' : 'Show Window';
  const imgId = 'win-visibility' + (w.visible ? '-visible' : '-hidden');

  const toggleVisibility = () => {
    w.visible
      ? props.windowMutator.hideWindow(w.id)
      : props.windowMutator.showWindow(w.id);
  };

  return (
    <img
      data-testid="visibility-toggle"
      id={imgId}
      alt={'win' + (w.visible ? '-visible' : '-hidden')}
      className="tool icon"
      src={visibilityIconSrc}
      title={visibilityIconText}
      onClick={toggleVisibility}
    />
  );
}

function renderTabs(window: BT.Window, tabMutator: TabMutator) {
  const display = window.expanded ? 'block' : 'none';
  return (
    // window.expanded &&
    <div style={{ display }}>
      {window.tabs.map((tab, i) => {
        const key = `tab-${tab.id}`; // `win-${window.id}/tab-${tab.id}`;
        return (
          <TabView key={key} window={window} tab={tab} mutator={tabMutator} />
        );
      })}
    </div>
  );
}

function renderDisclosureButton(props: Props) {
  const w = props.window;
  const iconSrc = w.expanded ? Icons.ArrowDown : Icons.ArrowRight;
  const iconText = w.expanded ? 'Collapse' : 'Expand';
  const iconStyles = ['tool', 'icon', w.visible ? '' : 'hidden'];

  function toggleCollapse() {
    w.expanded
      ? props.windowMutator.collapseWindow(w.id)
      : props.windowMutator.expandWindow(w.id);
  }

  return (
    <img
      id="disclosure"
      alt={`window-disclosure-${w.expanded ? 'expanded' : 'collapsed'}`}
      className={iconStyles.join(' ')}
      src={iconSrc}
      title={iconText}
      onClick={toggleCollapse}
    />
  );
}

function renderInputTitle(
  window: BT.Window,
  windowMutator: WindowMutator,
  setRenaming: (b: boolean) => void
): JSX.Element {
  const title = window.title;

  const submitRename = (text: string) => {
    windowMutator.renameWindow(window.id, text);
    setRenaming(false);
  };

  return (
    <InputForm
      className="window-title"
      text={title}
      onSubmit={submitRename}
      onCancel={() => setRenaming(false)}
    />
  );
}

function renderStaticTitle(
  window: BT.Window,
  setRenaming: (b: boolean) => void
): JSX.Element {
  const tabsStr = window.expanded ? '' : ' (' + window.tabs.length + ' tabs)';
  const title = window.title || 'Window';
  const fullscreen = window.state === 'fullscreen' ? '(fullscreen)' : '';

  return (
    <span className="window-title" onClick={() => setRenaming(true)}>
      {title} <span>{tabsStr}</span> <span>{fullscreen}</span>
    </span>
  );
}

function renderTools(props: Props, setRenaming: (b: boolean) => void) {
  return (
    <TabToolsView
      actionIconVisibility={{ rename: true, delete: true, copy: true }}
      onRenameAction={() => setRenaming(true)}
      onDeleteAction={() => props.windowMutator.deleteWindow(props.window.id)}
      onCopyAction={() => props.onCopy(props.window.id)}
    />
  );
}
