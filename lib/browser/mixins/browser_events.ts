import BrowserEdit from './browser_edit';

import { WendigoSelector } from '../../types';

export default abstract class BrowserEvents extends BrowserEdit {
    public triggerEvent(selector: WendigoSelector, eventName: string, options: EventInit): Promise<void> {
        this._failIfNotLoaded("triggerEvent");
        return this.evaluate((q, evName, opt) => {
            const ev = new Event(evName, opt);
            const elements = WendigoUtils.queryAll(q);
            for (const e of elements) {
                e.dispatchEvent(ev);
            }
        }, selector, eventName, options);
    }
}
