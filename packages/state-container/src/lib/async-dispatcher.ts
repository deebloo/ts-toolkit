import { Observable, isObservable, from, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { Action, StateChange } from './tokens';

export const stateResultToObservable = <A>(result: StateChange<A>): Observable<A | A[]> => {
  if (isObservable(result)) {
    return result;
  } else if (result instanceof Promise) {
    return from(result);
  }

  return of(result);
};

export class AsyncDispatcher<A extends Action = Action> {
  constructor(private dispatcher: (action: Action<any>) => void) {}

  dispatch(change: (() => StateChange<A>) | StateChange<A>): Observable<A | A[]> {
    let src = change instanceof Function ? change() : change;

    const result = stateResultToObservable(src).pipe(shareReplay(1));

    result.subscribe(actions => {
      if (Array.isArray(actions)) {
        actions.forEach(action => {
          this.dispatcher(action);
        });
      } else {
        this.dispatcher(actions);
      }
    });

    return result;
  }
}
