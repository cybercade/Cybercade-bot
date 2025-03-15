// index.ts
import { Client, Intents, CommandInteraction } from 'discord.js';
import { createLogger, Logger } from 'tscord/logger';
import { startApiServer } from 'tscord/api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Augment the Discord Client to include a "commands" property.
declare module 'discord.js' {
  export interface Client {
    commands: Map<string, Command>;
  }
}

// Define an interface for our commands.
export interface Command {
  data: any; // The command definition (the JSON output of SlashCommandBuilder)
  execute(interaction: CommandInteraction, logger: Logger): Promise<void>;
}

// Initialize the TSCord logger with recommended settings.
const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: 'human',
  tag: '--tag',
});
logger.info('Logger initialisiert.');

// Create the Discord client.
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.commands = new Map<string, Command>();

// Resolve __dirname in an ES module context.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically load command files from the "commands" folder.
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  import(filePath)
    .then((commandModule) => {
      const command: Command = commandModule.default ?? commandModule;
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        logger.info(`Befehl geladen: ${command.data.name}`);
      } else {
        logger.warn(`Fehlende Eigenschaften in Datei: ${file}`);
      }
    })
    .catch((error) => {
      logger.error(`Fehler beim Laden der Datei ${file}:`, error);
    });
}

client.once('ready', () => {
  logger.info(`Bot ist online als ${client.user?.tag}`);
});

// Handle slash command interactions.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, logger);
  } catch (error) {
    logger.error(`Fehler beim Ausführen von ${interaction.commandName}:`, error);
    await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
  }
});

// Log in to Discord.
client.login(process.env.DISCORD_TOKEN || '')
  .catch(error => {
    logger.error('Fehler beim Einloggen in Discord:', error);
    process.exit(1);
});

// Start the API server if enabled.
if (process.env.ENABLE_API === 'true') {
  startApiServer({
    port: parseInt(process.env.API_PORT || '3000', 10),
    endpoints: [
      {
        path: '/status',
        method: 'GET',
        handler: (req, res) => {
          res.json({
            status: 'Server läuft',
            message: 'Der Bot ist online und funktioniert einwandfrei.',
          });
        },
      },
      {
        path: '/subscriptions',
        method: 'GET',
        handler: async (req, res) => {
          // Hier könnte man die aktuellen RSS-Abonnements aus der PostgreSQL-Datenbank abfragen.
          res.json({
            subscriptions: 'Hier stehen die aktuellen RSS-Abonnements (Beispiel).',
          });
        },
      },
    ],
  })
    .then(() => {
      logger.info(`API-Server gestartet auf Port ${process.env.API_PORT || '3000'}`);
    })
    .catch(error => {
      logger.error('Fehler beim Starten des API-Servers:', error);
    });
}
