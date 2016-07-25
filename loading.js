import React from 'react';
import map from 'lodash/map';
import some from 'lodash/some';
import every from 'lodash/every';
import displayName from './displayName';

export default function loading({
  renderAnyway = false,
  wrapper = <div />,
  loader = <div>loading...</div>,
  loaderProps = () => ({}),
  wrapperProps = () => ({})
}) {

  const isLoading = ({ readyState }) => {
    return some(map(readyState, rs => rs.loading));
  };

  const isReady = ({ readyState, ...props }) => {
    return every(map(readyState, (rs, k) => (
      props[k] !== void 0 && typeof rs.error === 'undefined'
    )));
  };

  return Component => class LoadingWrapper extends React.Component {
    static displayName = displayName('loading')(Component);

    render() {
      const ready = renderAnyway || isReady(this.props);
      const loading = isLoading(this.props);
      const readyState = { ready, loading };
      return React.cloneElement(wrapper, wrapperProps(readyState), [
        ready && <Component {...this.props} key='content' />,
        loading && React.cloneElement(loader, {
          key: 'loader', ...loaderProps(readyState)
        })
      ]);
    }
  };
}
