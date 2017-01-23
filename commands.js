import React from 'react';
import debug from 'debug';
import connect from 'state/connect'; // TODO(split)
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import t from 'tcomb';
import displayName from './displayName';

const warn = debug('react-avenger:commands');
warn.log = ::console.warn; // eslint-disable-line no-console

export const CommandsContextTypes = {
  commands: React.PropTypes.object
};

export default function commands(allCommands) {
  return (
    _ids: t.String|Array<t.String>, {
    // `pure` param for the `@connect` decoration
    // see `@connect` for more
    //
    // Boolean
    //
    pure = true
  } = {}) => {
    const ids = t.Arr.is(_ids) ? _ids : [_ids];
    if (process.env.NODE_ENV !== 'production') {
      ids.forEach(id => {
        if (!allCommands[id]) {
          warn(`command '${id}' not found! @commands declaration is: ${ids}`);
        }
      });
    }
    const connectDecl = ids.reduce((ac, k) => ({
      ...ac, ...allCommands[k].invalidateParams, ...(allCommands[k].params || {})
    }), {});
    const connectedProps = Object.keys(connectDecl).concat('transition');
    const decorator = Component => {
      return connect(connectDecl, {
        pure,
        // some params for commands cannot be retrieved implicitly from state!
        // still, we want all the others
        filterValid: false
      })(
        class CommandsWrapper extends React.Component {
          static contextTypes = CommandsContextTypes;

          static displayName = displayName('commands')(Component);

          componentWillMount() {
            this._commands = mapValues(pick(this.context.commands, ids), cmd => params => {
              return cmd({ ...pick(this.props, connectedProps), ...params });
            });
          }

          getProps() {
            // pass down everything except `transition`:
            // this makes `@queries` and `@commands` application commutative
            // but not wrt `@connect` (it should always be the innermost among these three)
            return omit(this.props, 'transition');
          }

          render() {
            return <Component {...this.getProps()} {...this._commands}/>;
          }
        }
      );
    };
    decorator.Type = {
      // we can't much better here (i.e. no `maybe`)
      // commands can have actual params that we'll never be able to retrieve
      // implicitly / before component own lifecycle
      ...mapValues(connectDecl, ty => t.maybe(ty)),
      ...ids.reduce((ac, k) => ({ ...ac, [k]: t.Function }), {})
    };
    return decorator;
  };
}
