import {
  constFalse,
  Function2,
  Function1,
  Lazy,
  toString,
  Predicate,
  identity
} from 'fp-ts/lib/function';
import { Monad2 } from 'fp-ts/lib/Monad';
import { Foldable2 } from 'fp-ts/lib/Foldable';
import { Alt2 } from 'fp-ts/lib/Alt';
import { Extend2 } from 'fp-ts/lib/Extend';
import { sequence, Traversable2 } from 'fp-ts/lib/Traversable';
import { isNone, none, Option, some } from 'fp-ts/lib/Option';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import { Setoid } from 'fp-ts/lib/Setoid';

import { array } from 'fp-ts/lib/Array';

import { HKT, HKT2, Type, Type2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Applicative } from 'fp-ts/lib/Applicative';
import { Alternative2 } from 'fp-ts/lib/Alternative';
import { Ord } from 'fp-ts/lib/Ord';
import { sign } from 'fp-ts/lib/Ordering';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Monoidal2 } from 'fp-ts/lib/Monoidal';

export const URI = 'RemoteData';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
  interface URI2HKT2<L, A> {
    RemoteData: RemoteData<L, A>;
  }
}

export type RemoteProgress = {
  loaded: number;
  total: Option<number>;
};
const concatPendings = <L, A>(a: RemotePending<L, A>, b: RemotePending<L, A>): RemoteData<L, A> => {
  if (a.progress.isSome() && b.progress.isSome()) {
    const progressA = a.progress.value;
    const progressB = b.progress.value;
    if (progressA.total.isNone() || progressB.total.isNone()) {
      return progress({
        loaded: progressA.loaded + progressB.loaded,
        total: none
      });
    }
    const totalA = progressA.total.value;
    const totalB = progressB.total.value;
    const total = totalA + totalB;
    const loaded = (progressA.loaded * totalA + progressB.loaded * totalB) / (total * total);
    return progress({
      loaded,
      total: some(total)
    });
  }
  const noA = a.progress.isNone();
  const noB = b.progress.isNone();
  if (noA && !noB) {
    return b;
  }
  if (!noA && noB) {
    return a;
  }
  return pending;
};

export class RemoteInitial<L, A> {
  readonly _tag: 'RemoteInitial' = 'RemoteInitial';
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;
  /**
   * we put a progress equal to none in order to treat `RemoteInitial` as a
   * `RemotePending` with no progress
   */
  readonly progress: Option<RemoteProgress> = none;

