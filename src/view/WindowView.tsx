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
  ArrowRight: require('./icons/arrow-right.svg')
};

interface Props {
  window: BT.Window;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onCopy(windowId: number): void;
}

interface State {
  toolsVisible: boolean;
  renaming: boolean;
}

export class WindowView extends React.Component<Props, State> {
  readonly state: State = { toolsVisible: false, renaming: false };

  constructor(props: Props) {
    super(props);

    this.handleStartRename = this.handleStartRename.bind(this);
    this.handleCancelRename = this.handleCancelRename.bind(this);
    this.handleSubmitRename = this.handleSubmitRename.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleToggleVisibility = this.handleToggleVisibility.bind(this);
    this.handleToggleCollapse = this.handleToggleCollapse.bind(this);
    this.showTools = this.showTools.bind(this);
    this.hideTools = this.hideTools.bind(this);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      compareWindow(nextProps.window, this.props.window) === false ||
      nextState.toolsVisible !== this.state.toolsVisible ||
      nextState.renaming !== this.state.renaming
    );
  }

  render() {

    console.log('WindowView.render');
    
    const w = this.props.window;

    const styles = [
      'window-group',
      w.focused ? 'focused' : '',
      this.state.toolsVisible ? 'highlight' : '',
      w.visible ? 'visible' : 'hidden'
    ];

    return (
      <div
        id="window-group"
        data-testid="window-group"
        className={styles.join(' ')}
      >
        {this.renderHeader()}
        {CONFIG.debug && createDebugInfo(w, ['id'])}
        {this.renderTabs()}
      </div>
    );
  }

  private renderHeader() {
    const w = this.props.window;
    return (
      <div
        className="item-row"
        onMouseEnter={this.showTools}
        onMouseLeave={this.hideTools}
      >
        {this.renderDisclosureButton()}
        {this.renderVisibilityIcon()}
        {!this.state.renaming && this.renderTools()}
        {this.state.renaming
          ? this.renderInputTitle(w)
          : this.renderStaticTitle(w)}
        {this.state.renaming && (
          <div className="hint">&nbsp;Enter to save&nbsp;</div>
        )}
      </div>
    );
  }

  private renderVisibilityIcon() {
    const w = this.props.window;
    const visibilityIconSrc = w.visible ? Icons.On : Icons.Off;
    const visibilityIconText = w.visible ? 'Hide Window' : 'Show Window';
    const imgId = 'win-visibility' + (w.visible ? '-visible' : '-hidden');

    return (
      <img
        data-testid="visibility-toggle"
        id={imgId}
        alt={'win' + (w.visible ? '-visible' : '-hidden')}
        className="tool icon"
        src={visibilityIconSrc}
        title={visibilityIconText}
        onClick={this.handleToggleVisibility}
      />
    );
  }

  private renderTabs() {
    const { window, tabMutator } = this.props;
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

  private renderDisclosureButton() {
    const w = this.props.window;
    const iconSrc = w.expanded ? Icons.ArrowDown : Icons.ArrowRight;
    const iconText = w.expanded ? 'Collapse' : 'Expand';
    const iconStyles = ['tool', 'icon', w.visible ? '' : 'hidden'];
    return (
      <img
        id="disclosure"
        alt={`window-disclosure-${w.expanded ? 'expanded' : 'collapsed'}`}
        className={iconStyles.join(' ')}
        src={iconSrc}
        title={iconText}
        onClick={this.handleToggleCollapse}
      />
    );
  }

  private renderInputTitle(window: BT.Window): JSX.Element {
    const title = window.title;

    return (
      <InputForm
        className="window-title"
        text={title}
        onSubmit={this.handleSubmitRename}
        onCancel={this.handleCancelRename}
      />
    );
  }

  private renderStaticTitle(window: BT.Window): JSX.Element {
    const tabsStr = window.expanded ? '' : ' (' + window.tabs.length + ' tabs)';
    const title = window.title || 'Window';
    const fullscreen = window.state === 'fullscreen' ? '(fullscreen)' : '';

    return (
      <span className="window-title" onClick={this.handleStartRename}>
        {title} <span>{tabsStr}</span> <span>{fullscreen}</span>
      </span>
    );
  }

  private renderTools() {
    if (this.state.toolsVisible) {
      return (
        <TabToolsView
          actionIconVisibility={{ rename: true, delete: true, copy: true }}
          onRenameAction={this.handleStartRename}
          onDeleteAction={this.handleDelete}
          onCopyAction={this.handleCopy}
        />
      );
    } else {
      return null;
    }
  }

  ////

  private handleCopy() {
    this.props.onCopy(this.props.window.id);
  }

  private handleToggleVisibility() {
    this.props.window.visible
      ? this.props.windowMutator.hideWindow(this.props.window.id)
      : this.props.windowMutator.showWindow(this.props.window.id);
  }

  private handleDelete() {
    this.props.windowMutator.deleteWindow(this.props.window.id);
  }

  private handleStartRename() {
    this.setState({ renaming: true });
  }

  private handleCancelRename() {
    this.setState({ renaming: false });
  }

  private handleSubmitRename(text: string) {
    this.props.windowMutator.renameWindow(this.props.window.id, text);
    this.setState({ renaming: false });
  }

  private handleToggleCollapse() {
    if (this.props.window.expanded) {
      this.props.windowMutator.collapseWindow(this.props.window.id);
    } else {
      this.props.windowMutator.expandWindow(this.props.window.id);
    }
  }

  private showTools() {
    this.setState({ toolsVisible: true });
  }
  private hideTools() {
    this.setState({ toolsVisible: false });
  }
}
