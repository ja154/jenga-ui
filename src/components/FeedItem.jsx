/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState} from 'react'
import c from 'clsx'
import {addRound, removeRound} from '../lib/actions'
import modes from '../lib/modes'
import ModelOutput from './ModelOutput'

export default function FeedItem({round, onModifyPrompt, onViewFullScreen}) {
  const [showSystemInstruction, setShowSystemInstruction] = useState(false)

  return (
    <li className="w-full flex flex-col gap-2.5 bg-glass-bg-secondary border border-glass-border-primary p-3 px-5 rounded-lg animate-fadeInUp">
      <div className={c('flex items-center justify-between gap-4', {'items-start': showSystemInstruction})}>
        <h3 className={c('text-sm leading-normal flex items-center gap-2.5', {'items-start': showSystemInstruction})}>
          <div className="bg-bg-septenary text-text-secondary py-1 px-2.5 text-xs rounded-full inline-flex items-center gap-1 whitespace-nowrap">
            {modes[round.outputMode].emoji} {modes[round.outputMode].name}
          </div>
          <div className="flex flex-col gap-1.5 items-start">
            {showSystemInstruction && (
              <p className="text-text-secondary whitespace-pre-wrap">{round.systemInstruction}</p>
            )}
            <p className="whitespace-pre-wrap">{round.prompt}</p>
          </div>
        </h3>
        <div className="flex items-center gap-2.5">
          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            onClick={() => setShowSystemInstruction(!showSystemInstruction)}
            aria-label={
              showSystemInstruction
                ? 'Hide system instruction'
                : 'Show system instruction'
            }
          >
            <span className="icon">assignment</span>
            <span className="tooltip">
              {showSystemInstruction ? 'Hide' : 'Show'} system instruction
            </span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            aria-label="Remove round"
            onClick={() => {
              if (
                window.confirm('Are you sure you want to remove this round?')
              ) {
                removeRound(round.id)
              }
            }}
          >
            <span className="icon">delete</span>
            <span className="tooltip">Remove</span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            aria-label="Modify prompt"
            onClick={() => onModifyPrompt(round.prompt)}
          >
            <span className="icon">edit</span>
            <span className="tooltip">Modify prompt</span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            aria-label="Re-run prompt"
            onClick={() => addRound(round.prompt)}
          >
            <span className="icon">refresh</span>
            <span className="tooltip">Re-run prompt</span>
          </button>
        </div>
      </div>

      <ul className="gap-5 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        {round.outputs.map(output => (
          <li key={output.id} className="only:mr-auto only:w-full only:max-w-xl">
            <ModelOutput
              {...output}
              roundId={round.id}
              onViewFullScreen={onViewFullScreen}
            />
          </li>
        ))}
      </ul>
    </li>
  )
}