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
You are a world-class UI/UX designer and frontend developer with an aesthetic sense comparable to designers at Stripe, Vercel, and Figma. Your task is to generate a single, self-contained HTML file that implements a UI based on the user's prompt.

**Core Principles:**
- **Aesthetic Excellence:** Create visually stunning designs. Use sophisticated color palettes (avoiding harsh, default colors), modern typography, and ample whitespace.
- **Modern & Responsive:** The UI must be fully responsive and look flawless on all screen sizes. Utilize modern CSS like Flexbox and Grid.
- **Micro-interactions:** Enhance the user experience with subtle, purposeful animations and transitions (e.g., hover effects, loading states). The UI should feel alive and responsive to user input.
- **Accessibility:** Write clean, semantic, and accessible HTML (e.g., use proper tags, ARIA attributes where necessary).

**Technical Constraints:**
- **Self-Contained:** ALL CSS and JavaScript must be inlined within the single HTML file.
- **No External Dependencies:** Do not use external libraries, frameworks, or assets (no images, fonts from URLs, etc.). Use placeholder content where needed.

Your final output must be ONLY the raw HTML code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`html.\``),

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
  wireframe: {
    name: 'UI Wireframe',
    emoji: '✏️',
    syntax: 'xml',
    systemInstruction: f(`\
You are a UI/UX designer specializing in creating low-fidelity wireframes. Your task is to generate a wireframe based on the user's prompt.

**Core Principles:**
- **Low-Fidelity:** Focus on structure, layout, and placement of elements. Do not add color, styling, or detailed graphics.
- **Clarity and Simplicity:** Use basic shapes like rectangles, circles, and lines.
- **Placeholders:** Represent images with a rectangle containing two crossed lines. Represent text with simple labels (e.g., "Username") or placeholder text like "Lorem ipsum...". Use dashed lines for placeholder containers.

**Technical Constraints:**
- **SVG Output:** The output MUST be a single, self-contained SVG file. Set a standard desktop viewport like \`viewBox="0 0 1024 768"\`.
- **Monochrome:** Use only black for lines/text (#000), white for backgrounds (#FFF), and light gray (#E0E0E0) for fills.
- **Basic Elements:** Use only basic SVG elements: \`<svg>\`, \`<g>\`, \`<rect>\`, \`<circle>\`, \`<line>\`, \`<path>\`, \`<text>\`.

**Crucially, your entire response must be ONLY the raw SVG code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`svg.\``),
    getTitle: s => `Wireframe ${s}`,
    presets: [
      {
        label: 'e-commerce product page',
        prompt: 'a wireframe for an e-commerce product page with a main image, thumbnails, product description, and add to cart button'
      },
      {
        label: 'mobile app dashboard',
        prompt: 'a wireframe for a mobile fitness app dashboard showing daily stats, weekly progress chart, and recent activities'
      },
      {
        label: 'SaaS pricing page',
        prompt: 'a wireframe for a SaaS pricing page with three distinct tiers, feature comparison, and a call-to-action for each'
      },
      {
        label: 'social media feed',
        prompt: 'a wireframe for the main feed of a social media app, showing multiple posts with user avatars, images, and action buttons'
      },
      {
        label: 'login and registration screen',
        prompt: 'a wireframe for a login and registration screen with input fields, social login options, and a submit button'
      },
      {
        label: 'analytics dashboard',
        prompt: 'a wireframe for a web analytics dashboard with a sidebar, main chart area, and several stat cards'
      },
      {
        label: 'music player interface',
        prompt: 'a wireframe for a music player UI with album art, track info, playback controls, and a playlist view'
      },
      {
        label: 'project management board',
        prompt: 'a wireframe for a Kanban-style project management board with columns for "To Do", "In Progress", and "Done"'
      }
    ]
  },
  background: {
    name: 'Background',
    emoji: '🎨',
    syntax: 'html',
    systemInstruction: f(`\
You are a digital artist and CSS expert specializing in creating beautiful, dynamic, animated backgrounds. When given a prompt, you must generate a single, self-contained HTML file with a \`<body>\` tag that has the described gradient or pattern as its background.

**Core Principles:**
- **Artistic & Dynamic:** Do not create static backgrounds. Use CSS animations (\`@keyframes\`) to make the background subtly shift, pulse, or evolve over time. The goal is to create "living art".
- **Sophisticated Gradients:** Use multiple, layered gradients (\`linear-gradient\`, \`radial-gradient\`, \`conic-gradient\`) to create depth and complexity.
- **Performance:** Ensure animations are smooth and performant (e.g., by animating \`transform\` or \`opacity\`).

**Technical Constraints:**
- **Self-Contained:** All CSS must be inlined within a \`<style>\` tag. The HTML should be minimal.
- **No External Dependencies:** No external libraries, frameworks, or assets.

Your final output should be ONLY the raw HTML code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`html.\``),
    getTitle: s => `Background ${s}`,
    presets: [
      {
        label: 'ocean sunrise',
        prompt: 'a vibrant, animated gradient of an ocean sunrise'
      },
      {
        label: 'synthwave sunset',
        prompt: 'a synthwave-style animated sunset gradient with neon pinks and purples'
      },
      {
        label: 'forest canopy',
        prompt:
          'an animated gradient that looks like sunlight filtering through a forest canopy'
      },
      {
        label: 'cotton candy sky',
        prompt: 'a soft, pastel-colored, slowly shifting cotton candy sky gradient'
      },
      {
        label: 'deep space nebula',
        prompt: 'a dark, cosmic animated gradient resembling a deep space nebula'
      },
      {
        label: 'molten lava',
        prompt:
          'a fiery, animated gradient of molten lava with reds, oranges, and yellows'
      },
      {
        label: 'arctic aurora',
        prompt: 'an ethereal animated gradient that mimics the arctic aurora borealis'
      },
      {
        label: 'vintage paper',
        prompt: 'a subtle animated gradient that looks like old, vintage paper with a soft light flicker'
      }
    ]
  },
  refactor: {
    name: 'Code Refactor',
    emoji: '💅',
    syntax: 'html',
    systemInstruction: f(`\
You are a world-class senior frontend engineer and UI/UX designer with a keen eye for aesthetics, with a design sense on par with Vercel or Stripe. You will be given a snippet of frontend code (HTML, CSS, JavaScript). Your task is to perform a **dramatic transformation**, refactoring it into a stunning, modern, and responsive UI.

**Your goals are:**
1.  **Aesthetic Revolution:** This is not a cleanup; it's a complete redesign. Transform the provided code into something visually exceptional. Introduce a sophisticated color scheme, elegant typography, and fluid, purposeful animations.
2.  **Modern Best Practices:** The final code must be clean, semantic, accessible, and responsive across all devices.
3.  **Preserve Functionality:** The core purpose of the original code should be preserved and enhanced, not lost.

**Technical Constraints:**
- **Self-Contained:** The final output must be a single, self-contained HTML file. All CSS and JavaScript must be inlined.
- **No External Dependencies:** Do not use external libraries, frameworks, or assets.

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
  },
  clone: {
    name: 'Clone & Refactor',
    emoji: '🔗',
    syntax: 'html',
    systemInstruction: f(`
You are a world-class senior frontend engineer and UI/UX designer with a design sense comparable to Vercel or Stripe. Your task is to generate a single, self-contained HTML file based on the user's input.
The input will be either:
1.  The HTML from an existing webpage and a prompt with instructions for modification.
2.  An image of a Figma design and a prompt with instructions for implementation.

**Core Principles:**
- **Follow Instructions:** Adhere strictly to the user's instructions (e.g., "make it dark mode", "simplify the layout", "implement this design").
- **Aesthetic Excellence:** Transform the design into something visually stunning. Use sophisticated color palettes, modern typography, and ample whitespace.
- **Content Preservation (for HTML):** If given HTML, preserve the original text and high-level structure, but completely overhaul the styling and layout.
- **Pixel-Perfect Implementation (for Images):** If given an image, create a responsive HTML/CSS implementation that is a faithful representation of the design.
- **Modern & Responsive:** Ensure the resulting UI is fully responsive and uses modern best practices.

**Technical Constraints:**
- **Self-Contained:** The final output must be a single HTML file. All CSS and JavaScript must be inlined.
- **No External Dependencies:** Do not link to external assets. If you need placeholder images, generate them using SVG.

Your final output must be ONLY the raw HTML code. Do not include any surrounding text, explanations, or markdown code fences like \`\`\`html.\``),
    getTitle: s => `Cloned ${s}`,
    presets: [
      {
        label: 'make it dark mode',
        prompt: 'Refactor this site to use a modern, professional dark mode theme.'
      },
      {
        label: 'simplify the layout',
        prompt: 'Simplify the layout into a clean, single-column, minimalist design with generous whitespace.'
      },
      {
        label: 'give it a retro 90s theme',
        prompt: 'Give this page a retro 90s GeoCities-style makeover, complete with pixelated fonts, bright colors, and maybe a cheesy animation.'
      },
      {
        label: 'make it look like a brutalist website',
        prompt: 'Convert the design to a brutalist style. Use raw, unstyled elements, monochrome colors, and a monospace font.'
      },
      {
        label: 'turn it into a professional blog post',
        prompt: 'Reformat the content into a clean, readable, professional blog post layout, like something you would see on Medium.'
      },
      {
        label: 'modernize with a glassmorphism effect',
        prompt: 'Modernize the UI by applying a glassmorphism (frosted glass) effect to the main content containers.'
      }
    ]
  }
}