  /**
   * `alt` short for alternative, takes another `RemoteData`.
   * If `this` `RemoteData` is a `RemoteSuccess` type then it will be returned.
   * If it is a "Left" part then it will return the next `RemoteSuccess` if it exist.
   * If both are "Left" parts then it will return next "Left" part.
   *
   * For example:
   *
   * `sucess(1).alt(initial) will return success(1)`
   *
   * `pending.alt(success(2) will return success(2)`
   *
   * `failure(new Error('err text')).alt(pending) will return pending`
   */
  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return fy;
  }

  /**
   * Similar to `alt`, but lazy: it takes a function which returns `RemoteData` object.
   */
  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return fy();
  }

  /**
   * `ap`, short for "apply". Takes a function `fab` that is in the context of `RemoteData`,
   * and applies that function to this `RemoteData`'s value.
   * If the `RemoteData` calling `ap` is "Left" part it will return same "Left" part.
   * If you pass "Left" part to `ap` as an argument, it will return same "Left" part regardless on `RemoteData` which calls `ap`.
   *
   * For example:
   *
   * `success(1).ap(success(x => x + 1)) will return success(2)`.
   *
   * `success(1).ap(initial) will return initial`.
   *
   * `pending.ap(success(x => x+1)) will return pending`.
   *
   * `failure(new Error('err text')).ap(initial) will return initial.`
   */
  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return initial;
  }

  /**
   * Takes a function `f` and returns a result of applying it to `RemoteData` value.
   * It's a bit like a `map`, but `f` should returns `RemoteData<T>` instead of `T` in `map`.
   * If this `RemoteData` is "Left" part, then it will return the same "Left" part.
   *
   * For example:
   *
   * `success(1).chain(x => success(x + 1)) will return success(2)`
   *
   * `success(2).chain(() => pending) will return pending`
   *
   * `initial.chain(x => success(x)) will return initial`
   */
  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return initial;
  }

  /**
   * Takes a function `f` and returns a result of applying it to `RemoteData`.
   * It's a bit like a `chain`, but `f` should takes `RemoteData<T>` instead of returns it, and it should return T instead of takes it.
   */
  extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
    return initial;
  }

  /**
   * Needed for "unwrap" value from `RemoteData` "container".
   * It applies a function to each case in the data structure.
   *
   * For example:
   *
   * `const foldInitialOrPending = 'it's pending or initial'
   * `const foldFailure = (err) => 'it's failure'
   * `const foldSuccess = (data) => data + 1'
   *
   * `initial.fold(foldInitialOrPending, foldFailure, foldSuccess) will return 'it's initial'`
   *
   * `pending.fold(foldInitialOrPending, foldFailure, foldSuccess) will return 'it's pending'`
   *
   * `failure(new Error('error text')).fold(foldInitialOrPending, foldFailure, foldSuccess) will return 'it's failure'`
   *
   * `success(21).fold(foldInitialOrPending, foldFailure, foldSuccess) will return 22`
   */
  fold<B>(initialOrpending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return initialOrpending;
  }

  /**
   * Same as `fold` but lazy: in `initial` and `pending` state it takes a function instead of value.
   *
   * For example:
   *
   * `const foldInitialOrPending = () => 'it's pending or initial'
   *
   * rest of example is similar to `fold`
   */
  foldL<B>(
    initialOrpending: Function1<Option<RemoteProgress>, B>,
    failure: Function1<L, B>,
    success: Function1<A, B>
  ): B {
    return initialOrpending(none);
  }

  /**
   * Same as `getOrElse` but lazy: it pass as an argument a function which returns a default value.
   *
   * For example:
   *
   * `some(1).getOrElse(() => 999) will return 1`
   *
   * `initial.getOrElseValue(() => 999) will return 999`
   */
  getOrElseL(f: Lazy<A>): A {
    return f();
  }

  /**
   * Takes a function `f`.
   * If it maps on `RemoteSuccess` then it will apply a function to `RemoteData`'s value
   * If it maps on "Left" part then it will return the same "Left" part.
   *
   * For example:
   *
   * `success(1).map(x => x + 99) will return success(100)`
   *
   * `initial.map(x => x + 99) will return initial`
   *
   * `pending.map(x => x + 99) will return pending`
   *
   * `failure(new Error('error text')).map(x => x + 99) will return failure(new Error('error text')`
   */
  map<B>(f: Function1<A, B>): RemoteData<L, B> {
    return initial;
  }

  /**
   * Similar to `map`, but it only map a `RemoteFailure` ("Left" part where we have some data, so we can map it).
   *
   * For example:
   *
   * `success(1).map(x => 'new error text') will return success(1)`
   *
   * `initial.map(x => 'new error text') will return initial`
   *
   * `failure(new Error('error text')).map(x => 'new error text') will return failure(new Error('new error text'))`
   */
  mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
    return initial;
  }

  /**
   * Takes a default value as an argument.
   * If this `RemoteData` is "Left" part it will return default value.
   * If this `RemoteData` is `RemoteSuccess` it will return it's value ("wrapped" value, not default value)
   *
   * Note: Default value should be the same type as `RemoteData` (internal) value, if you want to pass different type as default, use `fold` or `foldL`.
   *
   * For example:
   *
   * `some(1).getOrElse(999) will return 1`
   *
   * `initial.getOrElseValue(999) will return 999`
   *
   */
  getOrElse(value: A): A {
    return value;
  }

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return b;
  }

  /**
   * Returns true only if `RemoteData` is `RemotePending` or `RemoteInitial`.
   *
   */
  isPending(): this is RemotePending<L, A> {
    return true;
  }

  /**
   * Returns true only if `RemoteData` is `RemoteFailure`.
   *
   */
  isFailure(): this is RemoteFailure<L, A> {
    return false;
  }

  /**
   * Returns true only if `RemoteData` is `RemoteSuccess`.
   *
   */
  isSuccess(): this is RemoteSuccess<L, A> {
    return false;
  }

  /**
   * Convert `RemoteData` to `Option`.
   * "Left" part will be converted to `None`.
   * `RemoteSuccess` will be converted to `Some`.
   *
   * For example:
   *
   * `success(2).toOption() will return some(2)`
   *
   * `initial.toOption() will return none`
   *
   * `pending.toOption() will return none`
   *
   * `failure(new Error('error text')).toOption() will return none`
   */
  toOption(): Option<A> {
    return none;
  }

  /**
   * Convert `RemoteData` to `Either`.
   * "Left" part will be converted to `Left<L>`.
   * Since `RemoteInitial` and `RemotePending` do not have `L` values,
   * you must provide a value of type `L` that will be used to construct
   * the `Left<L>` for those two cases.
   * `RemoteSuccess` will be converted to `Right<R>`.
   *
   * For example:
   *
   * `const iError = new Error('Data not fetched')`
   * `const pError = new Error('Data is fetching')`
   *
   * `success(2).toEither(iError, pError) will return right(2)`
   *
   * `initial.toEither(iError, pError) will return right(Error('Data not fetched'))`
   *
   * `pending.toEither(iError, pError) will return right(Error('Data is fetching'))`
   *
   * `failure(new Error('error text')).toEither(iError, pError) will return right(Error('error text'))`
   */
  toEither(initialOrpending: L): Either<L, A> {
    return left(initialOrpending);
  }

  /**
   * Like `toEither`, but lazy: it takes functions that return an `L` value
   * as arguments instead of an `L` value.
   *
   * For example:
   *
   * `const iError = () => new Error('Data not fetched')`
   * `const pError = () => new Error('Data is fetching')`
   *
   * `initial.toEither(iError, pError) will return right(Error('Data not fetched'))`
   *
   * `pending.toEither(iError, pError) will return right(Error('Data is fetching'))`
   */
  toEitherL(initialOrPending: Lazy<L>): Either<L, A> {
    return left(initialOrPending());
  }

  /**
   * One more way to fold (unwrap) value from `RemoteData`.
   * "Left" part will return `null`.
   * `RemoteSuccess` will return value.
   *
   * For example:
   *
   * `success(2).toNullable() will return 2`
   *
   * `initial.toNullable() will return null`
   *
   * `pending.toNullable() will return null`
   *
   * `failure(new Error('error text)).toNullable() will return null`
   *
   */
  toNullable(): A | null {
    return null;
  }

  /**
   * Returns string representation of `RemoteData`.
   */
  toString(): string {
    return 'initial';
  }

  /**
   * Compare values and returns `true` if they are identical, otherwise returns `false`.
   * "Left" part will return `false`.
   * `RemoteSuccess` will call `Setoid`'s `equals` method.
   *
   * If you want to compare `RemoteData`'s values better use `getSetoid` or `getOrd` helpers.
   *
   */
  contains(S: Setoid<A>, a: A): boolean {
    return false;
  }

  /**
   * Takes a predicate and apply it to `RemoteSuccess` value.
   * "Left" part will return `false`.
   */
  exists(p: Predicate<A>): boolean {
    return false;
  }

  /**
   * Maps this RemoteFailure error into RemoteSuccess if passed function f return {@link Some} value, otherwise returns self
   */
  recover(f: (error: L) => Option<A>): RemoteData<L, A> {
    return this;
  }

  /**
   * Recovers this RemoteFailure also mapping RemoteSuccess case
   * @see {@link recover}
   */
  recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
    return this as any;
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

  extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
    return this as any;
  }

  fold<B>(initialOrPending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return failure(this.error);
  }

  foldL<B>(
    pending: Function1<Option<RemoteProgress>, B>,
    failure: Function1<L, B>,
    success: Function1<A, B>
  ): B {
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

  isPending(): this is RemotePending<L, A> {
    return false;
  }

  isFailure(): this is RemoteFailure<L, A> {
    return true;
  }

  isSuccess(): this is RemoteSuccess<L, A> {
    return false;
  }

  toOption(): Option<A> {
    return none;
  }

  toEither(initialOrPending: L): Either<L, A> {
    return left(this.error);
  }

  toEitherL(initialOrPending: Lazy<L>): Either<L, A> {
    return left(this.error);
  }

  toNullable(): A | null {
    return null;
  }

  toString(): string {
    return `failure(${toString(this.error)})`;
  }

  contains(S: Setoid<A>, a: A): boolean {
    return false;
  }

  exists(p: Predicate<A>): boolean {
    return false;
  }

  recover(f: (error: L) => Option<A>): RemoteData<L, A> {
    return this.recoverMap(f, identity);
  }

  recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
    return f(this.error).fold(this as any, success);
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

  extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
    return of(f(this));
  }

  fold<B>(initialOrPending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return success(this.value);
  }

  foldL<B>(
    pending: Function1<Option<RemoteProgress>, B>,
    failure: Function1<L, B>,
    success: Function1<A, B>
  ): B {
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

  isPending(): this is RemotePending<L, A> {
    return false;
  }

  isFailure(): this is RemoteFailure<L, A> {
    return false;
  }

  isSuccess(): this is RemoteSuccess<L, A> {
    return true;
  }

  toOption(): Option<A> {
    return some(this.value);
  }

  toEither(initial: L, pending: L): Either<L, A> {
    return right(this.value);
  }

  toEitherL(initial: Lazy<L>, pending: Lazy<L>): Either<L, A> {
    return right(this.value);
  }

  toNullable(): A | null {
    return this.value;
  }

  toString(): string {
    return `success(${toString(this.value)})`;
  }

  contains(S: Setoid<A>, a: A): boolean {
    return S.equals(this.value, a);
  }

  exists(p: Predicate<A>): boolean {
    return p(this.value);
  }

  recover(f: (error: L) => Option<A>): RemoteData<L, A> {
    return this;
  }

  recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
    return this.map(g);
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

  constructor(readonly progress: Option<RemoteProgress> = none) {}

  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return fy;
  }

  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return fy();
  }

  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return fab.fold(
      fab.isPending() ? (concatPendings(this, fab as any) as any) : this,
      () => this,
      () => this
    );
  }

  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return pending;
  }

  extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
    return pending;
  }

  fold<B>(initialOrPending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
    return initialOrPending;
  }

  foldL<B>(
    initialOrPending: Function1<Option<RemoteProgress>, B>,
    failure: Function1<L, B>,
    success: Function1<A, B>
  ): B {
    return initialOrPending(this.progress);
  }

  getOrElseL(f: Lazy<A>): A {
    return f();
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

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return b;
  }

  isPending(): this is RemotePending<L, A> {
    return true;
  }

  isFailure(): this is RemoteFailure<L, A> {
    return false;
  }

  isSuccess(): this is RemoteSuccess<L, A> {
    return false;
  }

  toOption(): Option<A> {
    return none;
  }

  toEither(initialOrPending: L): Either<L, A> {
    return left(initialOrPending);
  }

  toEitherL(initialOrPending: Lazy<L>): Either<L, A> {
    return left(initialOrPending());
  }

  toNullable(): A | null {
    return null;
  }

  toString(): string {
    return 'pending';
  }

  contains(S: Setoid<A>, a: A): boolean {
    return false;
  }

  exists(p: Predicate<A>): boolean {
    return false;
  }

  recover(f: (error: L) => Option<A>): RemoteData<L, A> {
    return this;
  }

  recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
    return this as any;
  }
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of `RemoteData` is either an instance of `RemoteInitial`, `RemotePending`, `RemoteFailure` or `RemoteSuccess`
 *
 * A common use of `RemoteData` is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * Note: `RemoteInitial`, `RemotePending` and `RemoteFailure` are commonly called "Left" part in jsDoc.
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 */
export type RemoteData<L, A> =
  | RemoteInitial<L, A>
  | RemoteFailure<L, A>
  | RemoteSuccess<L, A>
  | RemotePending<L, A>;

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
  return (ta, f) => {
    if (ta.isSuccess()) {
      return F.map(f(ta.value), of);
    } else {
      return F.of(ta as any);
    }
  };
}

