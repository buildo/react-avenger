import { QueryReturn, Commands, FlattenObject } from 'avenger';

export type mixed = object | number | string | boolean | symbol | null;

type ObjectOmit<A extends object, K extends string | number | symbol> = Pick<
  A,
  Exclude<keyof A, K>
>;

type Queries = { [k: string]: QueryReturn<any, mixed> };

type QueriesProps<Decl extends Queries> = FlattenObject<{ [k in keyof Decl]: Decl[k]['_A'] }>;

type QueriesInnerProps<Decl extends Queries> = {
  [k in keyof Decl]: (
    | {
        ready: false;
      }
    | {
        ready: true;
        value: Decl[k]['_P'];
      }) & {
    loading: boolean;
  }
};

type QueriesOuterProps<InnerProps extends {}, Decl extends Queries> = ObjectOmit<
  InnerProps,
  keyof Decl
> &
  QueriesProps<Decl>;

type DeclareQueriesReturn<Decl extends Queries> = (<InnerProps extends QueriesInnerProps<Decl>>(
  Component: React.ComponentType<InnerProps>
) => React.ComponentType<QueriesOuterProps<InnerProps, Decl>>) & { Props: QueriesInnerProps<Decl> };

type DeclareQueriesOptions = {
  querySync?: boolean;
};

export function declareQueries<Decl extends Queries>(
  declaration: Decl,
  options?: DeclareQueriesOptions
): DeclareQueriesReturn<Decl>;

type CommandsProps<Decl extends Commands> = FlattenObject<
  { [k in keyof Decl]: Partial<Decl[k]['_A']> }
>;

type CommandsInnerProps<Decl extends Commands> = {
  // TODO: currently commands also automagically forward all props to every command invocation
  // thus `params: Decl[k]['_A']` is too strict
  [k in keyof Decl]: (params: Decl[k]['_A']) => Promise<Decl[k]['_P']>
};

type CommandsOuterProps<InnerProps extends {}, Decl extends Commands> = ObjectOmit<
  InnerProps,
  keyof Decl
> &
  CommandsProps<Decl>;

type DeclareCommandsReturn<Decl extends Commands> = (<InnerProps extends CommandsInnerProps<Decl>>(
  Component: React.ComponentType<InnerProps>
) => React.ComponentType<CommandsOuterProps<InnerProps, Decl>>) & {
  Props: CommandsInnerProps<Decl>;
};

export function declareCommands<Decl extends Commands>(
  declaration: Decl
): DeclareCommandsReturn<Decl>;
