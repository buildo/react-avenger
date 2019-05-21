import { RemoteData, success, failure, pending } from './RemoteData';
import { Option, fromNullable } from 'fp-ts/lib/Option';
import { Queries } from '.';

type MappedState<Q extends Queries> = { [K in keyof Q]: RemoteData<string, Q[K]['_P']> };

function convertToRemoteData(
  data: Option<QuerySync>,
  prevValue: RemoteData<string, any>
): RemoteData<string, any> {
  return data.fold(prevValue, v => {
    if (v.loading) {
      return prevValue.foldL(
        () => pending,
        error => failure(error, true),
        value => success(value, true)
      );
    } else if (v.error) {
      return failure(v.error, false);
    } else {
      return success(v.data, false);
    }
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
