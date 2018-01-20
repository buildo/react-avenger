import React from 'react';
import pick from 'lodash/pick';
import mapValues from 'lodash/mapValues';
import PropTypes from 'prop-types';
import displayName from './displayName';

export const CommandsContextTypes = {
  commands: PropTypes.object
};

export default function declareCommands(ids) {
  return Component => {
    return class CommandsWrapper extends React.Component {
      static contextTypes = CommandsContextTypes;

      static displayName = displayName('commands')(Component);

      constructor(props, context) {
        super(props, context);

        if (process.env.NODE_ENV !== 'production') {
          ids.forEach(id => {
            if (!context.commands[id]) {
              console.warn('react-avenger:commands', `command '${id}' not found! commands declaration is: ${ids}`); // eslint-disable-line no-console
            }
          });
        }
      }

      componentWillMount() {
        this._commands = mapValues(pick(this.context.commands, ids), cmd => params => {
          return cmd({ ...this.props, ...params });
        });
      }

      render() {
        return <Component {...this.props} {...this._commands} />;
      }
    };
  };
}
