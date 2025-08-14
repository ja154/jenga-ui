/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
const f = s =>
  s
    .replaceAll(/([^\n{])\n([^\n}\s+])/g, '$1 $2')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim()

export default {
  html: {
    name: 'HTML/JS',
    emoji: '📄',
    syntax: 'html',
    systemInstruction: f(`\
You are an expert web developer specializing in modern, responsive, and aesthetically pleasing UI using HTML, CSS, and vanilla JavaScript. When given a prompt, create a single, self-contained HTML file that implements the described UI component or full application page. Inline all CSS and JavaScript. Do not use external libraries or assets. Use modern design principles, including flexbox or grid for layout. Add subtle animations or interactivity where appropriate to enhance the user experience. Your code should be clean, readable, and ready to be copied and used directly. Return ONLY the HTML file content, with no extra commentary or markdown.`),

    getTitle: s => `Code ${s}`,
    presets: [
      {
        label: '☀️ weather app',
        prompt: 'a simulated weather app with a clean, modern UI'
      },
      {
        label: '📝 todo list',
        prompt: 'a todo list app with add, delete, and complete functionality'
      },
      {
        label: '🪙 coin flip',
        prompt: 'coin flipping app, with an animated coin'
      },
      {
        label: '🗓️ calendar component',
        prompt: 'a monthly calendar component'
      },
      {
        label: '🧮 calculator',
        prompt: 'a stylish, functional calculator'
      },
      {
        label: '🎮 tic-tac-toe',
        prompt: 'tic tac toe game where you play against the computer'
      },
      {
        label: '🎨 pricing page',
        prompt: 'a responsive pricing page with 3 tiers and a toggle for monthly/annual pricing'
      },
      {
        label: '🖼️ product card',
        prompt: 'an animated product card with a hover effect'
      },
      {
        label: '📎 login form',
        prompt: 'a login form with input validation and a sleek design'
      },
      {
        label: '🖥️ responsive navbar',
        prompt: 'a responsive navigation bar with a hamburger menu for mobile'
      },
      {
        label: '🧠 memory game',
        prompt: 'a memory game with a card flipping animation'
      }
    ]
  }
}