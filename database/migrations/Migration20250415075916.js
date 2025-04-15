'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250415075916 extends Migration {

  async up() {
    this.addSql(`create table \`rss_subscription\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`guild_id\` text not null, \`channel_id\` text not null, \`feed_url\` text not null);`);
  }

}
exports.Migration20250415075916 = Migration20250415075916;
