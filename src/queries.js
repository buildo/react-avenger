import React from 'react';
import debug from 'debug';
import t from 'tcomb';
import shallowEqual from 'buildo-state/lib/shallowEqual'; // TODO(split)
import connect from 'buildo-state/lib/connect'; // TODO(split)
import some from 'lodash/some';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import every from 'lodash/every';
import _displayName from './displayName';

const log = debug('react-avenger:queries');
const warn = debug('react-avenger:queries');
warn.log = ::console.warn; // eslint-disable-line no-console

export const QueriesContextTypes = {
  avenger: React.PropTypes.object
};

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
      queryNames.forEach(name => {
        if (!allQueries[name]) {
          warn(`query '${name}' not found! @queries declaration is: ${declaration}`);
        }
      });
    }
    const QueriesTypes = {
      readyState: t.struct(queryNames.reduce((ac, k) => ({
        ...ac, [k]: t.struct({
          waiting: t.Boolean, fetching: t.Boolean, loading: t.Boolean, error: t.maybe(t.Any), ready: t.maybe(t.Boolean)
        })
      }), {})),
      ...queryNames.reduce((ac, k, i) => ({
        ...ac, [k]: t.maybe(allQueries[queryNames[i]].returnType)
      }), {})
    };

    // create a @connect declaration to grab all possible
    // query params from app state.
    // TODO(gio): we should warn and/or fail here in case of
    // duplicate keys with different types. Not sure how to check that
    const connectDeclaration = queryNames.reduce((ac, queryName) => ({
      ...ac, ...allQueries[queryName].upsetActualParams
    }), {});

    // true if no previous queries
    // or if params have changed for some query
    const shouldSubscriptionUpdate = (queries, newQueries) => {
      if (!queries && newQueries) {
        return true;
      }

      return some(queryNames, k => !shallowEqual(queries[k], newQueries[k]));
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

      const bailingWarning = shouldBail => {
        if (process.env.NODE_ENV === 'development') {
          // TODO(gio): consider making this an always enabled log
          // it's closer to an error/warning than a debug message
          // (it should never happen)
          warn(`Bailing queries subscription (missing ${shouldBail.join(', ')} input params) for ${displayName}`);
        }
      };

      return connect(connectDeclaration, {
        pure,
        // some params for queries cannot be retrieved implicitly from state!
        // still, we want all the others
        filterValid: false
      })(
        class QueriesWrapper extends React.Component {
          static contextTypes = QueriesContextTypes;

          static displayName = displayName;

          constructor(props, context) {
            super(props, context);
            // TODO(gio): support props renaming
            const shouldBail = shouldBailSubscription(props, connectDeclaration);
            if (shouldBail) {
              bailingWarning(shouldBail);
            }
            this.state = shouldBail ? {
              readyState: queryNames.reduce((ac, k) => ({ ...ac, [k]: {
                waiting: true, loading: true, fetching: false, ready: false
              } }), {})
            } : {
              ...context.avenger.queriesSync(queryNames.reduce((ac, queryName) => ({
                ...ac, [queryName]: pick(props, Object.keys(allQueries[queryName].upsetActualParams))
              }), {}))
            };
          }

          _subscribe(props) {
            const shouldBail = shouldBailSubscription(props, connectDeclaration);
            if (shouldBail) {
              bailingWarning(shouldBail);
              return;
            }

            const queries = queryNames.reduce((ac, queryName) => ({
              ...ac, [queryName]: pick(props, Object.keys(allQueries[queryName].upsetActualParams))
            }), {});

            if (shouldSubscriptionUpdate(this._queries, queries)) {
              this._queries = queries;

              if (this._subscription) {
                this._subscription.unsubscribe();
              }

              // TODO(gio): support props renaming
              this._subscription = this.context.avenger.queries(queries).subscribe(_queries => {
                // add `ready` boolean param to readyState
                const queriesState = {
                  ..._queries,
                  readyState: mapValues(_queries.readyState, (rs, queryName) => ({
                    ...rs,
                    // ready if values is not undefined, and if no readyState.error
                    ready: _queries[queryName] !== void 0 && rs.error === void 0
                  }))
                };
                this.setState(queriesState);
              });
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
