import './style.css'
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { showMinimap } from '@replit/codemirror-minimap';
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

// Create minimap setup
function createMinimap() {
  const dom = document.createElement('div');
  return { dom };
}

// Minimap configuration
const minimapConfig = showMinimap.compute(['doc'], (state) => {
  return {
    create: createMinimap,
    displayText: 'blocks',
    showOverlay: 'always',
  };
});

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
        minimapConfig,
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
        minimapConfig,
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
        minimapConfig,
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
  
  // Setup button event listeners
  const exportBtn = document.getElementById('export-btn');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportProject);
  }
  
  if (runBtn) {
    runBtn.addEventListener('click', updatePreview);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', resetToBoilerplate);
    console.log('Clear button event listener set up');
  } else {
    console.error('Clear button not found in DOM');
  }
}

// Reset editors to default boilerplate code
function resetToBoilerplate() {
  console.log('Clearing all editors');
  
  try {
    // Clear HTML editor
    if (htmlEditor && htmlEditor.state) {
      htmlEditor.dispatch({
        changes: {from: 0, to: htmlEditor.state.doc.length, insert: ""}
      });
      console.log('HTML editor cleared');
    } else {
      console.error('HTML editor not initialized');
    }
    
    // Clear CSS editor  
    if (cssEditor && cssEditor.state) {
      cssEditor.dispatch({
        changes: {from: 0, to: cssEditor.state.doc.length, insert: ""}
      });
      console.log('CSS editor cleared');
    } else {
      console.error('CSS editor not initialized');
    }
    
    // Clear JS editor
    if (jsEditor && jsEditor.state) {
      jsEditor.dispatch({
        changes: {from: 0, to: jsEditor.state.doc.length, insert: ""}
      });
      console.log('JS editor cleared');
    } else {
      console.error('JS editor not initialized');
    }
    
    // Create an empty preview with minimal structure
    createEmptyPreview();
    
    console.log('Editors cleared');
  } catch (error) {
    console.error('Error during clearing:', error);
  }
}

