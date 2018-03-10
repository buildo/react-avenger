import { declareQueries } from '../src';
import { QueryReturn } from 'avenger';
import * as React from 'react';

declare const C1: React.ComponentType<{ foo: string, bar: number }>;
declare const foo: QueryReturn<{ token: string }, string>;

const withFoo = declareQueries({ foo });

type WithFooProps = {
  foo?: string;
  readyState: {
    foo: { loading: boolean; ready: boolean; }
  }
};
declare var withFooProps: WithFooProps;
withFooProps = withFoo.Props;

const WithFoo = withFoo(C1);

// $ExpectError Property 'bar' is missing in type '{}'.
<WithFoo />;

// $ExpectError Property 'token' is missing in type '{ bar: number; }'.
<WithFoo bar={10} />;

<WithFoo bar={10} token='foo' />;

declare const bar: QueryReturn<{ token: string }, number>;

const withFooAndBar = declareQueries({ foo, bar });

type WithFooAndBarProps = {
  foo?: string;
  bar?: number;
  readyState: {
    foo: { loading: boolean; ready: boolean };
    bar: { loading: boolean; ready: boolean };
  };
};
declare var withFooAndBarProps: WithFooAndBarProps;
withFooAndBarProps = withFooAndBar.Props;

const WithFooAndBar = withFooAndBar(C1);

// $ExpectError Property 'token' is missing in type '{}'.
<WithFooAndBar />;

<WithFooAndBar token='bar' />;
