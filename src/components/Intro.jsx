/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState} from 'react'
import shuffle from 'lodash.shuffle'
import modes from '../lib/modes'
import {
  addRound,
  setOutputMode,
  setBatchModel,
} from '../lib/actions'
import models from '../lib/models'
import useStore from '../lib/store'

export default function Intro({inputSection}) {
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
    <section className="flex flex-col gap-10 items-center justify-center text-center max-w-6xl w-full mx-auto bg-glass-bg-secondary border border-glass-border-primary rounded-2xl p-10 backdrop-blur-xl glow-card">
      <h2 className="text-2xl">👋 Welcome to JengaUi 🧱</h2>
      <p className="text-sm leading-loose max-w-2xl">
        This is a playground where you can generate anything from simple UI
        components to complex, full-page layouts for applications and websites,
        all from a simple text prompt. ✅ 👀 Try one of the examples below to get
        started:
      </p>

      {inputSection}

      {Object.entries(modes).map(([key, mode]) => (
          <div key={key}>
            <h3 className="mb-5">
              {mode.emoji} {mode.name}
            </h3>

            <div className="static transform-none bg-none border-none p-0 max-h-none max-w-none w-auto h-auto">
              <ul className="flex flex-wrap flex-row gap-2 justify-center">
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
                      className="whitespace-normal py-2 px-2.5 rounded-lg bg-bg-quaternary text-text-primary text-left leading-normal hover:brightness-[var(--hover-brightness)]"
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