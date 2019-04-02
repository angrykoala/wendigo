import BrowserInfo from './browser_info';
import { WendigoSelector } from '../types';

export default abstract class BrowserEvents extends BrowserInfo {
    public triggerEvent(selector: WendigoSelector, eventName: string, options: EventInit): Promise<void> {
        this.failIfNotLoaded("triggerEvent");
        return this.evaluate((q, evName, opt) => {
            const ev = new Event(evName, opt);
            const elements = WendigoUtils.queryAll(q);
            for (const e of elements) {
                e.dispatchEvent(ev);
            }
        }, selector, eventName, options);
    }
}
