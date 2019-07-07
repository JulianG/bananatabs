# 4. Using React Context

Date: 2019-07-01

## Status

Accepted

## Context

There is a lot of prop-drilling in the current component tree.

### Current Render Tree -- A lot of prop-drilling

```
<App/>
  <BananaTabs />
    <MainView /> (✅session, ❌sessionMutator, ❌windowMutator, ❌tabMutator, browserController)
      <Title />
      <WindowListView />          (✅windows, ✅sessionMutator, ❌windowMutator, ❌tabMutator)
        <WindowView />            (✅window, ❌windowMutator, ❌tabMutator)
          <WindowHeader />        (️️⚠️window️, ✅windowMutator, ❌tabMutator)
            <DisclosureButton />  (✅window, ✅windowMutator)
            <VisibilityIcon />    (✅window, ✅windowMutator, ✅tabMutator)
            <WindowTitle />       (✅window, ✅windowMutator)
          <TabList />             (✅window, ❌tabMutator)
            <TabView />           (✅window, ✅tab, ✅tabMutator)
              <TabToolsView />
      <MainViewCmdButtons /> (none)

Legend:
✅ actually used by component
⚠️only reading id (e.g. window.id, tab.id)
❌ only passing it down to children

```

## Decision

I'm going to try to use React Context with the `useContext` hook to see if I can reduce or eliminate prop-drilling.

## Consequences

We'll see...