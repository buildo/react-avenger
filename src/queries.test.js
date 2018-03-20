/* global jest, describe, it, expect */
import * as React from 'react';
import declareQueries from './queries';
import { Query, invalidate } from 'avenger';
import * as t from 'io-ts';
import { mount } from 'enzyme';

const makeQueries = () => {
  const foo = Query({
    params: { token: t.string },
    fetch: ({ token }) => Promise.resolve(token)
  });
  return { foo };
};

const sleep = timeout =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });

describe('declareQueries', () => {
  it('works', async () => {
    const { foo } = makeQueries();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithFoo = declareQueries({ foo })(render);
    const mounted = mount(<WithFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
    await sleep(10);
    expect(render.mock.calls.length).toBe(2);
    expect(render.mock.calls[0][0].foo.ready).toBe(false);
    expect(render.mock.calls[0][0].foo.loading).toBe(true);
    expect(render.mock.calls[0][0].foo.value).toBe(undefined);
    expect(render.mock.calls[1][0].foo.ready).toBe(true);
    expect(render.mock.calls[1][0].foo.loading).toBe(false);
    expect(render.mock.calls[1][0].foo.value).toBe('foo');
  });

  it('works with querySync', async () => {
    const { foo } = makeQueries();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithFoo = declareQueries({ foo }, { querySync: true })(render);
    mount(<WithFoo token="foo" />);
    await sleep(10);
    const mounted = mount(<WithFoo token="foo" />);
    expect(mounted).toMatchSnapshot();
    expect(render.mock.calls.length).toBe(3);
    expect(render.mock.calls[2][0].foo.ready).toBe(true);
    expect(render.mock.calls[2][0].foo.loading).toBe(false);
    expect(render.mock.calls[2][0].foo.value).toBe('foo');
  });

  it('invalidating a near-sync query, the default debouncing avoids a rerender with ready=false', async () => {
    const { foo } = makeQueries();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithFoo = declareQueries({ foo })(render);
    mount(<WithFoo token="foo" />);
    await sleep(10);
    expect(render.mock.calls.length).toBe(2);
    invalidate({ foo }, { token: 'foo' });
    await sleep(10);
    const newCalls = render.mock.calls.slice(1);
    expect(newCalls.length).toBe(2);
    const alwaysReady = newCalls.every(call => call[0].foo.ready);
    expect(alwaysReady).toBe(true);
  });
});
