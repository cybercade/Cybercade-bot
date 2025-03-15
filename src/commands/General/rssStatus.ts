// commands/rssStatus.ts
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { Logger } from 'tscord/logger';
import Parser from 'rss-parser';

const parser = new Parser();

const command = {
  data: new SlashCommandBuilder()
    .setName('rssstatus')
    .setDescription('Zeigt den aktuellen Stand eines RSS-Feeds an.')
    .addStringOption(option =>
      option.setName('feedurl')
        .setDescription('Die URL des RSS-Feeds')
        .setRequired(true)),
  async execute(interaction: CommandInteraction, logger: Logger): Promise<void> {
    const feedUrl = interaction.options.getString('feedurl', true);
    logger.info(`rssstatus von ${interaction.user.tag} für Feed ${feedUrl}`);
    
    try {
      const feed = await parser.parseURL(feedUrl);
      const latestItem = feed.items[0];
      if (!latestItem) {
        await interaction.reply('Der RSS-Feed enthält keine Artikel.');
        return;
      }
      const replyMessage = `Letzter Artikel: **${latestItem.title}**\nVeröffentlicht am: ${latestItem.pubDate || 'Unbekannt'}`;
      await interaction.reply(replyMessage);
    } catch (error) {
      logger.error('Fehler bei rssstatus:', error);
      await interaction.reply({ content: 'Beim Abrufen des RSS-Feeds ist ein Fehler aufgetreten.', ephemeral: true });
    }
  },
};

export default command;
