/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState} from 'react'
import shuffle from 'lodash.shuffle'
import modes from '../lib/modes'
import {
  addRound,
  setOutputMode,
  setBatchModel,
} from '../lib/actions'
import models from '../lib/models'
import useStore from '../lib/store'

export default function Intro() {
  const batchModel = useStore.use.batchModel()
  const [presets] = useState(
    Object.fromEntries(
      Object.entries(modes).map(([key, mode]) => [
        key,
        shuffle(mode.presets.slice(0, 50))
      ])
    )
  )

  return (
    <section className="intro">
      <h2>👋 Welcome to JengaUi 🧱</h2>
      <p>
        This is a playground where you can generate anything from simple UI
        components to complex, full-page layouts for applications and websites,
        all from a simple text prompt. ✅ 👀 Try one of the examples below to get
        started:
      </p>

      {Object.entries(modes).map(([key, mode]) => (
          <div key={key}>
            <h3>
              {mode.emoji} {mode.name}
            </h3>

            <div className="selector presetList">
              <ul className="presets wrapped">
                {presets[key].map(({label, prompt}) => (
                  <li key={label}>
                    <button
                      onClick={() => {
                        setOutputMode(key)

                        if (models[batchModel].imageOutput) {
                          setBatchModel(Object.keys(models)[1])
                        }

                        addRound(prompt)
                      }}
                      className="chip"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      )}
    </section>
  )
}