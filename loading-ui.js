import React from 'react';
import displayName from './displayName';

export default function loading({
  wrapper = <div />,
  loader = <div>loading...</div>,
  showLoaderOnFetching: showLoader = true,
  showUIonFetching: showUI = false,
  showLoaderonRefetching: reShowLoader = true,
  showUIonRefetching: reShowUI = true
}) {

  return (Component) => class LoadingUIWrapper extends React.Component {

    static displayName = displayName('loadingUI')(Component);

    render() {
      const { __status: status, ...props } = this.props;
      switch (status) {
        case 'isReady': return React.cloneElement(wrapper, null, [<Component {...props} />]);
        case 'isFetching': return React.cloneElement(wrapper, null, [showLoader && loader, showUI && <Component {...props} key='content' />]);
        case 'isRefetching': return React.cloneElement(wrapper, null, [reShowLoader && loader, reShowUI && <Component {...props} key='content' />]);
      }
    }
  };
}
