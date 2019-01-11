import { declareQueries, declareCommands } from '../src';
import { QueryReturn } from 'avenger';
import * as React from 'react';
import { RemoteData } from '../src/RemoteData';

// case 1: a declaration containing a single query

declare const foo: QueryReturn<{ token: string }, string>;
const withFoo = declareQueries({ foo });

// $ExpectError Type '"QueryReturn"' is not assignable to type '"CommandReturn"'.
const withFooWrong = declareCommands({ foo });

// test the result type of declareQueries().Props
type WithFooProps = {
  foo: RemoteData<unknown, string>;
};
declare var withFooProps: WithFooProps;
withFooProps = withFoo.Props;

declare type C1Props = { bar: number } & typeof withFoo.Props;
declare const C1: React.ComponentType<C1Props>;
const WithFoo = withFoo(C1);

// $ExpectError Property 'bar' is missing in type '{}' but required in type 'Pick<C1Props, "bar">'.
<WithFoo />;

// $ExpectError Property 'token' is missing in type '{ bar: number; }' but required in type '{ token: string; }'.
<WithFoo bar={10} />;

<WithFoo bar={10} token="foo" />;

// case 2: a declaration containing multiple queries with "conflicting" params

declare const bar: QueryReturn<{ token: string }, number>;
const withFooAndBar = declareQueries({ foo, bar });

// test the result type of declareQueries().Props
type WithFooAndBarProps = {
  foo: RemoteData<unknown, string>;
  bar: RemoteData<unknown, number>;
};
declare var withFooAndBarProps: WithFooAndBarProps;
withFooAndBarProps = withFooAndBar.Props;

declare const C2: React.ComponentType<typeof withFooAndBar.Props>;
const WithFooAndBar = withFooAndBar(C2);

// $ExpectError Property 'token' is missing in type '{}' but required in type '{ token: string; }'.
<WithFooAndBar />;

<WithFooAndBar token="bar" />;

// case 3: a declaration containing multiple queries with "non-conflicting" params

declare const baz: QueryReturn<{ token2: string }, number>;
const withFooAndBaz = declareQueries({ foo, baz });

declare const C3: React.ComponentType<typeof withFooAndBaz.Props>;
const WithFooAndBaz = withFooAndBaz(C3);

// $ExpectError Property 'token2' is missing in type '{ token: string; }' but required in type '{ token2: string; }'.
<WithFooAndBaz token="token" />;
// $ExpectError Property 'token' is missing in type '{ token2: string; }' but required in type '{ token: string; }'.
<WithFooAndBaz token2="token2" />;
<WithFooAndBaz token="token" token2="token2" />;
