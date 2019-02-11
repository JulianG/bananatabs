import * as React from 'react';
import * as BT from '../model/core/CoreTypes';
import { TabToolsView } from './TabToolsView';
import { TabMutator } from '../model/core/Mutators';
import { compareTab } from '../model/core/CoreComparisons';
import { DebugInfo } from '../utils/DebugUtils';

const Icons = {
  On: require('./icons/on.svg'),
  OnHidden: require('./icons/on-hidden.svg'),
  Off: require('./icons/off.svg'),
  Delete: require('./icons/delete.svg'),
  Page: require('./icons/page.svg'),
};

interface Props {
  window: BT.Window;
  tab: BT.Tab;
  mutator: TabMutator;
}
export const TabView = React.memo((props: Props) => {
  const [areToolsVisible, setToolsVisible] = React.useState(false);

  const window = props.window;
  const tab = props.tab;

  const styles = [
    'item-row',
    'tab',
    tab.active ? 'active' : '',
    areToolsVisible ? 'highlight' : '',
    tab.visible ? 'visible' : 'hidden',
  ];

  const icon = tab.icon || Icons.Page;

  const iconStyles = ['icon', tab.visible && window.visible ? '' : 'hidden'];

  const visibilityIconSrc = tab.visible
    ? window.visible
      ? Icons.On
      : Icons.OnHidden
    : Icons.Off;
  const visibilityIconText = tab.visible ? 'Hide Tab' : 'Show Tab';

  const toggleVisibility = () => {
    props.tab.visible
      ? props.mutator.hideTab(props.window.id, props.tab.id)
      : props.mutator.showTab(props.window.id, props.tab.id);
  };

  const selectTab = () =>
    props.mutator.selectTab(props.window.id, props.tab.id);

  return (
    <div
      id={'tab'}
      className={styles.join(' ')}
      onMouseEnter={() => setToolsVisible(true)}
      onMouseLeave={() => setToolsVisible(false)}
    >
      <img
        data-testid="visibility-toggle"
        id={'tab-visibility' + (tab.visible ? '-visible' : '-hidden')}
        alt={'tab' + (tab.visible ? '-visible' : '-hidden')}
        className="left-most tool icon"
        src={visibilityIconSrc}
        title={visibilityIconText}
        onClick={toggleVisibility}
      />

      <img className={iconStyles.join(' ')} src={icon} onClick={selectTab} />
      {areToolsVisible && (
        <TabToolsView
          actionIconVisibility={{ delete: true, rename: false, copy: false }}
          onDeleteAction={() =>
            props.mutator.deleteTab(props.window.id, props.tab.id)
          }
        />
      )}
      <span className="tab-title" onClick={selectTab}>
        <DebugInfo item={tab} />
        {tab.title || tab.url}
      </span>
    </div>
  );
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return compareTab(prevProps.tab, nextProps.tab);
}
