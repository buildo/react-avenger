import { declareCommands, declareQueries } from '../src';
import {
  Command,
  Query,
  QueryReturn
} from 'avenger';
import * as React from 'react';
import * as t from 'io-ts';

const bar = Query({
  params: { barParam: t.string },
  fetch: async ({ barParam }) => (barParam)
});

const foo = Query({
  params: { fooParam: t.string },
  dependencies: { bar },
  fetch: async ({ fooParam, bar }) => (`${fooParam}${bar}`)
});

const fooBar = Query({
  params: { fooBarParam: t.string },
  fetch: async ({ fooBarParam }) => (fooBarParam)
});

const doFoo = Command({
  invalidates: { bar },
  dependencies: { fooBar },
  params: { token: t.string },
  run: async ({ token, fooBar }) => {}
});

// test the result type of declareQueries().Props
type WithFooProps = {
  foo: (
    | {
        ready: false;
      }
    | {
        ready: true;
        value: string;
      }) & {
    loading: boolean;
  };
};
declare var withFooProps: WithFooProps;

// test the result type of declareCommands().Props
type WithDoFooProps = {
  doFoo: (
    params: {
      token: string;
      barParam: string;
      fooBarParam: string;
    }
  ) => Promise<void>;
};
declare var withDoFooProps: WithDoFooProps;

const queries = declareQueries({ foo });
const commands = declareCommands({ doFoo });

withFooProps = queries.Props;
withDoFooProps = commands.Props;

type Props = typeof commands.Props & typeof queries.Props
declare const C1: React.ComponentType<Props>;

const WithFooDoFoo = commands(queries(C1));
const WithDoFooFoo = queries(commands(C1));

<WithFooDoFoo fooParam={'foo'} token={'token'} barParam={'bar'} fooBarParam={'asdasd'} />;
<WithDoFooFoo fooParam={'foo'} token={'token'} barParam={'bar'} fooBarParam={'asdasd'} />;

<WithFooDoFoo fooParam={'foo'} barParam={'bar'} fooBarParam={'asdasd'} />;
<WithDoFooFoo fooParam={'foo'} barParam={'bar'} fooBarParam={'asdasd'} />;

// $ExpectError Property 'barParam' is missing in type '{ fooParam: string; fooBarParam: string; }'.
<WithFooDoFoo fooParam={'foo'} fooBarParam={'asdasd'} />;
<WithDoFooFoo fooParam={'foo'} fooBarParam={'asdasd'} />;

// $ExpectError Property 'fooParam' is missing in type '{ barParam: string; fooBarParam: string; }'.
<WithFooDoFoo barParam={'bar'} fooBarParam={'asdasd'} />;
<WithDoFooFoo barParam={'bar'} fooBarParam={'asdasd'} />;

// $ExpectError Property 'fooBarParam' is missing in type '{ fooParam: string; barParam: string; }'.
<WithFooDoFoo fooParam={'foo'} barParam={'bar'} />;
<WithDoFooFoo fooParam={'foo'} barParam={'bar'} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFooFoo token={10} />;
<WithFooDoFoo token={10} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFooFoo fooParam={10} />;
<WithFooDoFoo fooParam={10} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFooFoo barParam={10} />;
<WithFooDoFoo barParam={10} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFooFoo fooBarParam={10} />;
<WithFooDoFoo fooBarParam={10} />;

