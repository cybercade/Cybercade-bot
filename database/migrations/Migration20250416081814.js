'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250416081814 extends Migration {

  async up() {
    this.addSql(`alter table \`rss_subscription\` add column \`last_item\` text not null;`);
  }

}
exports.Migration20250416081814 = Migration20250416081814;
