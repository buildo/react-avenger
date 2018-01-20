import React from 'react';
import debug from 'debug';
import shallowEqual from 'buildo-state/lib/shallowEqual'; // TODO(split)
import pick from 'lodash/pick';
import every from 'lodash/every';
import PropTypes from 'prop-types';
import _displayName from './displayName';
import 'rxjs/add/operator/debounceTime';

const log = debug('react-avenger:queries');

export const QueriesContextTypes = {
  graph: PropTypes.object.isRequired,
  query: PropTypes.func.isRequired,
  querySync: PropTypes.func // not required if option `querySync=false`
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

export default function declareQueries(declaration, {
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

  // true if no previous queries
  // or if params have changed for some query
  const shouldSubscriptionUpdate = (params, newParams) => {
    if (!params && newParams) {
      return true;
    }

    return !shallowEqual(params, newParams);
  };

  return Component => {
    const displayName = _displayName('queries')(Component);

    const bailingWarning = shouldBail => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('react-avenger:queries', `Bailing queries subscription (missing ${shouldBail.join(', ')} input params) for ${displayName}`); // eslint-disable-line no-console
      }
    };

    return class QueriesWrapper extends React.Component {
      static contextTypes = QueriesContextTypes;

      static displayName = displayName;

      constructor(props, context) {
        super(props, context);

        if (process.env.NODE_ENV !== 'production') {
          queryNames.forEach(name => {
            if (!context.graph[name]) {
              console.warn('react-avenger:queries', `query '${name}' not found! queries declaration is: ${declaration}`); // eslint-disable-line no-console
            }
          });
        }

        this.QueryParamsTypes = queryNames.reduce((ac, queryName) => ({
          ...ac, ...context.graph[queryName].upsetParams
        }), {});

        const emptyData = {
          readyState: queryNames.reduce((ac, k) => ({ ...ac, [k]: {
            loading: true, ready: false
          } }), {})
        };

        if (querySync) {
          const shouldBail = this.shouldBailSubscription(props);
          if (shouldBail) {
            bailingWarning(shouldBail);
          }

          this.state = shouldBail ? emptyData : {
            ...mapQueriesToState(
              context.querySync(
                context.graph, queryNames, pick(props, Object.keys(this.QueryParamsTypes))
              )
            )
          };
        } else {
          this.state = emptyData;
        }
      }

      shouldBailSubscription = props => {
        // true if `props` do not type match
        // with the requested queries subscription params.
        // should never happen (there's a warning for this)
        const failing = Object.keys(this.QueryParamsTypes).filter(k => !this.QueryParamsTypes[k].is(props[k]));
        return failing.length > 0 ? failing : false;
      };

      _subscribe(props) {
        const shouldBail = this.shouldBailSubscription(props, this.QueryParamsTypes);
        if (shouldBail) {
          bailingWarning(shouldBail);
          return;
        }

        const params = pick(props, Object.keys(this.QueryParamsTypes));

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
        return every(this.QueryParamsTypes, (T, k) => T.is(allProps[k]));
      }

      getProps(props = this.props, state = this.state) {
        return { ...props, ...state };
      }

      render() {
        return <Component {...this.getProps()} />;
      }
    };
  };
}
