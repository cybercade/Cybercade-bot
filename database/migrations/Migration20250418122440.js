'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250418122440 extends Migration {

  async up() {
    this.addSql(`alter table \`guild\` add column \`bot_icon\` text null;`);
    this.addSql(`alter table \`guild\` add column \`bot_name\` text null;`);
    this.addSql(`alter table \`guild\` add column \`color\` text null;`);
  }

}
exports.Migration20250418122440 = Migration20250418122440;
