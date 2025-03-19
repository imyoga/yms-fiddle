import './style.css'
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Default starter code
const defaultHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>YM Fiddle</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Start editing to see your changes</p>
</body>
</html>`;

const defaultCSS = `body {
  font-family: sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1 {
  color: #007acc;
}`;

const defaultJS = `// Your JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
  console.log('Fiddle loaded!');
});`;

// Initialize editors
let htmlEditor, cssEditor, jsEditor;

// Initialize the editors with CodeMirror
function initEditors() {
  // HTML Editor
  htmlEditor = new EditorView({
    state: EditorState.create({
      doc: defaultHTML,
      extensions: [
        basicSetup,
        html(),
        oneDark,
      ]
    }),
    parent: document.getElementById('html-editor')
  });

  // CSS Editor
  cssEditor = new EditorView({
    state: EditorState.create({
      doc: defaultCSS,
      extensions: [
        basicSetup,
        css(),
        oneDark,
      ]
    }),
    parent: document.getElementById('css-editor')
  });

  // JavaScript Editor
  jsEditor = new EditorView({
    state: EditorState.create({
      doc: defaultJS,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
      ]
    }),
    parent: document.getElementById('js-editor')
  });

  // Set up auto-update for preview
  const updateInterval = 500; // ms
  setInterval(updatePreview, updateInterval);
  
  // Setup export button
  document.getElementById('export-btn').addEventListener('click', exportProject);
}

// Update the preview iframe with the current content
function updatePreview() {
  const htmlContent = htmlEditor.state.doc.toString();
  const cssContent = cssEditor.state.doc.toString();
  const jsContent = jsEditor.state.doc.toString();

  const resultFrame = document.getElementById('result-frame');
  const frameDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
  
  // Clear the frame
  frameDoc.open();
  
  // Insert the HTML content
  frameDoc.write(htmlContent);
  
  // Insert the CSS
  const styleElement = frameDoc.createElement('style');
  styleElement.textContent = cssContent;
  frameDoc.head.appendChild(styleElement);
  
  // Insert the JavaScript
  const scriptElement = frameDoc.createElement('script');
  scriptElement.textContent = jsContent;
  frameDoc.body.appendChild(scriptElement);
  
  frameDoc.close();
}

// Export the project as a zip file
function exportProject() {
  const zip = new JSZip();
  
  // Get content from editors
  const htmlContent = htmlEditor.state.doc.toString();
  const cssContent = cssEditor.state.doc.toString();
  const jsContent = jsEditor.state.doc.toString();
  
  // Add files to the zip
  zip.file("index.html", htmlContent);
  zip.file("style.css", cssContent);
  zip.file("app.js", jsContent);
  
  // Generate the zip file and trigger download
  zip.generateAsync({ type: "blob" })
    .then(function(content) {
      // Use FileSaver to save the zip
      saveAs(content, "ym-fiddle-project.zip");
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initEditors);
