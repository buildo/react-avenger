import React from 'react';
import displayName from './displayName';

export default function loading({
  wrapper = <div />,
  loader = <div>loading...</div>,
  showLoaderOnFetching: showLoader = true,
  showLoaderonRefetching: reShowLoader = true,
  showUIonRefetching: showUI = true
}) {

  return (Component) => class LoadingUIWrapper extends React.Component {

    static displayName = displayName('loadingUI')(Component);

    render() {
      const { __status: status, ...props } = this.props;
      return {
        isReady: <Component {...props} />,
        isFetching: showLoader ? loader : null,
        isRefetching: React.cloneElement(wrapper, null, [
          reShowLoader && loader,
          showUI && <Component {...props} />
        ])
      }[status];

    }
  };
}
