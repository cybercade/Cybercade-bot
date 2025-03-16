import { Category } from '@discordx/utilities';
import { CommandInteraction } from 'discord.js';
import { Client } from 'discordx';
import { Slash, Discord } from '@/decorators';
import { Guard } from '@/guards';
import { Pool } from 'pg';

// PostgreSQL-Pool (stelle sicher, dass DATABASE_URL in deinen Umgebungsvariablen gesetzt ist)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

@Discord()
@Category('RSS')
export default class RssSubscribeCommand {
  
  @Slash({
    name: 'rsssubscribe',
  })
  @Guard()
  async rsssubscribe(
    interaction: CommandInteraction,
    client: Client,
    { localize }: InteractionData
  ): Promise<void> {
    const feedUrl = interaction.options.getString('feedurl', true);
    const guildId = interaction.guild?.id;
    const channelId = interaction.channel?.id;

    if (!guildId || !channelId) {
      await interaction.followUp({ content: 'Dieser Befehl kann nur in einem Server verwendet werden.', ephemeral: true });
      return;
    }

    try {
      await pool.query(
        `INSERT INTO rss_subscriptions (guild_id, channel_id, feed_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (guild_id, channel_id) DO UPDATE SET feed_url = EXCLUDED.feed_url`,
        [guildId, channelId, feedUrl]
      );
      await interaction.followUp(`Dieser Kanal wurde erfolgreich für RSS-Updates abonniert: ${feedUrl}`);
    } catch (error) {
      await interaction.followUp({ content: 'Beim Abonnieren des RSS-Feeds ist ein Fehler aufgetreten.', ephemeral: true });
    }
  }
}
