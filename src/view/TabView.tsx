import * as React from 'react';
import * as BT from '../model/core/CoreTypes';
import { TabToolsView } from './TabToolsView';
import { compareTab, compareWindow } from '../model/core/CoreComparisons';
import { DebugInfo } from '../utils/DebugUtils';
import { useTabMutatorContext } from '../context/ReactContextFactory';

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
}
export const TabView = React.memo(function TabView({window, tab}: Props) {
  
  const tabMutator = useTabMutatorContext();

  const styles = [
    'item-row',
    'tab',
    tab.active ? 'active' : '',
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
    tab.visible
      ? tabMutator.hideTab(window.id, tab.id)
      : tabMutator.showTab(window.id, tab.id);
  };

  const selectTab = () =>
    tabMutator.selectTab(window.id, tab.id);

  return (
    <div id={'tab'} className={styles.join(' ')}>
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
      <TabToolsView
        actionIconVisibility={{ delete: true, rename: false, copy: false }}
        onDeleteAction={() =>
          tabMutator.deleteTab(window.id, tab.id)
        }
      />
      <span className="tab-title" onClick={selectTab}>
        <DebugInfo item={tab} />
        {tab.title || tab.url}
      </span>
    </div>
  );
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return (
    compareTab(prevProps.tab, nextProps.tab) &&
    compareWindow(prevProps.window, nextProps.window)
  );
}
