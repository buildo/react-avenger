/* global jest, describe, it, expect */
import * as React from 'react';
import declareCommands from './commands';
import { Command } from 'avenger';
import * as t from 'io-ts';
import { mount } from 'enzyme';

const makeCommands = () => {
  const doFoo = Command({
    params: { token: t.string },
    run: () => Promise.resolve()
  });
  return { doFoo };
};

describe('declareCommands', () => {
  it('works', async () => {
    const { doFoo } = makeCommands();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithDoFoo = declareCommands({ doFoo })(render);
    const mounted = mount(<WithDoFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
  });
});
