import React from 'react';
import debug from 'debug';
import t from 'tcomb';
import shallowEqual from 'state/shallowEqual'; // TODO(split)
import connect from 'state/connect'; // TODO(split)
// import some from 'lodash/some';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import every from 'lodash/every';
import flattenDeep from 'lodash/flattenDeep';
import _displayName from './displayName';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

const log = debug('react-avenger:queries');
const warn = debug('react-avenger:queries');
warn.log = ::console.warn; // eslint-disable-line no-console

export const QueriesContextTypes = {
  graph: React.PropTypes.object.isRequired,
  query: React.PropTypes.func.isRequired
};

const As = q => flattenDeep(q.A).reduce((ac, k) => ({ ...ac, [k]: t.Any }), {});

export default function queries(allQueries) {
  return function(declaration, {
    // `pure` param for the `@connect` decoration
    // see `@connect` for more
    //
    // Boolean
    //
    pure = true
  } = {}) {
    // TODO(gio): support props renaming
    const queryNames = declaration;
    if (process.env.NODE_ENV !== 'production') {
      for (const name of queryNames) {
        if (!allQueries[name]) {
          warn(`query '${name}' not found! @queries declaration is: ${declaration}`);
        }
      }
    }
    const QueriesTypes = {
      readyState: t.struct(queryNames.reduce((ac, k) => ({
        ...ac, [k]: t.struct({
          // waiting: t.Boolean, fetching: t.Boolean, loading: t.Boolean, error: t.maybe(t.Any)
          loading: t.maybe(t.Boolean)
        })
      }), {
        loading: t.maybe(t.Boolean)
      })),
      ...queryNames.reduce((ac, k/*, i*/) => ({
        ...ac, [k]: t.maybe(/*allQueries[queryNames[i]].returnType*/t.Any)
      }), {})
    };

    // create a @connect declaration to grab all possible
    // query params from app state.
    // TODO(gio): we should warn and/or fail here in case of
    // duplicate keys with different types. Not sure how to check that
    const connectDeclaration = queryNames.reduce((ac, queryName) => ({
      // ...ac, ...allQueries[queryName].upsetActualParams
      ...ac, ...As(allQueries[queryName])
    }), {});

    // true if no previous queries
    // or if params have changed for some query
    const shouldSubscriptionUpdate = (args, newArgs) => {
      if (!args && newArgs) {
        return true;
      }

      return !shallowEqual(args, newArgs);
    };

    // true if { ...connectedState, ...props } does not type match
    // with the requested queries subscription params.
    // should never happen (there's a warning for this)
    const shouldBailSubscription = (props, connectedTypes) => {
      const failing = Object.keys(connectedTypes).filter(k => !connectedTypes[k].is(props[k]));
      return failing.length > 0 ? failing : false;
    };

    const decorator = Component => {
      const displayName = _displayName('queries')(Component);

      return connect(connectDeclaration, {
        pure,
        // some params for queries cannot be retrieved implicitly from state!
        // still, we want all the others
        filterValid: false
      })(
        class QueriesWrapper extends React.Component {
          static contextTypes = QueriesContextTypes;

          static displayName = displayName;

          constructor(props) {
            super(props);
            // TODO(gio): support props renaming
            this.state = {
              readyState: queryNames.reduce((ac, k) => ({ ...ac, [k]: {
                /*waiting: true, */loading: true//, fetching: false
              }
            }), {}) };
          }

          _subscribe(props) {
            const shouldBail = shouldBailSubscription(props, connectDeclaration);
            if (shouldBail) {
              if (process.env.NODE_ENV === 'development') {
                // TODO(gio): consider making this an always enabled log
                // it's closer to an error/warning than a debug message
                // (it should never happen)
                warn(`Bailing queries subscription (missing ${shouldBail.join(', ')} input params) for ${displayName}`);
              }
              return;
            }

            const args = pick(props, Object.keys(connectDeclaration));

            if (shouldSubscriptionUpdate(this._args, args)) {
              this._args = args;

              if (this._subscription) {
                this._subscription.unsubscribe();
              }

              // TODO(gio): support props renaming
              this._subscription = this.context.query(this.context.graph, queryNames, args)
                .map(({ loading, data }) => ({
                  readyState: {
                    loading,
                    ...Object.keys(data).reduce((ac, k) => ({
                      ...ac, [k]: { loading: data[k].loading }
                    }), {})
                  },
                  ...Object.keys(data).reduce((ac, k) => ({
                    ...ac, [k]: data[k].data
                  }), {})
                }))
                .subscribe(::this.setState);
            }
          }

          componentDidMount() {
            log(`${displayName} adding `, queryNames);
            this._subscribe(this.props);
          }

          componentWillReceiveProps(newProps) {
            this._subscribe(newProps);
          }

          componentWillUnmount() {
            log(`${displayName} removing queries`, queryNames);
            if (this._subscription) {
              this._subscription.unsubscribe();
            }
          }

          shouldComponentUpdate(newProps, newState) {
            const allProps = this.getProps(newProps, newState);
            // similar to connect/filterValid, we must render conditionally here
            return every(connectDeclaration, (decl, k) => decl.is(allProps[k]));
          }

          getProps(props = this.props, state = this.state) {
            // pass down everything except `transition`:
            // this makes `@queries` and `@commands` application commutative
            // but not wrt `@connect` (it should always be the innermost among these three)
            return {
              ...omit(props, 'transition'), ...state
            };
          }

          render() {
            return <Component {...this.getProps()}/>;
          }
        }
      );
    };
    decorator.Type = {
      ...connectDeclaration,
      ...QueriesTypes
    };
    return decorator;
  };
}
