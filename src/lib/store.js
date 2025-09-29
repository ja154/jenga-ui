/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import 'immer'
import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import {createSelectorFunctions} from 'auto-zustand-selectors-hook'
import modes from './modes'
import models from './models'

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return false
  }
  const storedTheme = window.localStorage.getItem('isDark')
  if (storedTheme !== null) {
    return JSON.parse(storedTheme)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export default createSelectorFunctions(
  create(
    immer(() => ({
      didInit: false,
      feed: [],
      outputMode: Object.keys(modes)[0],
      batchMode: true,
      batchSize: 3,
      batchModel: Object.keys(models)[0],
      versusModels: Object.fromEntries(
        Object.keys(models)
          .filter(model => !models[model].imageOutput)
          .map(model => [model, true])
      ),
      temperature: 0.9,
      editingOutput: null,
      isDark: getInitialTheme(),
    }))
  )
)
