import React from 'react';
import mapValues from 'lodash/mapValues';
import displayName from './displayName';
import { runCommand } from 'avenger';

export default function declareCommands(commands) {
  return Component => {
    return class CommandsWrapper extends React.Component {
      static displayName = displayName('commands')(Component);

      componentWillMount() {
        this._commands = mapValues(commands, cmd => params => {
          return runCommand(cmd, { ...this.props, ...params });
        });
      }

      render() {
        return <Component {...this.props} {...this._commands} />;
      }
    };
  };
}
