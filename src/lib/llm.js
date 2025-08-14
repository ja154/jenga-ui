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
}) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      );

      const modelPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          safetySettings,
          ...(thinkingCapable && !thinking
            ? {thinkingConfig: {thinkingBudget: 0}}
            : {}),
        },
      });

      const response = await Promise.race([modelPromise, timeoutPromise]);
      return response.text;
    } catch (error) {
      if (error.message === 'timeout' || error.name === 'AbortError') {
        if (attempt < maxRetries - 1) {
          console.warn(`Request timed out, retrying...`);
        } else {
          throw new Error(`Request timed out after ${maxRetries} attempts.`);
        }
      } else {
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }

      const delay = baseDelay * 2 ** attempt;
      await new Promise(res => setTimeout(res, delay));
      console.warn(
        `Attempt ${attempt + 1} failed, retrying after ${delay}ms...`
      );
    }
  }
}

export default params => limit(() => generate(params));
