'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250418123024 extends Migration {

  async up() {
    this.addSql(`alter table \`guild\` drop column \`bot_icon\`;`);
    this.addSql(`alter table \`guild\` drop column \`bot_name\`;`);
  }

}
exports.Migration20250418123024 = Migration20250418123024;
