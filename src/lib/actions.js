/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
import modes from './modes'
import llmGen from './llm'
import models from './models'
import {figmaUrlRegex} from './consts'

const get = useStore.getState
const set = useStore.setState

const FIGMA_API_KEY = process.env.FIGMA_API_KEY;

/**
 * Fetches a frame from Figma as a base64 encoded PNG image.
 * @param {string} fileKey - The Figma file key.
 * @param {string} nodeId - The ID of the node (frame) to render.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded image data.
 */
async function getFigmaFrameAsImage(fileKey, nodeId) {
  if (!FIGMA_API_KEY) {
    throw new Error(
      'This app is not configured to use the Figma API. A FIGMA_API_KEY is missing.'
    );
  }

  // 1. Get the image URL from the Figma API
  const imageUrlsResponse = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`,
    {
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    }
  );

  if (!imageUrlsResponse.ok) {
    const errorData = await imageUrlsResponse.json().catch(() => ({}));
    throw new Error(
      `Figma API error (${imageUrlsResponse.status}): ${
        errorData.err || 'Failed to get image URL'
      }`
    );
  }

  const imageUrlsData = await imageUrlsResponse.json();
  const imageUrl = imageUrlsData.images?.[nodeId];

  if (!imageUrl) {
    throw new Error(
      'Could not find the specified frame (node-id) in the Figma file. Please make sure the link points to a specific frame.'
    );
  }

  // 2. Fetch the image itself
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Failed to fetch the Figma image from its URL (${imageResponse.status}).`
    );
  }

  // 3. Convert the image to a base64 string
  const imageBlob = await imageResponse.blob();
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

export const init = () => {
  if (get().didInit) {
    return
  }

  // Listen for system theme changes and update if no user preference is set
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (localStorage.getItem('isDark') === null) {
        set({isDark: e.matches})
      }
    })

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
  groundingChunks: null,
  isBusy: true,
  gotError: false,
  errorDetails: null,
  outputMode: mode,
  rating: 0,
  isFavorite: false,
  comments: ''
})

