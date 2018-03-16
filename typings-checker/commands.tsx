import { declareCommands } from '../src';
import { CommandReturn } from 'avenger';
import * as React from 'react';

declare const doFoo: CommandReturn<{ token: string }, void>;
const withDoFoo = declareCommands({ doFoo });

// test the result type of declareCommands().Props
type WithDoFooProps = {
  doFoo: (params: { token: string }) => Promise<void>;
};
declare var withDoFooProps: WithDoFooProps;
withDoFooProps = withDoFoo.Props;

declare const C1: React.ComponentType<typeof withDoFoo.Props>;
const WithDoFoo = withDoFoo(C1);

<WithDoFoo />;

// $ExpectError Type 'number' is not assignable to type 'string | undefined'.
<WithDoFoo token={10} />;
