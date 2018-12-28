import * as React from 'react';
import { displayName } from './displayName';
import { runCommand } from 'avenger';
const mapValues = require('lodash/mapValues');

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
