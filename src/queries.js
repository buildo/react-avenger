import React from 'react';
import debug from 'debug';
import t from 'tcomb';
import shallowEqual from 'buildo-state/lib/shallowEqual'; // TODO(split)
import pick from 'lodash/pick';
import every from 'lodash/every';
import mapValues from 'lodash/mapValues';
import _displayName from './displayName';
import 'rxjs/add/operator/debounceTime';

const log = debug('react-avenger:queries');
const warn = debug('react-avenger:queries');
warn.log = ::console.warn; // eslint-disable-line no-console

export const QueriesContextTypes = {
  graph: React.PropTypes.object.isRequired,
  query: React.PropTypes.func.isRequired,
  querySync: React.PropTypes.func // not required if option `querySync=false`
};

const mapQueriesToState = ({ data }) => ({
  readyState: {
    ...Object.keys(data).reduce((ac, k) => ({
      ...ac, [k]: {
        loading: data[k].loading,
        // add `ready` boolean param to readyState
        ready: data[k].data !== void 0
      }
    }), {})
  },
  ...Object.keys(data).reduce((ac, k) => ({
    ...ac, [k]: data[k].data
  }), {})
});

export default function queries(allQueries) {
  return function(declaration, {
    // whether to use `querySync` and flush the data available before
    // first render() or not
    // Defaults to `false` since it is typically unwanted client-side
    // when rendering something, even an empty/loading view
    // is better than waiting for a "long render"
    // This must be `true` server-side, when there's a single render() pass
    //
    // Boolean
    //
    querySync = false
  } = {}) {
    const queryNames = declaration;
    if (process.env.NODE_ENV !== 'production') {
      queryNames.forEach(name => {
        if (!allQueries[name]) {
          warn(`query '${name}' not found! @queries declaration is: ${declaration}`);
        }
      });
    }

    const QueryParamsTypes = queryNames.reduce((ac, queryName) => ({
      ...ac, ...allQueries[queryName].upsetParams
    }), {});

    const QueriesTypes = {
      readyState: t.struct(queryNames.reduce((ac, k) => ({
        ...ac, [k]: t.struct({
          loading: t.Boolean, ready: t.Boolean
        })
      }), {})),
      ...queryNames.reduce((ac, k) => ({
        ...ac, [k]: allQueries[k].returnType || t.Any
      }), {})
    };

    // true if no previous queries
    // or if params have changed for some query
    const shouldSubscriptionUpdate = (params, newParams) => {
      if (!params && newParams) {
        return true;
      }

      return !shallowEqual(params, newParams);
    };

    // true if `props` do not type match
    // with the requested queries subscription params.
    // should never happen (there's a warning for this)
    const shouldBailSubscription = props => {
      const failing = Object.keys(QueryParamsTypes).filter(k => !QueryParamsTypes[k].is(props[k]));
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

      return class QueriesWrapper extends React.Component {
        static contextTypes = QueriesContextTypes;

        static displayName = displayName;

        constructor(props, context) {
          super(props, context);

          const emptyData = {
            readyState: queryNames.reduce((ac, k) => ({ ...ac, [k]: {
              loading: true, ready: false
            } }), {})
          };

          if (querySync) {
            const shouldBail = shouldBailSubscription(props);
            if (shouldBail) {
              bailingWarning(shouldBail);
            }

            this.state = shouldBail ? emptyData : {
              ...mapQueriesToState(
                context.querySync(
                  context.graph, queryNames, pick(props, Object.keys(QueryParamsTypes))
                )
              )
            };
          } else {
            this.state = emptyData;
          }
        }

        _subscribe(props) {
          const shouldBail = shouldBailSubscription(props, QueryParamsTypes);
          if (shouldBail) {
            bailingWarning(shouldBail);
            return;
          }

          const params = pick(props, Object.keys(QueryParamsTypes));

          if (shouldSubscriptionUpdate(this._params, params)) {
            this._params = params;

            if (this._subscription) {
              this._subscription.unsubscribe();
            }

            this._subscription = this.context.query(this.context.graph, queryNames, params)
              .debounceTime(5)
              .map(mapQueriesToState)
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
          // TODO(gio): is this true (needed)?
          return every(QueryParamsTypes, (T, k) => T.is(allProps[k]));
        }

        getProps(props = this.props, state = this.state) {
          return { ...props, ...state };
        }

        render() {
          return <Component {...this.getProps()}/>;
        }
      };
    };

    // If params are missing queries will be bailed anyway.
    // In this way we are not being too eager and try to "connect too much" implicitly
    // in react-container (some params can only be passed via props by the end user)
    // TODO: consider doing this in react-container itself?
    decorator.InputType = mapValues(QueryParamsTypes, t.maybe);

    decorator.OutputType = QueriesTypes;
    decorator.Type = { ...decorator.InputType, ...decorator.OutputType };

    return decorator;
  };
}
