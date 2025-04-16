import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { CustomBaseEntity } from './BaseEntity'

@Entity()
export class RssSubscription extends CustomBaseEntity {

  @PrimaryKey({autoincrement: true})
  id: number;

  @Property()
  guildId!: string;

  @Property()
  channelId!: string;

  @Property()
  feedUrl!: string;

  @Property()
  lastItem: string;
}
