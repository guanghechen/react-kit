import { isEqual } from '@guanghechen/fast-deep-equal'
import type {
  IComputableValue,
  IEquals,
  IObservable,
  IObservableKey,
  IValueMap,
  IViewModel,
  IViewModelTicker,
} from '@guanghechen/viewmodel'
import React from 'react'

export function useSelect<M extends IViewModel, T extends IComputableValue>(
  viewmodel: M,
  transform: (valueMap: IValueMap<M>) => T,
  equals: IEquals<T> = isEqual,
): T {
  const transformRef = React.useRef(transform)
  transformRef.current = transform

  const equalsRef = React.useRef(equals)
  equalsRef.current = equals

  const tickerItem = React.useMemo<IViewModelTicker>(() => viewmodel.ticker(undefined), [viewmodel])
  const getSnapshot = React.useCallback((): T => {
    const valueMap: IValueMap<M> = {} as unknown as IValueMap<M>
    for (const key of tickerItem.keys as Array<keyof M>) {
      const observable = viewmodel[key] as IObservable<any>
      valueMap[key] = observable.getSnapshot()
    }
    return transformRef.current(valueMap)
  }, [tickerItem, viewmodel])

  const [value, setValue] = React.useState(getSnapshot)

  React.useEffect(() => {
    const unsubscribable = tickerItem.ticker.subscribe({
      next: () => {
        const nextValue = getSnapshot()
        setValue(prevValue => (equalsRef.current(prevValue, nextValue) ? prevValue : nextValue))
      },
      complete: () => {},
    })
    return () => unsubscribable.unsubscribe()
  }, [tickerItem, getSnapshot])
  return value
}

export function useSelectAccurately<
  M extends IViewModel,
  K extends IObservableKey<M>,
  T extends IComputableValue,
>(
  viewmodel: M,
  keys: K[],
  selector: (valueMap: Pick<IValueMap<M>, K>) => T,
  equals: IEquals<T> = isEqual,
): T {
  const selectorRef = React.useRef(selector)
  selectorRef.current = selector

  const equalsRef = React.useRef(equals)
  equalsRef.current = equals

  const tickerItem = React.useMemo<IViewModelTicker>(
    () => viewmodel.ticker(keys),
    [viewmodel, keys],
  )
  const getSnapshot = React.useCallback((): T => {
    const valueMap: Pick<IValueMap<M>, K> = {} as unknown as Pick<IValueMap<M>, K>
    for (const key of tickerItem.keys as K[]) {
      const observable = viewmodel[key] as IObservable<any>
      valueMap[key] = observable.getSnapshot()
    }
    return selectorRef.current(valueMap)
  }, [tickerItem, viewmodel])

  const [value, setValue] = React.useState(getSnapshot)

  React.useEffect(() => {
    const unsubscribable = tickerItem.ticker.subscribe({
      next: () => {
        const nextValue = getSnapshot()
        setValue(prevValue => (equalsRef.current(prevValue, nextValue) ? prevValue : nextValue))
      },
      complete: () => {},
    })
    return () => unsubscribable.unsubscribe()
  }, [tickerItem, getSnapshot])
  return value
}
