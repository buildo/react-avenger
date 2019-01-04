/* all this code is liberally taken from @raveclassic great library "remote-data-ts" (https://github.com/devex-web-frontend/remote-data-ts) */

import { Function2, Function1, Lazy, toString } from 'fp-ts/lib/function';
import { Monad2 } from 'fp-ts/lib/Monad';
import { Foldable2 } from 'fp-ts/lib/Foldable';
import { Alt2 } from 'fp-ts/lib/Alt';
import { sequence, Traversable2 } from 'fp-ts/lib/Traversable';
import { array } from 'fp-ts/lib/Array';
import { HKT, HKT2, Type, Type2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Applicative } from 'fp-ts/lib/Applicative';

export const URI = 'RemoteData';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
  interface URI2HKT2<L, A> {
    RemoteData: RemoteData<L, A>;
  }
}

export class RemoteFailure<L, A> {
  readonly _tag: 'RemoteFailure' = 'RemoteFailure';
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;

  constructor(readonly error: L) {}

  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return fy;
  }

  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return fy();
  }

  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return fab.fold(fab, () => fab as any, () => this);
  }

  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return this as any;
  }

  fold<B>(pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return failure(this.error);
  }

  foldL<B>(pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
    return failure(this.error);
  }

  getOrElseL(f: Lazy<A>): A {
    return f();
  }

  map<B>(f: (a: A) => B): RemoteData<L, B> {
    return this as any;
  }

  mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
    return failure(f(this.error));
  }

  getOrElse(value: A): A {
    return value;
  }

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return b;
  }

  toString(): string {
    return `failure(${toString(this.error)})`;
  }
}

export class RemoteSuccess<L, A> {
  readonly _tag: 'RemoteSuccess' = 'RemoteSuccess';
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;

  constructor(readonly value: A) {}

  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return this;
  }

  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return this;
  }

  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return fab.fold(fab, () => fab as any, value => this.map(value));
  }

  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return f(this.value);
  }

  fold<B>(pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return success(this.value);
  }

  foldL<B>(pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
    return success(this.value);
  }

  getOrElseL(f: Lazy<A>): A {
    return this.value;
  }

  map<B>(f: Function1<A, B>): RemoteData<L, B> {
    return of(f(this.value));
  }

  mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
    return this as any;
  }

  getOrElse(value: A): A {
    return this.value;
  }

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return f(b, this.value);
  }
  toString(): string {
    return `success(${toString(this.value)})`;
  }
}

export class RemotePending<L, A> {
  readonly _tag: 'RemotePending' = 'RemotePending';
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;

  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return fy;
  }

  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return fy();
  }

  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return pending;
  }

  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return pending;
  }

  fold<B>(pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return pending;
  }

  foldL<B>(pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
    return pending();
  }

  map<B>(f: Function1<A, B>): RemoteData<L, B> {
    return this as any;
  }

  mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
    return pending;
  }

  getOrElse(value: A): A {
    return value;
  }

  getOrElseL(f: Lazy<A>): A {
    return f();
  }

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return b;
  }

  toString(): string {
    return 'pending';
  }
}

export type RemoteData<L, A> = RemoteFailure<L, A> | RemoteSuccess<L, A> | RemotePending<L, A>;

//Monad
const of = <L, A>(value: A): RemoteSuccess<L, A> => new RemoteSuccess(value);
const ap = <L, A, B>(fab: RemoteData<L, Function1<A, B>>, fa: RemoteData<L, A>): RemoteData<L, B> =>
  fa.ap(fab);
const map = <L, A, B>(fa: RemoteData<L, A>, f: Function1<A, B>): RemoteData<L, B> => fa.map(f);
const chain = <L, A, B>(
  fa: RemoteData<L, A>,
  f: Function1<A, RemoteData<L, B>>
): RemoteData<L, B> => fa.chain(f);

//Foldable
const reduce = <L, A, B>(fa: RemoteData<L, A>, b: B, f: Function2<B, A, B>): B => fa.reduce(f, b);

//Traversable
function traverse<F extends URIS2>(
  F: Applicative<F>
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT2<F, L, B>>) => Type2<F, L, RemoteData<L, B>>;
function traverse<F extends URIS>(
  F: Applicative<F>
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT<F, B>>) => Type<F, RemoteData<L, B>>;
function traverse<F>(
  F: Applicative<F>
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT<F, B>>) => HKT<F, RemoteData<L, B>>;
function traverse<F>(
  F: Applicative<F>
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT<F, B>>) => HKT<F, RemoteData<L, B>> {
  return (ta, f) => ta.fold(F.of(ta as any), () => F.of(ta as any), value => F.map(f(value), of));
}

//Alt
const alt = <L, A>(fx: RemoteData<L, A>, fy: RemoteData<L, A>): RemoteData<L, A> => fx.alt(fy);

//constructors
export const failure = <L, A>(error: L): RemoteData<L, A> => new RemoteFailure(error);
export const success: <L, A>(value: A) => RemoteData<L, A> = of;
export const pending: RemoteData<never, never> = new RemotePending<never, never>();

//instance
export const remoteData: Monad2<URI> & Foldable2<URI> & Traversable2<URI> & Alt2<URI> = {
  //HKT
  URI,

  //Monad
  of,
  ap,
  map,
  chain,

  //Foldable
  reduce,

  //Traversable
  traverse,

  //Alt
  alt
};

export function combine<A, L>(a: RemoteData<L, A>): RemoteData<L, [A]>;
export function combine<A, B, L>(a: RemoteData<L, A>, b: RemoteData<L, B>): RemoteData<L, [A, B]>;
export function combine<A, B, C, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>
): RemoteData<L, [A, B, C]>;
export function combine<A, B, C, D, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>,
  d: RemoteData<L, D>
): RemoteData<L, [A, B, C, D]>;
export function combine<A, B, C, D, E, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>,
  d: RemoteData<L, D>,
  e: RemoteData<L, E>
): RemoteData<L, [A, B, C, D, E]>;
export function combine<A, B, C, D, E, F, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>,
  d: RemoteData<L, D>,
  e: RemoteData<L, E>,
  f: RemoteData<L, F>
): RemoteData<L, [A, B, C, D, E, F]>;
export function combine<T, L>(...list: RemoteData<L, T>[]): RemoteData<L, T[]> {
  if (list.length === 0) {
    return of([]);
  }
  return sequence(remoteData, array)(list);
}
