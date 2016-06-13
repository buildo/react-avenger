# queries

Import the factory as

```js
import declareQueries from 'react-avenger/queries';
```

Create the decorator as

```js
const queries = declareQueries(allQueries);
// where `allQueries` is a dictionary String -> Query, e.g.
// {user: Query({ ... }), post: Query({ ... })  }
```

Use the decorator as

```js
@queries(['user', 'post'])
class MyComponent extends React.Component {
  render() {
    // `user` and `post` are passed as props as soon as they are ready (fetched).
    // `readyState` is passed as prop, containing meta-info for each declared query
    // and meta info for the whole component declaration.
    // examples:
    
    // `loading` for the whole decalration
    return this.props.readyState.loading ? null : <div>Ready!</div>
    
    // `loading` for a single query
    return this.props.readyState.user.loading ? null : <User user={this.props.user} />
    
    // just render if we have something
    return this.props.user ? <User user={this.props.user} />
  }
}
```

# loading

In combination with `@queries`, lets you conditionally render your component,
optionally in a layout including a "loader" component.

Import the factory as

```js
import loadingFactory from 'react-avenger/loading';
```

Create the decorator as

```js
const loading = loadingFactory({ ...config  })
```

Use as

```js
@queries(['user', 'post'])
@loading
class MyComponent extends React.Component {}
```

### loading configuration

`loader`: default is "no loader", meaning that your component won't show any loading indicator. It will, nontheless, render only when "ready" (i.e. all the declared queries are resolved to a value).

`wrapper`: default is `<div />`. Not of much use if you don't have a loader.

Examples

```js
const loading = loadingFactory(); // no loader

const loading = loadingFactory({
  loader: <MyLoadingSpinnerComponent /> // show a custom loader
});

const loading = loadingFactory({
  wrapper: <div style={{ position: 'relative'  }} /> // wrap it in a relative wrapper
  loader: <MyAbsoluteOverlayLoadingSpinnerComponent /> // show a custom absolute overlay loader
});
```

# commands

Import the factory as

```js
import declareCommands from 'react-avenger/commands';
```

Create the decorator as

```js
const queries = declareCommands(allCommands);
// where `allCommands` is a dictionary String -> Command, e.g.
// { doSaveUserProfile: Command({ ... }) }
```

Use the decorator as

```js
@commands(['doSaveUserProfile'])
class MyComponent extends React.Component {
  render() {
    // `doSaveUserProfile` is passed as prop
    // example:
    
    return <div onClick={() => this.props.doSaveUserProfile({ profile })}></div>
  }
}
```

# real world usage

The examples below should work by themselves,
but in a real world project you might want to define and re-export a single `queries`, `commands` and `loading` decorator,
to be used in component files.

For `loading`, you might need different styles & layout, so we typically do something like:

```js
import loading from 'loading/fillFlexLoading'; // or `fillAbsoluteLoading`, or `tinyLoading`, etc.
```
