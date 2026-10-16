/**
 * commandParser.js
 * Safely parses and executes terminal inputs against the dynamic command registry.
 * Zero eval or OS shell execution.
 */

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

  parse(input) {
    const raw = (input || '').trim();
    if (!raw) {
      return {
        valid: false,
        command: null,
        args: [],
        error: 'Empty command',
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
      return {
        valid: false,
        command: null,
        args,
        error: `Command not found: '${parts[0]}'. Type 'help' to see available commands.`,
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
        output: `Command disabled or unavailable.`,
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
        output: `Error executing command: ${err.message}`,
        type: 'error',
      };
    }
  }

  getCommandList() {
    return Object.keys(this.commands);
  }
}

export default CommandParser;
