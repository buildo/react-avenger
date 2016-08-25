import React from 'react';
import map from 'lodash/map';
import t from 'tcomb';
import some from 'lodash/some';
import displayName from './displayName';

const _isLoading = ({ readyState }) => {
  return some(map(readyState, rs => rs.loading));
};

const _isReady = ({ readyState, ...props }) => {
  for (const k in readyState) {
    if (k !== 'loading' && t.Nil.is(props[k])) {
      return false;
    }
  }
  return true;
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
          key: 'loader', delay: ready ? 200 : 0, ...loaderProps(readyState)
        })
      ]);
    }
  };
}
