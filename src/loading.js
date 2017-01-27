/* eslint-disable react/no-multi-comp */
import React from 'react';
import every from 'lodash/every';
import some from 'lodash/some';
import omit from 'lodash/omit';
import constant from 'lodash/constant';
import displayName from './displayName';

export const defaultIsLoading = ({ readyState }) => some(readyState, 'loading');

export const defaultIsReady = ({ readyState }) => every(readyState, 'ready');

export class NoWrapper extends React.Component { render = () => (this.props.children || [])[0] || null; }
export class NoLoader extends React.Component { render = () => null; }

export default function loading({
  isLoading = defaultIsLoading,
  isReady = defaultIsReady,
  wrapper = <NoWrapper />,
  loader = <NoLoader />,
  loaderProps = constant({}),
  wrapperProps = constant({})
} = {}) {

  return Component => class LoadingWrapper extends React.Component {

    static displayName = displayName('loading')(Component);

    render() {
      const ready = isReady(this.props);
      const loading = isLoading(this.props);
      const readyState = { ready, loading };
      return React.cloneElement(wrapper, wrapperProps(readyState), [
        ready && <Component {...omit(this.props, 'readyState')} key='content' />,
        loading && React.cloneElement(loader, {
          key: 'loader', ...loaderProps(readyState)
        })
      ]);
    }
  };
}

export const noLoaderLoading = loading();
