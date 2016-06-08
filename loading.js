import React from 'react';
import map from 'lodash/map';
import some from 'lodash/some';
import every from 'lodash/every';
import omit from 'lodash/omit';
import displayName from './displayName';

const _isLoading = ({ readyState }) => {
  return some(map(readyState, rs => rs.loading));
};

const _isReady = ({ readyState, ...props }) => {
  const rsWithoutLoading = omit(readyState, ['loading']);
  return every(map(rsWithoutLoading, (rs, k) => props[k] !== void 0));
};


export default function loading({
  isLoading = _isLoading,
  isReady = _isReady,
  wrapper = <div />,
  loader = <div>loading...</div>,
  loaderProps = () => ({}),
  wrapperProps = () => ({})
}) {

  return Component => class LoadingWrapper extends React.Component {
    static displayName = displayName('loading')(Component);

    render() {
      const ready = isReady(this.props);
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
