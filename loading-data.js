import React from 'react';
import some from 'lodash/some';
import every from 'lodash/every';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import findKey from 'lodash/findKey';
import displayName from './displayName';

const isLoading = ({ readyState }) => some(readyState, 'loading');
const isFetched = ({ readyState, ...props }) => {
  return every(pick(props, Object.keys(readyState)), (prop, propName) => {
    return prop !== void 0 && readyState[propName].error === void 0;
  });
};

export default (Component) => class LoadingDataWrapper extends React.Component {

  static displayName = displayName('loadingData')(Component);

  render() {
    const ready = isFetched(this.props);
    const loading = isLoading(this.props);
    const isFetching = !ready;
    const isReady = ready && !loading;
    const isRefetching = ready && loading;
    const props = omit(this.props, 'readyState');
    const status = findKey({ isFetching, isReady, isRefetching });

    return (
      <Component
        {...props}
        __status={status}
      />
    );
  }
};
