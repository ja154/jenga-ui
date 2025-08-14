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
You are an expert web developer specializing in creating stunning, modern, and responsive UIs using HTML, CSS, and vanilla JavaScript. When given a prompt, you must generate a single, self-contained HTML file that brings the described UI to life. This can be anything from a simple animated component to a complex, full-page layout for an application dashboard or a marketing landing page.

Your code must be self-contained: all CSS and JavaScript should be inlined within the HTML file. Do not use external libraries, frameworks, or assets (like images from URLs). Use modern CSS features like flexbox and grid for layout, and consider adding subtle, tasteful animations or interactions to enhance the user experience. Fill the UI with realistic placeholder content (text, numbers, etc.) where appropriate.

Your final output should be ONLY the raw HTML code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`html.\``),

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
        label: '🚀 SaaS landing page',
        prompt: 'a modern SaaS landing page with a hero section, feature list, and pricing table'
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
        label: '📊 analytics dashboard',
        prompt: 'a dashboard UI for a data analytics platform'
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
        label: '👤 user profile',
        prompt: 'a user profile page for a social media app'
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
        label: '⚙️ settings page',
        prompt: 'a settings page with various form controls and toggles'
      },
      {
        label: '🧠 memory game',
        prompt: 'a memory game with a card flipping animation'
      },
      {
        label: '🛍️ product page',
        prompt: 'an e-commerce product detail page with image gallery and reviews'
      }
    ]
  }
}