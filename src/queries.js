import React from 'react';
import debug from 'debug';
import shallowEqual from 'buildo-state/lib/shallowEqual'; // TODO(split)
import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import _displayName from './displayName';
import 'rxjs/add/operator/debounceTime';

const log = debug('react-avenger:queries');

export const QueriesContextTypes = {
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

export default function declareQueries(queries, {
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
  const queryNames = Object.keys(queries);

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

        this.QueryParamsTypes = queryNames.reduce((ac, queryName) => ({
          ...ac, ...queries[queryName].upsetParams
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
              context.querySync(queries, pick(props, this.QueryParamsTypes))
            )
          };
        } else {
          this.state = emptyData;
        }
      }

      _subscribe(props) {
        const params = pick(props, Object.keys(this.QueryParamsTypes));

        if (shouldSubscriptionUpdate(this._params, params)) {
          this._params = params;

          if (this._subscription) {
            this._subscription.unsubscribe();
          }

          this._subscription = this.context.query(queries, params)
            .debounceTime(5)
            .map(mapQueriesToState)
            .subscribe(this.setState.bind(this));
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

      getProps(props = this.props, state = this.state) {
        return { ...props, ...state };
      }

      render() {
        return <Component {...this.getProps()} />;
      }
    };
  };
}
