import * as React from 'react';
import declareQueries from './queries';
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

const sleep = (timeout) => new Promise(resolve => {
  setTimeout(resolve, timeout);
});

describe('declareQueries', () => {

  it('works', async () => {
    const { foo } = makeQueries();
    const render = jest.fn(JSON.stringify.bind(JSON));
    const WithFoo = declareQueries({ foo })(render);
    const mounted = mount(<WithFoo token='foo' />);
    expect(mounted).toMatchSnapshot();
    await sleep(10);
    expect(render.mock.calls.length).toBe(2);
    expect(render.mock.calls[0][0].readyState.foo).toEqual({ ready: false, loading: true });
    expect(render.mock.calls[0][0].foo).toBe(undefined);
    expect(render.mock.calls[1][0].readyState.foo).toEqual({ ready: true, loading: false });
    expect(render.mock.calls[1][0].foo).toBe('foo');
  });

});