//Alt
const alt = <L, A>(fx: RemoteData<L, A>, fy: RemoteData<L, A>): RemoteData<L, A> => fx.alt(fy);

//Extend
const extend = <L, A, B>(
  fla: RemoteData<L, A>,
  f: Function1<RemoteData<L, A>, B>
): RemoteData<L, B> => fla.extend(f);

//constructors
export const failure = <L, A>(error: L): RemoteData<L, A> => new RemoteFailure(error);
export const success: <L, A>(value: A) => RemoteData<L, A> = of;
export const pending: RemoteData<never, never> = new RemotePending<never, never>();
export const progress = <L, A>(progress: RemoteProgress): RemoteData<L, A> =>
  new RemotePending(some(progress));
export const initial: RemoteData<never, never> = new RemoteInitial<never, never>();

//Alternative
const zero = <L, A>(): RemoteData<L, A> => initial;

//filters
export const isFailure = <L, A>(data: RemoteData<L, A>): data is RemoteFailure<L, A> =>
  data.isFailure();
export const isSuccess = <L, A>(data: RemoteData<L, A>): data is RemoteSuccess<L, A> =>
  data.isSuccess();
export const isPending = <L, A>(data: RemoteData<L, A>): data is RemotePending<L, A> =>
  data.isPending();
