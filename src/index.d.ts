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

export function declareQueries<Decl extends Queries>(declaration: Decl): DeclareQueriesReturn<Decl>;
