import { Schedule, Service } from '@/decorators'
import { Database } from './Database';
import { RssSubscription } from '@/entities';

@Service()
export class RssService {
    private isChecking = false

    constructor(
        private db: Database
    ) { }

    @Schedule('*/5 * * * *')
    async checkRssUpdates() {
        if(!this.isChecking) {
            const subsRepo = this.db.get(RssSubscription)
            const subscriptions = await subsRepo.findAll()

            await subscriptions.map(async(sub) => {
                // When there is no last item, post only the latest
                if(!sub.lastItem) {

                    return
                }
                
            })
        }
    }
    
}