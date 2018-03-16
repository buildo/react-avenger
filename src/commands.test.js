/* global jest, describe, it, expect */
import * as React from 'react';
import declareCommands from './commands';
import { Command } from 'avenger';
import * as t from 'io-ts';
import { mount } from 'enzyme';

describe('declareCommands', () => {
  it('works', async () => {
    const doFoo = Command({ params: { token: t.string }, run: () => Promise.resolve() });
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithDoFoo = declareCommands({ doFoo })(render);
    const mounted = mount(<WithDoFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
  });

  it('runs a command forwarding all props', async () => {
    const run = jest.fn(Promise.resolve.bind(Promise));
    const doFoo = Command({
      params: { token: t.string, foo: t.string },
      run
    });
    class C extends React.Component {
      componentDidMount() {
        this.props.doFoo();
      }
      render() {
        return null;
      }
    }
    const WithDoFoo = declareCommands({ doFoo })(C);
    mount(<WithDoFoo token="foo" foo="bar" />);
    expect(run.mock.calls.length).toBe(1);
    expect(run.mock.calls[0][0]).toEqual({ token: 'foo', foo: 'bar' });
  });
});
