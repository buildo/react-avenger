import * as React from 'react';
import { declareQueries } from '../src';
import { Query } from 'avenger';
import * as t from 'io-ts';
import { mount } from 'enzyme';

const makeQueries = () => {
  const foo = Query({
    params: { token: t.string },
    fetch: ({ token }) => Promise.resolve(token)
  });
  return { foo };
};

const sleep = (timeout: number) =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });

describe('declareQueries', () => {
  it('works', async () => {
    const { foo } = makeQueries();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithFoo = declareQueries({ foo })(render as any);
    const mounted = mount(<WithFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
    await sleep(10);
    expect(render.mock.calls.length).toBe(2);
    expect(render.mock.calls[0][0].foo._tag).toBe('RemotePending');
    expect(render.mock.calls[1][0].foo._tag).toBe('RemoteSuccess');
    expect(render.mock.calls[1][0].foo.value).toBe('foo');
  });

  it('works with querySync', async () => {
    const { foo } = makeQueries();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithFoo = declareQueries({ foo }, { querySync: true })(render as any);
    mount(<WithFoo token="foo" />);
    await sleep(10);
    const mounted = mount(<WithFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
    expect(render.mock.calls.length).toBe(3);
    expect(render.mock.calls[2][0].foo.value).toBe('foo');
  });
});
