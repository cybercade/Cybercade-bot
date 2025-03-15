// commands/rssSubscribe.ts
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { Logger } from 'tscord/logger';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const command = {
  data: new SlashCommandBuilder()
    .setName('rsssubscribe')
    .setDescription('Abonniere diesen Kanal für RSS-Updates.')
    .addStringOption(option =>
      option.setName('feedurl')
        .setDescription('Die URL des RSS-Feeds')
        .setRequired(true)),
  async execute(interaction: CommandInteraction, logger: Logger): Promise<void> {
    const feedUrl = interaction.options.getString('feedurl', true);
    const guildId = interaction.guild?.id;
    const channelId = interaction.channel?.id;
    logger.info(`rsssubscribe von ${interaction.user.tag} in Kanal ${channelId} für Feed ${feedUrl}`);
    
    if (!guildId || !channelId) {
      await interaction.reply({ content: 'Dieser Befehl kann nur in einem Server verwendet werden.', ephemeral: true });
      return;
    }
    
    try {
      const dbClient = await pool.connect();
      try {
        await dbClient.query(
          `INSERT INTO rss_subscriptions (guild_id, channel_id, feed_url)
           VALUES ($1, $2, $3)
           ON CONFLICT (guild_id, channel_id) DO UPDATE SET feed_url = EXCLUDED.feed_url`,
          [guildId, channelId, feedUrl]
        );
      } finally {
        dbClient.release();
      }
      await interaction.reply(`Dieser Kanal wurde erfolgreich für RSS-Updates abonniert: ${feedUrl}`);
    } catch (error) {
      logger.error('Fehler bei rsssubscribe:', error);
      await interaction.reply({ content: 'Beim Abonnieren des RSS-Feeds ist ein Fehler aufgetreten.', ephemeral: true });
    }
  },
};

export default command;
