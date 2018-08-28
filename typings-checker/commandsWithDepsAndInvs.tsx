import { declareCommands } from '../src';
import { Command, QueryReturn } from 'avenger';
import * as React from 'react';
import * as t from 'io-ts';

declare const foo: QueryReturn<{ foo: string }, string>;
declare const bar: QueryReturn<{ bar: string }, string>;

const commandArgs = {
  invalidates: { foo },
  dependencies: { bar },
  params: { token: t.string },
  run: (({ token, bar }) => {}) as (params: { token: string; bar: string }) => Promise<void>
};
const doFoo = Command(commandArgs);

const withDoFoo = declareCommands({ doFoo });

// test the result type of declareCommands().Props
type WithDoFooProps = {
  doFoo: (
    params: {
      token: string;
      bar: string;
      foo: string;
    }
  ) => Promise<void>;
};
declare var withDoFooProps: WithDoFooProps;
withDoFooProps = withDoFoo.Props;

declare const C1: React.ComponentType<typeof withDoFoo.Props>;
const WithDoFoo = withDoFoo(C1);

<WithDoFoo foo={'foo'} token={'token'} bar={'bar'} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFoo token={10} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFoo foo={10} />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFoo bar={10} />;
