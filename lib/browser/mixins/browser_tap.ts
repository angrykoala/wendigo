import BrowserWait from './browser_wait';

import { WendigoError, QueryError } from '../../errors';
import { WendigoSelector } from '../../types';
import DomElement from '../../models/dom_element';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';

export default abstract class BrowserTap extends BrowserWait {
    @FailIfNotLoaded
    public async tap(selector: WendigoSelector | number, index?: number): Promise<number> {
        if (typeof selector === 'number') {
            if (typeof index !== 'number') throw new WendigoError("tap", "Invalid coordinates");
            return this.tapCoordinates(selector, index);
        }

        return this.queryAll(selector).then((elements) => {
            const indexErrorMsg = `invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
            const notFoundMsg = `No element "${selector}" found.`;
            return this.tapElements(elements, index, new WendigoError("tap", indexErrorMsg), new QueryError("tap", notFoundMsg));
        });
    }

    private tapElements(elements: Array<DomElement>, index: number | undefined, indexError: Error, notFoundError: Error): Promise<number> {
        if (index !== undefined) {
            return this.validateAndTapElementByIndex(elements, index, indexError);
        } else {
            return this.validateAndTapElements(elements, notFoundError);
        }
    }

    private async validateAndTapElementByIndex(elements: Array<DomElement>, index: number, error: Error): Promise<number> {
        if (index > elements.length || index < 0 || !elements[index]) {
            throw error;
        }
        await elements[index].tap();
        return 1;
    }

    private async validateAndTapElements(elements: Array<DomElement>, error: Error): Promise<number> {
        if (elements.length <= 0 || !elements[0]) {
            return Promise.reject(error);
        }
        for (const e of elements) {
            await e.tap();
        }
        return elements.length;
    }

    private async tapCoordinates(x: number, y: number): Promise<number> {
        await this._page.touchscreen.tap(x, y);
        return 1;
    }
}
