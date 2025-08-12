# Tokenizer Visualizer

A simple web-based tool to visualize how tokenization works, built as an assignment project.
## Live Link
[Click here](https://chaicode-tokenizer.netlify.app/)
## Features

- **Live Tokenization:**  
  Type or paste text and instantly see its encoded and decoded token arrays.

- **Persistent Token Library:**  
  The token library is saved in cookies, so custom tokens persist across sessions.

- **Copy & Paste:**  
  Quickly copy encoded or decoded arrays, and paste text from your clipboard.

- **Token Lookup:**  
  Enter a token index to decode and view the corresponding token.

- **Theme Toggle:**  
  Switch between light and dark mode with a single click (sun/moon icon).

## Usage

1. **Input:**  
   Enter or paste text in the input area.

2. **View Results:**  
   - The **Encoded Array** shows the tokenized representation.
   - The **Decoded Array** shows the tokens corresponding to each index.

3. **Copy Results:**  
   Use the "Copy Encoded" or "Copy Decoded" buttons to copy the arrays.

4. **Decode by Index:**  
   Enter a token index and click "Get" to see the decoded token.

5. **Theme:**  
   Click the theme toggle button (🌙/☀️) in the top right to switch themes.

6. **Reset:**  
   Use "Reset All" to clear the token library (does not affect theme).

## Project Structure

- `index.html` — Main HTML file and UI layout.
- `style.css` — Responsive, theme-aware styles.
- `script.js` — UI logic, event handling, and state management.
- `tokenizer.js` — Tokenization logic and token library.

## How It Works

- The tokenizer splits input text into words, assigns each a unique token index, and maintains a persistent library of tokens.
- Special tokens:
  - `<UKN>`: Unknown token (index 0)
  - `<BOS>`: Beginning of sequence (index 1)
  - `<EOS>`: End of sequence (index 2)

## Requirements

- Modern browser (no build tools or server required).

## License

ISC

---

_Made with ❤️ for learning and demonstration purposes._