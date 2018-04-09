/* global jest, describe, it, expect */
import * as React from 'react';
import declareCommands from './commands';
import { Command, Query } from 'avenger';
import * as t from 'io-ts';
import { mount } from 'enzyme';
import sleep from './sleep';

describe('declareCommands', () => {
  it('works', async () => {
    const doFoo = Command({ params: { token: t.string }, run: () => Promise.resolve() });
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithDoFoo = declareCommands({ doFoo })(render);
    const mounted = mount(<WithDoFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
  });

  it('runs a command forwarding all props', async () => {
    const fetch = jest.fn(({ token }) => Promise.resolve(token));
    const bar = Query({
      params: { token: t.string },
      fetch
    });

    const run = jest.fn(() => Promise.resolve());
    const doFoo = Command({
      dependencies: { bar },
      params: { foo: t.string },
      run
    });
    class C extends React.Component {
      componentDidMount() {
        this.props.doFoo();
        expect(Object.keys(this.props)).toEqual(['token', 'foo', 'doFoo']);
      }
      render() {
        return null;
      }
    }
    const WithDoFoo = declareCommands({ doFoo })(C);
    mount(<WithDoFoo token="token" foo="foo" />);
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0]).toEqual({ token: 'token' });
    await sleep(1000);
    expect(run.mock.calls.length).toBe(1);
    expect(run.mock.calls[0][0]).toEqual({ foo: 'foo', bar: 'token', token: 'token' });
  });
});
