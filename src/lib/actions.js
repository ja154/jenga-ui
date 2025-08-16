/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
import modes from './modes'
import llmGen from './llm'
import models from './models'

const get = useStore.getState
const set = useStore.setState

export const init = () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })
}

const newOutput = (model, mode, isBatch) => ({
  model,
  isBatch,
  id: crypto.randomUUID(),
  startTime: Date.now(),
  outputData: null,
  isBusy: true,
  gotError: false,
  outputMode: mode,
  rating: 0,
  isFavorite: false,
  comments: ''
})

export const addRound = prompt => {
  scrollTo({top: 0, left: 0, behavior: 'smooth'})

  const {outputMode, batchMode, batchSize, batchModel, versusModels} = get()

  if (!batchMode && Object.values(versusModels).every(active => !active)) {
    return
  }

  const llmPrompt =
    outputMode === 'refactor'
      ? `Please redesign and refactor the following frontend code to be more modern, responsive, and aesthetically pleasing. Here is the code:\n\n\`\`\`html\n${prompt}\n\`\`\``
      : prompt

  const newRound = {
    prompt,
    systemInstruction: modes[outputMode].systemInstruction,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    outputMode,
    outputs: batchMode
      ? new Array(batchSize)
          .fill(null)
          .map(() => newOutput(batchModel, outputMode, true))
      : Object.entries(versusModels)
          .filter(([, active]) => active)
          .map(([model]) => newOutput(model, outputMode))
  }

  newRound.outputs.forEach(async (output, i) => {
    let res

    try {
      res = await llmGen({
        model: models[output.model].modelString,
        thinking: models[output.model].thinking,
        thinkingCapable: models[output.model].thinkingCapable,
        systemInstruction: newRound.systemInstruction,
        prompt: llmPrompt
      })
    } catch (e) {
      set(state => {
        const round = state.feed.find(round => round.id === newRound.id)
        if (!round) {
          return
        }
        round.outputs[i] = {
          ...output,
          isBusy: false,
          gotError: true,
          totalTime: Date.now() - output.startTime
        }
      })
      return
    }

    set(state => {
      const output = newRound.outputs[i]
      const round = state.feed.find(round => round.id === newRound.id)

      if (!round) {
        return
      }

      round.outputs[i] = {
        ...output,
        outputData: res
          .replace(/```\w+/gm, '')
          .replace(/```\n?$/gm, '')
          .trim(),
        isBusy: false,
        totalTime: Date.now() - output.startTime
      }
    })
  })

  set(state => {
    state.feed.unshift(newRound)
  })
}

export const setOutputMode = mode =>
  set(state => {
    state.outputMode = mode
  })

export const setBatchModel = model =>
  set(state => {
    state.batchModel = model
  })

export const setBatchMode = active =>
  set(state => {
    state.batchMode = active
  })

export const setBatchSize = size =>
  set(state => {
    state.batchSize = size
  })

export const setVersusModel = (model, active) =>
  set(state => {
    state.versusModels[model] = active
  })

export const removeRound = id =>
  set(state => {
    state.feed = state.feed.filter(round => round.id !== id)
  })

export const reset = () => {
  set(state => {
    state.feed = []
  })
}

export const startEditing = (roundId, outputId) => {
  const round = get().feed.find(r => r.id === roundId)
  if (!round) return
  const output = round.outputs.find(o => o.id === outputId)
  if (!output) return

  set(state => {
    state.editingOutput = {
      roundId,
      outputId,
      code: output.outputData,
      isEditingBusy: false
    }
  })
}

export const updateEditingCode = code => {
  set(state => {
    if (state.editingOutput) {
      state.editingOutput.code = code
    }
  })
}

export const stopEditing = () => {
  set(state => {
    state.editingOutput = null
  })
}

export const saveAndStopEditing = () => {
  const {roundId, outputId, code} = get().editingOutput
  set(state => {
    const round = state.feed.find(r => r.id === roundId)
    if (round) {
      const output = round.outputs.find(o => o.id === outputId)
      if (output) {
        output.outputData = code
      }
    }
    state.editingOutput = null
  })
}

export const applyAIChatEdit = async userPrompt => {
  const {code} = get().editingOutput
  if (!code || !userPrompt) return

  set(state => {
    if (state.editingOutput) {
      state.editingOutput.isEditingBusy = true
    }
  })

  const systemInstruction = `You are an elite frontend developer AI assistant. Your task is to modify a self-contained HTML file based on user instructions. The user will provide the current code and a command. You must apply the change and return only the complete, updated, raw HTML code. Do not add any explanations or markdown formatting around the code.`
  const fullPrompt = `I need to modify the following HTML code.\n\nCURRENT CODE:\n\`\`\`html\n${code}\n\`\`\`\n\nMODIFICATION INSTRUCTION:\n${userPrompt}\n\nReturn the full HTML file with the modification.`

  let res
  try {
    const modelInfo = models.flash
    res = await llmGen({
      model: modelInfo.modelString,
      thinking: modelInfo.thinking,
      thinkingCapable: modelInfo.thinkingCapable,
      systemInstruction,
      prompt: fullPrompt
    })

    const newCode = res
      .replace(/```\w+/gm, '')
      .replace(/```\n?$/gm, '')
      .trim()

    updateEditingCode(newCode)
  } catch (e) {
    console.error('AI chat edit failed', e)
    // In a real app, we'd show a user-facing error here.
  } finally {
    set(state => {
      if (state.editingOutput) {
        state.editingOutput.isEditingBusy = false
      }
    })
  }
}

init()
