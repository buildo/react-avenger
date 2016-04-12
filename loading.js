import React from 'react';
import map from 'lodash/map';
import some from 'lodash/some';
import every from 'lodash/every';
import displayName from './displayName';

export default function loading({
  wrapper = <div />,
  loader = <div>loading...</div>
}) {

  const isLoading = ({ readyState }) => {
    return some(map(readyState, rs => rs.loading));
  };

  const isReady = ({ readyState, ...props }) => {
    return every(map(readyState, (rs, k) => props[k] !== void 0 && typeof rs.error === 'undefined'));
  };

  return Component => class LoadingWrapper extends React.Component {
    static displayName = displayName('loading')(Component);

    render() {
      const _isReady = isReady(this.props);
      return React.cloneElement(wrapper, {}, [
        _isReady && <Component {...this.props} key='content' />,
        isLoading(this.props) && React.cloneElement(loader, { key: 'loader', delay: _isReady ? 200 : 0 })
      ]);
    }
  };
}
