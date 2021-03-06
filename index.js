// @flow
import { KEY_PREFIX, REHYDRATE } from 'redux-persist/lib/constants'
import type { PersistConfig } from 'redux-persist/es/types'
import type { Store } from 'redux'

type CrosstabConfig = {
  blacklist?: ?Array<string>,
  keyPrefix?: ?string,
  whitelist?: ?Array<string>,
}

module.exports = function (store: Store, persistConfig: PersistConfig, crosstabConfig: CrosstabConfig = {}) {
  const blacklist: ?Array<string> = crosstabConfig.blacklist || null
  const whitelist: ?Array<string> = crosstabConfig.whitelist || null
  const keyPrefix: string = crosstabConfig.keyPrefix || KEY_PREFIX

  const { key }: { key: string } = persistConfig

  window.addEventListener('storage', handleStorageEvent, false)

  function handleStorageEvent (e) {
    if (e.key && e.key.indexOf(keyPrefix) === 0) {
      if (e.oldValue === e.newValue) {
        return
      }

      const statePartial: { [string]: string } = JSON.parse(e.newValue)

      /* eslint-disable flowtype/no-weak-types */
      const state: Object = Object.keys(statePartial).reduce((state, reducerKey) => {
        /* eslint-enable flowtype/no-weak-types */
        if (whitelist && whitelist.indexOf(reducerKey) === -1) {
          return state
        }
        if (blacklist && blacklist.indexOf(reducerKey) !== -1) {
          return state
        }

        state[reducerKey] = JSON.parse(statePartial[reducerKey])

        return state
      }, {})

      store.dispatch({
        key,
        payload: state,
        type: REHYDRATE,
      })
    }
  }
}
