/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai';
import pLimit from 'p-limit';

const limit = pLimit(9);

const timeoutMs = 193_333;
const maxRetries = 5;
const baseDelay = 1_233;
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const safetySettings = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
  'HARM_CATEGORY_HARASSMENT',
].map(category => ({category, threshold: 'BLOCK_NONE'}));

async function generate({
  model,
  systemInstruction,
  prompt,
  thinking,
  thinkingCapable,
  temperature,
  useGoogleSearch
}) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
      );

      const genConfig = {
        model,
        contents: prompt,
        config: {
          safetySettings,
          temperature,
          systemInstruction: systemInstruction || undefined,
        },
      };

      if (useGoogleSearch) {
        genConfig.config.tools = [{googleSearch: {}}];
      }

      // Only add thinkingConfig if the model is capable and we specifically want to disable thinking
      if (thinkingCapable && !thinking) {
          genConfig.config.thinkingConfig = { thinkingBudget: 0 };
      }

      const responsePromise = ai.models.generateContent(genConfig);

      const response = await Promise.race([responsePromise, timeoutPromise]);

      if (response && typeof response.text === 'string') {
        return {
          text: response.text,
          groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        };
      }
      
      console.warn('API returned unexpected response structure:', response);
      throw new Error('Invalid response from API. Response did not contain a text property.');

    } catch (e) {
      console.error(
        `Attempt ${attempt + 1} failed for model ${model}:`,
        e.message
      );
      if (attempt === maxRetries - 1) {
        // Re-throw the original error on the last attempt
        throw e;
      }
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  // This is a fallback, but the loop should either return or throw.
  throw new Error('Generation failed after all retries.');
}

export default function llmGen(args) {
  return limit(() => generate(args));
}