export const isInitial = <L, A>(data: RemoteData<L, A>): data is RemoteInitial<L, A> =>
  data.isInitial();

//Monoidal
const unit = <L, A>(): RemoteData<L, A> => initial;
const mult = <L, A, B>(fa: RemoteData<L, A>, fb: RemoteData<L, B>): RemoteData<L, [A, B]> =>
  combine(fa, fb);

//Setoid
export const getSetoid = <L, A>(SL: Setoid<L>, SA: Setoid<A>): Setoid<RemoteData<L, A>> => {
  return {
    equals: (x, y) =>
      x.foldL(
        () => y.isInitial(),
        () => y.isPending(),
        xError => y.foldL(constFalse, constFalse, yError => SL.equals(xError, yError), constFalse),
        ax => y.foldL(constFalse, constFalse, constFalse, ay => SA.equals(ax, ay))
      )
  };
};

//Ord
export const getOrd = <L, A>(OL: Ord<L>, OA: Ord<A>): Ord<RemoteData<L, A>> => {
  return {
    ...getSetoid(OL, OA),
    compare: (x, y) =>
      sign(
        x.foldL(
          () => y.fold(0, -1, () => -1, () => -1),
          () => y.fold(1, 0, () => -1, () => -1),
          xError => y.fold(1, 1, yError => OL.compare(xError, yError), () => -1),
          xValue => y.fold(1, 1, () => 1, yValue => OA.compare(xValue, yValue))
        )
      )
  };
};

