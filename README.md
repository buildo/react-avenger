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