export const addRound = async (prompt, options = {}) => {
  scrollTo({top: 0, left: 0, behavior: 'smooth'})

  const {
    outputMode,
    batchMode,
    batchSize,
    batchModel,
    versusModels,
    temperature
  } = get()

  const {cloneUrl} = options
  const isCloneMode = outputMode === 'clone'
  const figmaMatch =
    isCloneMode && cloneUrl ? cloneUrl.match(figmaUrlRegex) : null

  if (!batchMode && Object.values(versusModels).every(active => !active)) {
    return
  }

  let roundPrompt
  if (figmaMatch) {
    roundPrompt = `Clone from Figma: ${cloneUrl}\nChange: ${prompt}`
  } else if (isCloneMode) {
    roundPrompt = `Clone: ${cloneUrl}\nChange: ${prompt}`
  } else {
    roundPrompt = prompt
  }

  const newRound = {
    prompt: roundPrompt,
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

  set(state => {
    state.feed.unshift(newRound)
  })

  let llmPrompt

  if (figmaMatch) {
    try {
      const fileKey = figmaMatch[1]
      const nodeId = decodeURIComponent(figmaMatch[2])
      const base64Image = await getFigmaFrameAsImage(fileKey, nodeId)

      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image
        }
      }
      const textPart = {
        text: `Based on the user instruction, create a single, self-contained, responsive HTML file from the provided Figma design image.\n\nUSER INSTRUCTION:\n${prompt}`
      }
      llmPrompt = {parts: [imagePart, textPart]}
    } catch (e) {
      console.error('Error fetching from Figma:', e)
      set(state => {
        const round = state.feed.find(r => r.id === newRound.id)
        if (round) {
          round.outputs.forEach(output => {
            output.isBusy = false
            output.gotError = true
            output.totalTime = Date.now() - output.startTime
            output.outputData = `Failed to process Figma link.\n\nError: ${e.message}`
            output.errorDetails = {
              type: 'FIGMA',
              title: 'Figma Error',
              suggestion: 'Could not process the Figma link. Please ensure the URL is correct, the file is public, and the link points to a specific frame.'
            };
          })
        }
      })
      return
    }
  } else if (isCloneMode) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        cloneUrl
      )}`
      const response = await fetch(proxyUrl)
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`)
      const fetchedHtml = await response.text()
      llmPrompt = `Based on the following user instruction, refactor the provided HTML code. \n\nUSER INSTRUCTION:\n${prompt}\n\nORIGINAL HTML CODE:\n\`\`\`html\n${fetchedHtml}\n\`\`\``
    } catch (e) {
      console.error('Error fetching URL for cloning:', e)
      set(state => {
        const round = state.feed.find(r => r.id === newRound.id)
        if (round) {
          round.outputs.forEach(output => {
            output.isBusy = false
            output.gotError = true
            output.totalTime = Date.now() - output.startTime
            output.outputData = `Failed to fetch URL: ${cloneUrl}\n\nError: ${e.message}`
            output.errorDetails = {
              type: 'FETCH_URL',
              title: 'URL Fetch Error',
              suggestion: 'Could not fetch content from the URL. Please check if the URL is correct and publicly accessible.'
            };
          })
        }
      })
      return
    }
  } else {
    llmPrompt =
      outputMode === 'refactor'
        ? `Please redesign and refactor the following frontend code to be more modern, responsive, and aesthetically pleasing. Here is the code:\n\n\`\`\`html\n${prompt}\n\`\`\``
        : prompt
  }

  newRound.outputs.forEach(async (output, i) => {
    let res

    try {
      res = await llmGen({
        model: models[output.model].modelString,
        thinking: models[output.model].thinking,
        thinkingCapable: models[output.model].thinkingCapable,
        systemInstruction: newRound.systemInstruction,
        prompt: llmPrompt,
        temperature,
        useGoogleSearch: modes[outputMode].useGoogleSearch
      })
    } catch (e) {
      const errorDetails = {
        type: 'UNKNOWN',
        title: 'Unknown Error',
        suggestion: 'An unexpected error occurred. Check the console and try again.'
      };
      const message = e.message ? e.message.toLowerCase() : '';
    
      if (message.includes('timed out')) {
        errorDetails.type = 'TIMEOUT';
        errorDetails.title = 'Request Timed Out';
        errorDetails.suggestion = 'The request took too long. This can happen with complex prompts. Try simplifying your request or try again.';
      } else if (message.includes('safety')) {
        errorDetails.type = 'SAFETY';
        errorDetails.title = 'Response Blocked';
        errorDetails.suggestion = 'The response was blocked for safety reasons. Please rephrase your prompt.';
      } else if (message.includes('api key not valid')) {
        errorDetails.type = 'API_KEY';
        errorDetails.title = 'Invalid API Key';
        errorDetails.suggestion = 'The API key is not valid. Please ensure it is correctly configured.';
      } else if (message.includes('fetch')) {
        errorDetails.type = 'NETWORK';
        errorDetails.title = 'Network Error';
        errorDetails.suggestion = 'Could not connect to the API. Check your internet connection and try again.';
      } else if (message.includes('invalid response')) {
        errorDetails.type = 'API_RESPONSE';
        errorDetails.title = 'Invalid Response';
        errorDetails.suggestion = 'The API returned an unexpected response. This might be a temporary issue. Please try again.';
      }
    
      set(state => {
        const round = state.feed.find(round => round.id === newRound.id)
        if (!round) return;
        
        const targetOutput = round.outputs[i];
        targetOutput.isBusy = false;
        targetOutput.gotError = true;
        targetOutput.totalTime = Date.now() - targetOutput.startTime;
        targetOutput.outputData = e.message; // Keep raw message for details
        targetOutput.errorDetails = errorDetails; // Add structured error info
      });
      return;
    }

    set(state => {
      const round = state.feed.find(round => round.id === newRound.id)

      if (!round) {
        return
      }
      const targetOutput = round.outputs[i]
      targetOutput.outputData = res.text
        .replace(/```\w+/gm, '')
        .replace(/```\n?$/gm, '')
        .trim()
      targetOutput.groundingChunks = res.groundingChunks;
      targetOutput.isBusy = false
      targetOutput.totalTime = Date.now() - targetOutput.startTime
    })
  })
}

export const toggleTheme = () => {
  set(state => {
    const newIsDark = !state.isDark
    state.isDark = newIsDark
    localStorage.setItem('isDark', JSON.stringify(newIsDark))
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

export const setTemperature = temp =>
  set(state => {
    state.temperature = temp
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
  const {temperature} = get()
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
      prompt: fullPrompt,
      temperature
    })

    const newCode = res.text
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