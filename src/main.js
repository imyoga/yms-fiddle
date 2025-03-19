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
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            updatePreview();
          }
        })
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
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            updatePreview();
          }
        })
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
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            updatePreview();
          }
        })
      ]
    }),
    parent: document.getElementById('js-editor')
  });
  
  // Initial preview render
  updatePreview();
  
  // Setup export button
  document.getElementById('export-btn').addEventListener('click', exportProject);
  
  // Setup run button
  document.getElementById('run-btn').addEventListener('click', updatePreview);
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
  
  // Create a modified version of HTML without external references
  let modifiedHTML = htmlContent;
  
  // Remove any external scripts that might reference app.js
  modifiedHTML = modifiedHTML.replace(/<script[^>]*src=["']app\.js["'][^>]*><\/script>/g, '');
  
  // Remove any external CSS that might reference style.css
  modifiedHTML = modifiedHTML.replace(/<link[^>]*href=["']style\.css["'][^>]*>/g, '');
  
  // Insert the modified HTML content
  frameDoc.write(modifiedHTML);
  
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
  
  // Get project name from input, fallback to default if empty
  let projectName = document.getElementById('project-name').value.trim();
  if (!projectName) {
    projectName = 'my-project';
    document.getElementById('project-name').value = projectName;
  }
  
  // Sanitize filename (remove invalid characters)
  projectName = projectName.replace(/[^\w\-]/g, '-');
  
  // Generate the zip file and trigger download
  zip.generateAsync({ type: "blob" })
    .then(function(content) {
      // Use FileSaver to save the zip with the project name
      saveAs(content, `${projectName}.zip`);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initEditors);
