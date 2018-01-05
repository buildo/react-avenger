import React from 'react';
import pick from 'lodash/pick';
import mapValues from 'lodash/mapValues';
import PropTypes from 'prop-types';
import * as t from 'io-ts';
import displayName from './displayName';

export const CommandsContextTypes = {
  commands: PropTypes.object
};

export default function commands(allCommands) {
  return (ids) => {
    if (process.env.NODE_ENV !== 'production') {
      ids.forEach(id => {
        if (!allCommands[id]) {
          console.warn('react-avenger:commands', `command '${id}' not found! @commands declaration is: ${ids}`); // eslint-disable-line no-console
        }
      });
    }

    const CommandParamsTypes = ids.reduce((ac, k) => ({
      ...ac, ...allCommands[k].invalidateParams
    }), {});

    const decorator = Component => {
      return class CommandsWrapper extends React.Component {
        static contextTypes = CommandsContextTypes;

        static displayName = displayName('commands')(Component);

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

    // we can't do much better here (i.e. no `maybe`)
    // commands can have actual params that we'll never be able to retrieve
    // implicitly / before component own lifecycle
    // TODO: consider doing this in react-container itself?
    decorator.InputType = mapValues(CommandParamsTypes, type => t.union([type, t.undefined]));

    decorator.OutputType = ids.reduce((ac, k) => ({ ...ac, [k]: t.Function }), {});
    decorator.Type = { ...decorator.InputType, ...decorator.OutputType };

    return decorator;
  };
}
