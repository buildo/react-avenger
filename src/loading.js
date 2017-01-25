import React from 'react';
import every from 'lodash/every';
import some from 'lodash/some';
import omit from 'lodash/omit';
import constant from 'lodash/constant';
import displayName from './displayName';

const defaultIsLoading = ({ readyState }) => some(readyState, 'loading');

const defaultIsReady = ({ readyState }) => every(readyState, 'ready');

export default function loading({
  isLoading = defaultIsLoading,
  isReady = defaultIsReady,
  wrapper = <div />,
  loader = <div>loading...</div>,
  loaderProps = constant({}),
  wrapperProps = constant({})
}) { // todo `add = {}`` i.e. default empty config, so that it can be used like this: `@loading()` instead than `@loading({})`

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
