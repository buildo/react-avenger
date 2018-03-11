import { Queries, Commands } from 'avenger';
import { ObjectOmit } from 'typelevel-ts';

type QueriesProps<Decl extends Queries> = { [k in keyof Decl]: Decl[k]['_A'] }[keyof Decl];

type QueriesInnerProps<Decl extends Queries> = {
  [k in keyof Decl]?: Decl[k]['_P']
} & {
  readyState: { [k in keyof Decl]: { loading: boolean, ready: boolean } }
};

type QueriesOuterProps<InnerProps extends {}, Decl extends Queries> = ObjectOmit<InnerProps, keyof Decl | 'readyState'> & QueriesProps<Decl>;

type DeclareQueriesReturn<Decl extends Queries> = (
  <InnerProps extends QueriesInnerProps<Decl>>(Component: React.ComponentType<InnerProps>) => React.ComponentType<QueriesOuterProps<InnerProps, Decl>>
) & { Props: QueriesInnerProps<Decl> };

export function declareQueries<Decl extends Queries>(declaration: Decl): DeclareQueriesReturn<Decl>

type CommandsProps<Decl extends Commands> = { [k in keyof Decl]: Partial<Decl[k]['_A']> }[keyof Decl];

type CommandsInnerProps<Decl extends Commands> = {
  // TODO: currently commands also automagically forward all props to every command invocation
  // thus `params: Decl[k]['_A']` is too strict
  [k in keyof Decl]: (params: Decl[k]['_A']) => Promise<Decl[k]['_P']>
};

type CommandsOuterProps<InnerProps extends {}, Decl extends Commands> = ObjectOmit<InnerProps, keyof Decl> & CommandsProps<Decl>;

type DeclareCommandsReturn<Decl extends Commands> = (
  <InnerProps extends CommandsInnerProps<Decl>>(Component: React.ComponentType<InnerProps>) => React.ComponentType<CommandsOuterProps<InnerProps, Decl>>
) & { Props: CommandsInnerProps<Decl> };

export function declareCommands<Decl extends Commands>(declaration: Decl): DeclareCommandsReturn<Decl>
