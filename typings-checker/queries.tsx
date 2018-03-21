import { declareQueries } from '../src';
import { QueryReturn } from 'avenger';
import * as React from 'react';

// case 1: a declaration containing a single query

declare const foo: QueryReturn<{ token: string }, string>;
const withFoo = declareQueries({ foo });

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
withFooProps = withFoo.Props;

declare type C1Props = { bar: number } & typeof withFoo.Props;
declare const C1: React.ComponentType<C1Props>;
const WithFoo = withFoo(C1);

// $ExpectError Property 'bar' is missing in type '{}'.
<WithFoo />;

// $ExpectError Property 'token' is missing in type '{ bar: number; }'.
<WithFoo bar={10} />;

<WithFoo bar={10} token="foo" />;

// case 2: a declaration containing multiple queries with "conflicting" params

declare const bar: QueryReturn<{ token: string }, number>;
const withFooAndBar = declareQueries({ foo, bar });

// test the result type of declareQueries().Props
type WithFooAndBarProps = {
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
  bar: (
    | {
        ready: false;
      }
    | {
        ready: true;
        value: number;
      }) & {
    loading: boolean;
  };
};
declare var withFooAndBarProps: WithFooAndBarProps;
withFooAndBarProps = withFooAndBar.Props;

declare const C2: React.ComponentType<typeof withFooAndBar.Props>;
const WithFooAndBar = withFooAndBar(C2);

// $ExpectError Property 'token' is missing in type '{}'.
<WithFooAndBar />;

<WithFooAndBar token="bar" />;

// case 3: a declaration containing multiple queries with "non-conflicting" params

declare const baz: QueryReturn<{ token2: string }, number>;
const withFooAndBaz = declareQueries({ foo, baz });

declare const C3: React.ComponentType<typeof withFooAndBaz.Props>;
const WithFooAndBaz = withFooAndBaz(C3);

// this is not an error at the moment :(
<WithFooAndBaz token="token" />;
// this is not an error at the moment :(
<WithFooAndBaz token2="token2" />;
<WithFooAndBaz token="token" token2="token2" />;
