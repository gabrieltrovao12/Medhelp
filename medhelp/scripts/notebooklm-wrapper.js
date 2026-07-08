// Polyfill DOMMatrix for Node.js environments (required by pdf-parse on Node v18)
if (typeof global.DOMMatrix === 'undefined') {
  try {
    global.DOMMatrix = require('dommatrix');
  } catch (e) {
    console.warn("⚠️ Não foi possível carregar a biblioteca 'dommatrix'. Usando stub básico.");
    global.DOMMatrix = class DOMMatrix {
      constructor() {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      }
    };
  }
}

// Inicia o servidor MCP original do NotebookLM usando import() dinâmico para ES Modules
import('../node_modules/notebooklm-mcp-server/dist/index.js')
  .catch(err => {
    console.error("❌ Falha ao iniciar o notebooklm-mcp-server:", err);
    process.exit(1);
  });
