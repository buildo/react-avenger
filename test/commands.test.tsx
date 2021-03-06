import * as React from 'react';
import { declareCommands } from '../src';
import { Command, Query, available } from 'avenger';
import * as t from 'io-ts';
import { mount } from 'enzyme';
import sleep from './sleep';

describe('declareCommands', () => {
  it('works', async () => {
    const doFoo = Command({ params: { token: t.string }, run: () => Promise.resolve() });
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithDoFoo = declareCommands({ doFoo })(render as any);
    const mounted = mount(<WithDoFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
  });

  it('runs a command forwarding all props', async () => {
    const run = jest.fn<any, any[]>(Promise.resolve.bind(Promise));
    const doFoo = Command({
      params: { token: t.string, foo: t.string },
      run
    });
    const withDoFooCommands = declareCommands({ doFoo });
    class C extends React.Component<typeof withDoFooCommands.Props> {
      componentDidMount() {
        // @ts-ignore (doFoo automatically forwards this.props, but TS does not know that)
        this.props.doFoo();
      }
      render() {
        return null;
      }
    }
    const WithDoFoo = withDoFooCommands(C);
    mount(<WithDoFoo token="foo" foo="bar" />);
    expect(run.mock.calls.length).toBe(1);
    expect(run.mock.calls[0][0]).toEqual({ token: 'foo', foo: 'bar' });
  });

  it('runs a command with invalidations and dependencies forwarding all props', async () => {
    const fetchFoo = jest.fn(({ fooParam }) => Promise.resolve(fooParam));
    const foo = Query({
      params: { fooParam: t.string },
      cacheStrategy: available,
      fetch: fetchFoo
    });
    const bar = Query({
      params: { barParam: t.string },
      cacheStrategy: available,
      fetch: ({ barParam }) => Promise.resolve(barParam)
    });

    const run = jest.fn(({ token, foo }) => {
      expect(token).toBe('token');
      expect(foo).toBe('foo');
      return Promise.resolve();
    });
    const doFoo = Command({
      invalidates: { bar },
      dependencies: { foo },
      params: { token: t.string },
      run
    });
    const withDoFooCommands = declareCommands({ doFoo });

    class C extends React.Component<typeof withDoFooCommands.Props> {
      componentDidMount() {
        // @ts-ignore (doFoo automatically forwards this.props, but TS does not know that)
        this.props.doFoo();
        expect(Object.keys(this.props)).toEqual(['token', 'fooParam', 'barParam', 'doFoo']);
      }
      render() {
        return null;
      }
    }
    const WithDoFoo = withDoFooCommands(C);
    mount(<WithDoFoo token="token" fooParam="foo" barParam="bar" />);
    expect(fetchFoo.mock.calls.length).toBe(1);
    expect(fetchFoo.mock.calls[0][0]).toEqual({ fooParam: 'foo' });
    await sleep(10);
    expect(run.mock.calls.length).toBe(1);
    expect(run.mock.calls[0][0]).toEqual({
      foo: 'foo',
      token: 'token',
      // dependencies and invalidations params also passed to run as params, currently
      fooParam: 'foo',
      barParam: 'bar'
    });
  });
});
