import * as React from 'react';
import { shallowEqual } from './shallowEqual';
import { displayName as _displayName } from './displayName';
import 'rxjs/add/operator/debounceTime';
import { query, querySync } from 'avenger';
const pick = require('lodash/pick');
const debug = require('debug');

const log = debug('react-avenger:queries');

const mapQueriesToState = ({ data }, prevState) =>
  Object.keys(data).reduce((ac, k) => {
    const value =
      data[k].data !== void 0 ? data[k].data : (prevState[k] && prevState[k].value) || void 0;
    return {
      ...ac,
      [k]: {
        ready: value !== void 0,
        loading: data[k].loading,
        value
      }
    };
  }, {});

export default function declareQueries(
  queries,
  {
    // whether to use `querySync` and flush the data available before
    // first render() or not
    // Defaults to `false` since it is typically unwanted client-side
    // when rendering something, even an empty/loading view
    // is better than waiting for a "long render"
    // This must be `true` server-side, when there's a single render() pass
    //
    // Boolean
    //
    querySync: _querySync = false
  } = {}
) {
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

    return class QueriesWrapper extends React.Component {
      static displayName = displayName;

      constructor(props, context) {
        super(props, context);

        this.QueryParamsTypes = queryNames.reduce(
          (ac, queryName) => ({
            ...ac,
            ...queries[queryName].upsetParams
          }),
          {}
        );

        const emptyData = queryNames.reduce(
          (ac, k) => ({
            ...ac,
            [k]: {
              loading: true,
              ready: false
            }
          }),
          {}
        );

        if (_querySync) {
          this.state = mapQueriesToState(
            querySync(queries, pick(props, Object.keys(this.QueryParamsTypes))),
            {}
          );
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

          this._subscription = query(queries, params)
            .debounceTime(5)
            .map(event => mapQueriesToState(event, this.state))
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
