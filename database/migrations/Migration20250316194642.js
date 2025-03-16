'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250316194642 extends Migration {

  async up() {
    this.addSql(`create table \`rss_subscription\` (\`guild_id\` text not null, \`channel_id\` text not null, \`feed_url\` text not null, primary key (\`guild_id\`, \`channel_id\`));`);

    this.addSql(`alter table \`guild\` add column \`primary_color\` text null;`);
  }

}
exports.Migration20250316194642 = Migration20250316194642;
