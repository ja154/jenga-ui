/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export default {
  pro: {
    name: 'Pro',
    version: '2.5',
    modelString: 'gemini-2.5-pro',
    shortName: 'Pro',
    thinkingCapable: true,
    thinking: true
  },
  flashThinking: {
    name: 'Flash',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Flash',
    thinkingCapable: true,
    thinking: true
  },
  flash: {
    name: 'Flash (thinking off)',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Flash',
    thinkingCapable: true,
    thinking: false
  },
  lite: {
    name: 'Flash-Lite',
    version: '2.5',
    modelString: 'gemini-2.5-flash-lite',
    shortName: 'Lite',
    thinkingCapable: false,
    thinking: false
  }
}