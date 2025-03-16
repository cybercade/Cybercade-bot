import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class RssSubscription {

  @PrimaryKey()
  guildId!: string;

  @PrimaryKey()
  channelId!: string;

  @Property()
  feedUrl!: string;
}
