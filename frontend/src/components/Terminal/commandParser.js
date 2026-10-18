/**
 * commandParser.js
 * Safely parses and executes terminal inputs against the dynamic command registry.
 * Zero eval or OS shell execution.
 * Provides helpful suggestions for mistyped commands and polished error responses.
 */

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

class CommandParser {
  constructor(registry) {
    this.registry = registry || { commands: {}, aliases: {} };
    this.aliases = registry.aliases || {};
    this.commands = registry.commands || {};
  }

  updateRegistry(newRegistry) {
    this.registry = newRegistry || { commands: {}, aliases: {} };
    this.aliases = newRegistry.aliases || {};
    this.commands = newRegistry.commands || {};
  }

  findSuggestion(name) {
    const candidates = [
      ...Object.keys(this.commands),
      ...Object.keys(this.aliases),
    ];

    let bestMatch = null;
    let minDistance = 3; // Only suggest if distance <= 2

    for (const candidate of candidates) {
      const dist = levenshteinDistance(name, candidate);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }

  parse(input) {
    const raw = (input || '').trim();
    if (!raw) {
      return {
        valid: false,
        command: null,
        args: [],
        error: '',
      };
    }

    const parts = raw.split(/\s+/);
    let commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Resolve alias if present
    if (this.aliases[commandName]) {
      commandName = this.aliases[commandName];
    }

    const commandDef = this.commands[commandName];
    if (!commandDef) {
      const suggestion = this.findSuggestion(parts[0].toLowerCase());
      const suggestionText = suggestion ? ` Did you mean '${suggestion}'?` : '';

      return {
        valid: false,
        command: null,
        args,
        error: `Command not found: '${parts[0]}'.${suggestionText} Type 'help' to view all available commands.`,
      };
    }

    return {
      valid: true,
      command: commandName,
      originalInput: input,
      args,
      description: commandDef.description,
      metadata: commandDef.metadata || {},
    };
  }

  execute(parsed) {
    if (!parsed.valid) {
      return {
        success: false,
        output: parsed.error,
        type: 'error',
      };
    }

    const commandDef = this.commands[parsed.command];
    if (!commandDef) {
      return {
        success: false,
        output: `Command '${parsed.command}' is currently disabled. Type 'help' to view active commands.`,
        type: 'error',
      };
    }

    try {
      if (parsed.command === 'clear') {
        return {
          success: true,
          output: null,
          type: 'clear',
          command: parsed.command,
        };
      }

      let response = commandDef.response;
      if (typeof response === 'function') {
        response = response(parsed.args, parsed.originalInput);
      }

      if (commandDef.metadata?.type === 'link') {
        return {
          success: true,
          output: response,
          type: 'link',
          url: commandDef.metadata.url,
          command: parsed.command,
        };
      }

      if (commandDef.metadata?.type === 'download') {
        return {
          success: true,
          output: response,
          type: 'download',
          fileUrl: commandDef.metadata.fileUrl,
          fileName: commandDef.metadata.fileName || 'download.pdf',
          command: parsed.command,
        };
      }

      return {
        success: true,
        output: response,
        type: 'response',
        command: parsed.command,
        processTime: commandDef.metadata?.processTime || 0,
      };
    } catch (err) {
      return {
        success: false,
        output: `Error executing '${parsed.command}': ${err.message}`,
        type: 'error',
      };
    }
  }

  getCommandList() {
    return Object.keys(this.commands);
  }
}

export default CommandParser;
