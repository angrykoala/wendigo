import BrowserInfo from './browser_info';

import { WendigoSelector } from '../../types';
import { QueryError } from '../../errors';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';
import OverrideError from '../../decorators/override_error';

// Mixin with methods to edit the DOM and state
export default abstract class BrowserEdit extends BrowserInfo {

    @FailIfNotLoaded
    @OverrideError()
    public async addClass(selector: WendigoSelector, className: string): Promise<void> {
            const rawClasses = await this.attribute(selector, "class");
            await this.setAttribute(selector, "class", `${rawClasses} ${className}`);
    }

    @FailIfNotLoaded
    @OverrideError()
    public async removeClass(selector: WendigoSelector, className: string): Promise<void> {
            const classList = await this.class(selector);
            const finalClassList = classList.filter((cl) => {
                return cl !== className;
            });
            await this.setAttribute(selector, "class", finalClassList.join(" "));
    }

    @FailIfNotLoaded
    public async setAttribute(selector: WendigoSelector, attribute: string, value: string): Promise<void> {
        try {
            await this.evaluate((q, attr, val) => {
                const element = WendigoUtils.queryElement(q);
                if (val === null) element.removeAttribute(attr);
                else element.setAttribute(attr, val);
            }, selector, attribute, value);
        } catch (err) {
            throw new QueryError("setAttribute", `Element "${selector}" not found.`);
        }
    }
}
