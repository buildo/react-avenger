import React from 'react';
import debug from 'debug';
import pick from 'lodash/pick';
import mapValues from 'lodash/mapValues';
import t from 'tcomb';
import displayName from './displayName';

const warn = debug('react-avenger:commands');
warn.log = ::console.warn; // eslint-disable-line no-console

export const CommandsContextTypes = {
  commands: React.PropTypes.object
};

export default function commands(allCommands) {
  return (ids) => {
    if (process.env.NODE_ENV !== 'production') {
      ids.forEach(id => {
        if (!allCommands[id]) {
          warn(`command '${id}' not found! @commands declaration is: ${ids}`);
        }
      });
    }

    const CommandParamsTypes = ids.reduce((ac, k) => ({
      ...ac, ...(allCommands[k].params || {})
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
          return <Component {...this.props} {...this._commands}/>;
        }
      };
    };

    // we can't do much better here (i.e. no `maybe`)
    // commands can have actual params that we'll never be able to retrieve
    // implicitly / before component own lifecycle
    decorator.InputType = mapValues(CommandParamsTypes, ty => t.maybe(ty));
    decorator.OutputType = ids.reduce((ac, k) => ({ ...ac, [k]: t.Function }), {});
    decorator.Type = { ...decorator.InputType, ...decorator.OutputType };

    return decorator;
  };
}