// Create an empty preview with minimal structure
function createEmptyPreview() {
  try {
    const resultFrame = document.getElementById('result-frame');
    if (!resultFrame) {
      console.error('Result frame not found');
      return;
    }
    
    const frameDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
    
    // Clear the frame
    frameDoc.open();
    
    // Create a minimal HTML structure
    const emptyHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Empty Preview</title>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
              color: #666;
              font-family: sans-serif;
            }
            .message {
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="message">
            <p>Preview cleared. Start coding to see results.</p>
          </div>
        </body>
      </html>
    `;
    
    frameDoc.write(emptyHTML);
    frameDoc.close();
    
    console.log('Empty preview created');
  } catch (error) {
    console.error('Error creating empty preview:', error);
  }
}

// Expose function globally for debugging
window.resetEditors = resetToBoilerplate;

// Update the preview iframe with the current content
function updatePreview() {
  try {
    const htmlContent = htmlEditor.state.doc.toString();
    const cssContent = cssEditor.state.doc.toString();
    const jsContent = jsEditor.state.doc.toString();

    const resultFrame = document.getElementById('result-frame');
    if (!resultFrame) {
      console.error('Result frame not found');
      return;
    }
    
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
    frameDoc.write(modifiedHTML || '<html><head></head><body></body></html>');
    
    // If the document has no head or body, don't try to append elements
    if (!frameDoc.head || !frameDoc.body) {
      console.warn('Preview frame has no head or body elements');
      frameDoc.close();
      return;
    }
    
    // Insert the CSS
    if (cssContent) {
      const styleElement = frameDoc.createElement('style');
      styleElement.textContent = cssContent;
      frameDoc.head.appendChild(styleElement);
    }
    
    // Insert the JavaScript
    if (jsContent) {
      const scriptElement = frameDoc.createElement('script');
      scriptElement.textContent = jsContent;
      frameDoc.body.appendChild(scriptElement);
    }
    
    frameDoc.close();
  } catch (error) {
    console.error('Error updating preview:', error);
  }
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing editors and chat');
  
  // Check if all required elements exist
  const htmlEditorEl = document.getElementById('html-editor');
  const cssEditorEl = document.getElementById('css-editor');
  const jsEditorEl = document.getElementById('js-editor');
  const clearBtnEl = document.getElementById('clear-btn');
  
  if (!htmlEditorEl || !cssEditorEl || !jsEditorEl) {
    console.error('One or more editor elements not found:', {
      htmlEditor: !!htmlEditorEl,
      cssEditor: !!cssEditorEl,
      jsEditor: !!jsEditorEl
    });
  }
  
  if (!clearBtnEl) {
    console.error('Clear button not found');
  }
  
  // Add event delegation for the entire header actions area
  document.querySelector('.actions').addEventListener('click', (e) => {
    if (e.target && e.target.id === 'clear-btn') {
      console.log('Clear button clicked via delegation');
      resetToBoilerplate();
    }
  });
  
  initEditors();
  initChat();
});

// Initialize chat functionality
function initChat() {
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');
  
  // Sample initial message
  addMessage('Welcome to YM Fiddle Chat! I can help with HTML, CSS, and JavaScript. Ask me anything or request code samples.', 'other');
  
  // Send button click handler
  chatSendBtn.addEventListener('click', () => {
    sendMessage();
  });
  
  // Enter key press handler
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Function to send a message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      // Add user message to chat
      addMessage(message, 'user');
      
      // Clear input field
      chatInput.value = '';
      
      // Create a message div for the AI response
      const responseDiv = document.createElement('div');
      responseDiv.classList.add('message');
      responseDiv.classList.add('message-other');
      chatMessages.appendChild(responseDiv);
      
      // Scroll to the bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Stream response from Ollama API
      streamOllamaResponse(message, responseDiv);
    }
  }
  
  // Function to stream response from Ollama API
  async function streamOllamaResponse(message, responseDiv) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder:1.5b',
          prompt: `User question: ${message}\n\nPlease respond with concise, helpful information, explanations, or code examples. Keep explanations brief and to the point.`,
          stream: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse the JSON data (Ollama sends each chunk as a JSON object)
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              // Append to accumulated response
              accumulatedResponse += data.response;
              
              // Format and update the response div
              responseDiv.innerHTML = formatMarkdown(accumulatedResponse);
              
              // Scroll to the bottom
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error streaming from Ollama API:', error);
      responseDiv.textContent = `Sorry, I had trouble connecting to the AI service: ${error.message}`;
    }
  }
  
  // Function to add a message to the chat
  function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(`message-${type}`);
    
    if (type === 'other') {
      // Format all AI responses with markdown-style formatting
      const formattedText = formatMarkdown(text);
      messageDiv.innerHTML = formattedText;
    } else {
      messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
  }
  
  // Function to format all markdown content
  function formatMarkdown(text) {
    // Handle code blocks with syntax highlighting
    let formattedText = text.replace(/```(\w+)([\s\S]*?)```/g, function(match, language, code) {
      return `<pre><code class="${language}">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });
    
    // Handle code blocks without language specification
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, function(match, code) {
      return `<pre><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });
    
    // Handle inline code blocks
    formattedText = formattedText.replace(/`([^`]+)`/g, function(match, code) {
      return `<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    });
    
    // Handle headers
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Handle bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle links
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Handle unordered lists
    formattedText = formattedText.replace(/^\s*\*\s+(.*)/gm, '<li>$1</li>');
    formattedText = formattedText.replace(/<\/li>\s*<li>/g, '</li><li>');
    formattedText = formattedText.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    // Handle ordered lists
    formattedText = formattedText.replace(/^\s*\d+\.\s+(.*)/gm, '<li>$1</li>');
    formattedText = formattedText.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');
    
    // Convert newlines to <br> for remaining newlines
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  }
}
