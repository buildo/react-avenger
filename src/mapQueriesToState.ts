import { RemoteData, RemotePending, RemoteSuccess, RemoteFailure } from './RemoteData';
import { Option, fromNullable } from 'fp-ts/lib/Option';
import { Queries } from '.';

type MappedState<Q extends Queries> = { [K in keyof Q]: RemoteData<string, Q[K]['_P']> };

function convertToRemoteData(
  data: Option<QuerySync>,
  prevValue: RemoteData<string, any>
): RemoteData<string, any> {
  return data.fold(prevValue, v => {
    if (v.loading) {
      if (prevValue._tag === 'RemoteSuccess') {
        return prevValue;
      }

      return new RemotePending();
    }

    if (v.error) {
      return new RemoteFailure(v.error);
    }

    return new RemoteSuccess(v.data);
  });
}

type QuerySync = { data?: any; loading: boolean; error: any };

export function mapQueriesToState<Q extends Queries>(
  { data }: { data: QuerySync },
  prevState: MappedState<Q>
): MappedState<Q> {
  return Object.entries(data).reduce((acc, [k, v]) => {
    return {
      ...acc,
      [k]: convertToRemoteData(fromNullable(v), prevState[k])
    };
  }, prevState);
}
