'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20250416142252 extends Migration {

	async up() {
		this.addSql(`pragma foreign_keys = off;`)
		this.addSql(`create table \`rss_subscription__temp_alter\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`guild_id\` text not null, \`channel_id\` text not null, \`feed_url\` text not null, \`last_item\` text null);`)
		this.addSql(`insert into \`rss_subscription__temp_alter\` select * from \`rss_subscription\`;`)
		this.addSql(`drop table \`rss_subscription\`;`)
		this.addSql(`alter table \`rss_subscription__temp_alter\` rename to \`rss_subscription\`;`)
		this.addSql(`pragma foreign_keys = on;`)
	}

}
exports.Migration20250416142252 = Migration20250416142252
