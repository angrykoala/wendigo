import BrowserEdit from './browser_edit';

import { WendigoSelector } from '../../types';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';

export default abstract class BrowserEvents extends BrowserEdit {

    @FailIfNotLoaded
    public triggerEvent(selector: WendigoSelector, eventName: string, options: EventInit): Promise<void> {
        return this.evaluate((q, evName, opt) => {
            const ev = new Event(evName, opt);
            const elements = WendigoUtils.queryAll(q);
            for (const e of elements) {
                e.dispatchEvent(ev);
            }
        }, selector, eventName, options);
    }
}
