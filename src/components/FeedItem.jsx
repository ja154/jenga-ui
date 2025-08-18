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
    <li key={round.id}>
      <div className={c('header', {anchorTop: showSystemInstruction})}>
        <h3 className={c({anchorTop: showSystemInstruction})}>
          <div className="chip">
            {modes[round.outputMode].emoji} {modes[round.outputMode].name}
          </div>
          <div className="prompt">
            {showSystemInstruction && (
              <p className="systemInstruction">{round.systemInstruction}</p>
            )}
            <p>{round.prompt}</p>
          </div>
        </h3>
        <div className="actions">
          <button
            className="iconButton"
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
            className="iconButton"
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
            className="iconButton"
            aria-label="Modify prompt"
            onClick={() => onModifyPrompt(round.prompt)}
          >
            <span className="icon">edit</span>
            <span className="tooltip">Modify prompt</span>
          </button>

          <button
            className="iconButton"
            aria-label="Re-run prompt"
            onClick={() => addRound(round.prompt)}
          >
            <span className="icon">refresh</span>
            <span className="tooltip">Re-run prompt</span>
          </button>
        </div>
      </div>

      <ul className="outputs">
        {round.outputs.map(output => (
          <li key={output.id}>
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