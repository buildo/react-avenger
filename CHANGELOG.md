#  Change Log



## [v9.0.3](https://github.com/buildo/react-avenger/tree/v9.0.3) (2019-05-21)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v9.0.2...v9.0.3)

#### New features:

- keep track of loading state in RemoteFailure/Success cases [#83](https://github.com/buildo/react-avenger/issues/83)
- provide WithQueries render-prop alternative [#66](https://github.com/buildo/react-avenger/issues/66)

## [v9.0.2](https://github.com/buildo/react-avenger/tree/v9.0.2) (2019-05-09)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v9.0.1...v9.0.2)

#### Fixes (bugs & defects):

- declareQueries does not maintain the last "ready" value [#81](https://github.com/buildo/react-avenger/issues/81)

## [v9.0.1](https://github.com/buildo/react-avenger/tree/v9.0.1) (2019-03-29)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v8.0.1...v9.0.1)

#### New features:

- Build using tsc [#77](https://github.com/buildo/react-avenger/issues/77)
- drop eslint [#74](https://github.com/buildo/react-avenger/issues/74)
- update dependencies [#73](https://github.com/buildo/react-avenger/issues/73)
- cachestrategy validation is broken with new io-ts [#71](https://github.com/buildo/react-avenger/issues/71)

#### Breaking:

- expose query props via a RemoteData(-like?) API [#72](https://github.com/buildo/react-avenger/issues/72)

## [v8.0.1](https://github.com/buildo/react-avenger/tree/v8.0.1) (2018-11-02)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v8.0.0...v8.0.1)

#### Fixes (bugs & defects):

- inferred props resulting from `declare*` are wrong [#64](https://github.com/buildo/react-avenger/issues/64)

## [v8.0.0](https://github.com/buildo/react-avenger/tree/v8.0.0) (2018-10-18)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v7.0.0...v8.0.0)

#### Breaking:

- update avenger dep and adapt to changes in event format [#69](https://github.com/buildo/react-avenger/issues/69)

#### Fixes (bugs & defects):

- TS: `declareQueries` accepts commands and viceversa [#63](https://github.com/buildo/react-avenger/issues/63)

#### New features:

- queries: warn for `undefined` query return values [#16](https://github.com/buildo/react-avenger/issues/16)

## [v7.0.0](https://github.com/buildo/react-avenger/tree/v7.0.0) (2018-08-28)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v6.0.3...v7.0.0)

#### Breaking:

- support TS 2.9+ in next major version [#61](https://github.com/buildo/react-avenger/issues/61)

## [v6.0.3](https://github.com/buildo/react-avenger/tree/v6.0.3) (2018-04-09)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v6.0.2...v6.0.3)

#### New features:

- upgrade to io-ts ^1 [#57](https://github.com/buildo/react-avenger/issues/57)

## [v6.0.2](https://github.com/buildo/react-avenger/tree/v6.0.2) (2018-04-09)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v6.0.1...v6.0.2)

#### New features:

- Add support for dependencies in commands [#55](https://github.com/buildo/react-avenger/issues/55)

## [v6.0.1](https://github.com/buildo/react-avenger/tree/v6.0.1) (2018-03-21)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v6.0.0...v6.0.1)

#### New features:

- declareQueries should not accept queries returning undefined [#54](https://github.com/buildo/react-avenger/issues/54)

## [v6.0.0](https://github.com/buildo/react-avenger/tree/v6.0.0) (2018-03-16)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v5.0.0...v6.0.0)

#### Breaking:

- improve type safety of query value & readyState [#52](https://github.com/buildo/react-avenger/issues/52)
- update queries/commands api to accept references instead of string ids [#50](https://github.com/buildo/react-avenger/issues/50)
- remove `loading` [#49](https://github.com/buildo/react-avenger/issues/49)
- remove the factory wrapping [#48](https://github.com/buildo/react-avenger/issues/48)
- replace tcomb with io-ts [#43](https://github.com/buildo/react-avenger/issues/43)

#### New features:

- Remove ids and use object names [#2](https://github.com/buildo/react-avenger/issues/2)
- [context] consider using context to pass more than just avenger instance [#1](https://github.com/buildo/react-avenger/issues/1)

## [v5.0.0](https://github.com/buildo/react-avenger/tree/v5.0.0) (2018-01-20)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v4.0.1...v5.0.0)

## [v4.0.1](https://github.com/buildo/react-avenger/tree/v4.0.1) (2018-01-15)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v4.0.0...v4.0.1)

#### Fixes (bugs & defects):

- Broken in React16 because of React.PropTypes [#45](https://github.com/buildo/react-avenger/issues/45)

## [v4.0.0](https://github.com/buildo/react-avenger/tree/v4.0.0) (2017-08-22)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v3.0.1...v4.0.0)

#### Breaking:

- breaking to update buildo-state version [#41](https://github.com/buildo/react-avenger/issues/41)

## [v3.0.1](https://github.com/buildo/react-avenger/tree/v3.0.1) (2017-07-18)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v3.0.0...v3.0.1)

#### New features:

- address TODO in bailingWarning [#39](https://github.com/buildo/react-avenger/issues/39)

## [v3.0.0](https://github.com/buildo/react-avenger/tree/v3.0.0) (2017-07-14)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v2.1.1...v3.0.0)

#### Breaking:

- bump buildo-state version [#37](https://github.com/buildo/react-avenger/issues/37)

## [v2.1.1](https://github.com/buildo/react-avenger/tree/v2.1.1) (2017-07-07)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v2.1.0...v2.1.1)

#### New features:

- bump rxjs dep [#35](https://github.com/buildo/react-avenger/issues/35)
- use scriptoni [#33](https://github.com/buildo/react-avenger/issues/33)
- backport babel-preset-buildo [#31](https://github.com/buildo/react-avenger/issues/31)

## [v2.1.0](https://github.com/buildo/react-avenger/tree/v2.1.0) (2017-02-21)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v2.0.2...v2.1.0)

#### New features:

- use `Query.upsetParams` and `Command.invalidateParams` to produce `InputType` [#29](https://github.com/buildo/react-avenger/issues/29)

## [v2.0.2](https://github.com/buildo/react-avenger/tree/v2.0.2) (2017-02-11)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v2.0.1...v2.0.2)

#### Fixes (bugs & defects):

- "use" also "invalidation params" in commands [#27](https://github.com/buildo/react-avenger/issues/27)

## [v2.0.1](https://github.com/buildo/react-avenger/tree/v2.0.1) (2017-02-11)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v2.0.0...v2.0.1)

## [v2.0.0](https://github.com/buildo/react-avenger/tree/v2.0.0) (2017-02-06)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v2...v2.0.0)

#### Breaking:

- remove unnecessary `allQueries`/`allCommands` configuration [#25](https://github.com/buildo/react-avenger/issues/25)
- remove dependency on buildo-state/connect (do not connect() internally) [#24](https://github.com/buildo/react-avenger/issues/24)

## [v2](https://github.com/buildo/react-avenger/tree/v2) (2016-06-08)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v1.1.0...v2)

## [v1.1.0](https://github.com/buildo/react-avenger/tree/v1.1.0) (2017-01-31)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v1.0.0...v1.1.0)

#### New features:

- queries: avoid a few "useless" rerenders debouncing avenger events [#22](https://github.com/buildo/react-avenger/issues/22)
- implement "sync queries flush" in state initializer [#20](https://github.com/buildo/react-avenger/issues/20)

## [v1.0.0](https://github.com/buildo/react-avenger/tree/v1.0.0) (2017-01-31)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v0.5.0...v1.0.0)

#### Breaking:

- change `queries` and `commands` to work with latest avenger version [#18](https://github.com/buildo/react-avenger/issues/18)

#### New features:

- Update smooth release [#14](https://github.com/buildo/react-avenger/issues/14)

## [v0.5.0](https://github.com/buildo/react-avenger/tree/v0.5.0) (2017-01-27)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v0.4.0...v0.5.0)

#### Breaking:

- loading decorator improvements [#7](https://github.com/buildo/react-avenger/issues/7)

## [v0.4.0](https://github.com/buildo/react-avenger/tree/v0.4.0) (2017-01-23)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v0.3.0...v0.4.0)

#### Fixes (bugs & defects):

- explicitly declare and import from buildo-state [#11](https://github.com/buildo/react-avenger/issues/11)

## [v0.3.0](https://github.com/buildo/react-avenger/tree/v0.3.0) (2017-01-23)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v0.2.0...v0.3.0)

#### Breaking:

- build & publish first version on npm [#9](https://github.com/buildo/react-avenger/issues/9)

#### New features:

- support server side rendering [#5](https://github.com/buildo/react-avenger/issues/5)

## [v0.2.0](https://github.com/buildo/react-avenger/tree/v0.2.0) (2016-11-21)
[Full Changelog](https://github.com/buildo/react-avenger/compare/v0.1.0...v0.2.0)

#### New features:

- add optional isReady and isLoading params to loading [#3](https://github.com/buildo/react-avenger/issues/3)

## [v0.1.0](https://github.com/buildo/react-avenger/tree/v0.1.0) (2016-07-25)
