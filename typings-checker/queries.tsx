import { declareQueries } from '../src';
import { QueryReturn } from 'avenger';
import * as React from 'react';

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
