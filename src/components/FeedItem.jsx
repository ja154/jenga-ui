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
    <li className="w-full flex flex-col gap-4 bg-glass-bg-secondary border border-glass-border-primary p-5 rounded-2xl animate-fadeInUp glow-card">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className={c('flex-grow flex items-start gap-3', {'items-start': showSystemInstruction})}>
          <div className="bg-bg-septenary text-text-secondary py-1 px-2.5 text-xs rounded-full inline-flex items-center gap-1.5 whitespace-nowrap mt-1">
            {modes[round.outputMode].emoji} {modes[round.outputMode].name}
          </div>
          <div className="flex flex-col gap-1.5 items-start flex-grow">
            <p className="whitespace-pre-wrap text-text-primary text-[14px]">{round.prompt}</p>
            {showSystemInstruction && (
              <p className="text-text-secondary text-xs whitespace-pre-wrap p-3 bg-bg-tertiary rounded-md mt-2 w-full">{round.systemInstruction}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-10 h-10 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
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
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-10 h-10 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
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
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-10 h-10 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            aria-label="Modify prompt"
            onClick={() => onModifyPrompt(round.prompt)}
          >
            <span className="icon">edit</span>
            <span className="tooltip">Modify prompt</span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-10 h-10 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
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