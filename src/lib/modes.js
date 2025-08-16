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
  },
  background: {
    name: 'Background',
    emoji: '🎨',
    syntax: 'html',
    systemInstruction: f(`\
You are an expert CSS designer specializing in creating beautiful, modern gradient backgrounds. When given a prompt, you must generate a single, self-contained HTML file with a \`<body>\` tag that has the described gradient as its background. The gradient should cover the entire viewport.

Your code must be self-contained: all CSS should be inlined within a \`<style>\` tag in the HTML file. Do not use external libraries, frameworks, or assets. Use modern CSS gradient functions like \`linear-gradient\`, \`radial-gradient\`, \`conic-gradient\`, and repeating variations.

The HTML should be minimal, just enough to display the background.

Your final output should be ONLY the raw HTML code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`html.\``),
    getTitle: s => `Background ${s}`,
    presets: [
      {
        label: 'ocean sunrise',
        prompt: 'a vibrant gradient of an ocean sunrise'
      },
      {
        label: 'synthwave sunset',
        prompt: 'a synthwave-style sunset gradient with neon pinks and purples'
      },
      {
        label: 'forest canopy',
        prompt:
          'a gradient that looks like sunlight filtering through a forest canopy'
      },
      {
        label: 'cotton candy sky',
        prompt: 'a soft, pastel-colored cotton candy sky gradient'
      },
      {
        label: 'deep space nebula',
        prompt: 'a dark, cosmic gradient resembling a deep space nebula'
      },
      {
        label: 'molten lava',
        prompt:
          'a fiery gradient of molten lava with reds, oranges, and yellows'
      },
      {
        label: 'arctic aurora',
        prompt: 'an ethereal gradient that mimics the arctic aurora borealis'
      },
      {
        label: 'vintage paper',
        prompt: 'a subtle gradient that looks like old, vintage paper'
      }
    ]
  },
  refactor: {
    name: 'Code Refactor',
    emoji: '💅',
    syntax: 'html',
    systemInstruction: f(`\
You are a world-class senior frontend engineer and UI/UX designer with a keen eye for aesthetics and user experience, similar to designers at Figma. You will be given a snippet of frontend code (HTML, CSS, JavaScript). Your task is to completely redesign and refactor it into a stunning, modern, and responsive UI component or page.

Your goals are:
1. Aesthetic Excellence: Create a visually appealing design. Use modern CSS, tasteful color palettes, and fluid animations.
2. Responsiveness: Ensure the UI looks and works perfectly on all screen sizes, from mobile to desktop. Use techniques like flexbox, grid, and media queries.
3. Modern Best Practices: Write clean, semantic, and accessible HTML. The CSS and JavaScript should be efficient and well-structured.
4. Self-Contained: The final output must be a single, self-contained HTML file. All CSS and JavaScript must be inlined. Do not use external libraries, frameworks, or assets.

Your final output should be ONLY the raw HTML code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`html.\``),
    getTitle: s => `Refactored Code ${s}`,
    presets: [
      {
        label: 'unstyled form',
        prompt: `<form>
  <label for="name">Name:</label><br>
  <input type="text" id="name" name="name"><br>
  <label for="email">Email:</label><br>
  <input type="email" id="email" name="email"><br>
  <input type="submit" value="Submit">
</form>`
      },
      {
        label: 'basic list',
        prompt: `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`
      },
      {
        label: 'simple card',
        prompt: `<div>
  <h2>Card Title</h2>
  <p>This is some text content for the card.</p>
  <button>Learn More</button>
</div>`
      },
      {
        label: 'plain button',
        prompt: '<button>Click Me</button>'
      },
      {
        label: 'basic table',
        prompt: `<table border="1">
  <tr>
    <th>Firstname</th>
    <th>Lastname</th>
  </tr>
  <tr>
    <td>Peter</td>
    <td>Griffin</td>
  </tr>
  <tr>
    <td>Lois</td>
    <td>Griffin</td>
  </tr>
</table>`
      }
    ]
  }
}