//Semigroup
export const getSemigroup = <L, A>(
  SL: Semigroup<L>,
  SA: Semigroup<A>
): Semigroup<RemoteData<L, A>> => {
  return {
    concat: (x, y) => {
      return x.foldL(
        () => y.fold(y, y, () => y, () => y),
        () => y.foldL(() => x, () => concatPendings(x as any, y as any), () => y, () => y),

        xError => y.fold(x, x, yError => failure(SL.concat(xError, yError)), () => y),
        xValue => y.fold(x, x, () => x, yValue => success(SA.concat(xValue, yValue)))
      );
    }
  };
};

//Monoid
export const getMonoid = <L, A>(SL: Semigroup<L>, SA: Semigroup<A>): Monoid<RemoteData<L, A>> => {
  return {
    ...getSemigroup(SL, SA),
    empty: initial
  };
};

export function fromOption<L, A>(option: Option<A>, error: Lazy<L>): RemoteData<L, A> {
  if (isNone(option)) {
    return failure(error());
  } else {
    return success(option.value);
  }
}

export function fromEither<L, A>(either: Either<L, A>): RemoteData<L, A> {
  if (isLeft(either)) {
    return failure(either.value);
  } else {
    return success(either.value);
  }
}

export function fromPredicate<L, A>(
  predicate: Predicate<A>,
  whenFalse: Function1<A, L>
): Function1<A, RemoteData<L, A>> {
  return a => (predicate(a) ? success(a) : failure(whenFalse(a)));
}

export function fromProgressEvent<L, A>(event: ProgressEvent): RemoteData<L, A> {
  return progress({
    loaded: event.loaded,
    total: event.lengthComputable ? some(event.total) : none
  });
}

//instance
export const remoteData: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  Alternative2<URI> &
  Monoidal2<URI> = {
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
  alt,

  //Alternative
  zero,

  //Extend
  extend,

  //Monoidal
  unit,
  mult
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
