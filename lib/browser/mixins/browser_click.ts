import BrowserActions from './browser_actions';

import { WendigoError, QueryError } from '../../errors';
import DomElement from '../../models/dom_element';
import { WendigoSelector } from '../../types';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';
import OverrideError from '../../decorators/override_error';

export default abstract class BrowserClick extends BrowserActions {

    @FailIfNotLoaded
    public async click(selector: WendigoSelector | number | Array<DomElement>, index?: number): Promise<number> {
        if (typeof selector === 'number') {
            if (!index || typeof index !== 'number') throw new WendigoError("click", `Invalid coordinates [${selector}, ${index}]`);
            await this._clickCoordinates(selector, index);
            return 1; // Returns always one click made
        } else {
            let elements: Array<DomElement>;
            if (Array.isArray(selector)) elements = selector;
            else elements = await this.queryAll(selector);
            const indexErrorMsg = `Invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
            const notFoundMsg = `No element "${selector}" found.`;
            return this._clickElements(elements, index, new WendigoError("click", indexErrorMsg), new QueryError("click", notFoundMsg));
        }
    }

    @FailIfNotLoaded
    @OverrideError()
    public async clickText(text: string | DomElement, optionalText?: string | number, index?: number): Promise<number> {
        if (typeof optionalText === 'number') {
            index = optionalText;
            optionalText = undefined;
        }
        let elements: Array<DomElement>;
        elements = await this.findByText(text, optionalText);
        const indexErrorMsg = `Invalid index "${index}" for text "${optionalText || text}", ${elements.length} elements found.`;
        const notFoundMsg = `No element with text "${optionalText || text}" found.`;
        return this._clickElements(elements, index, new WendigoError("clickText", indexErrorMsg), new QueryError("clickText", notFoundMsg));
    }

    @FailIfNotLoaded
    @OverrideError()
    public async clickTextContaining(text: string | DomElement, optionalText?: string | number, index?: number): Promise<number> {
        if (typeof optionalText === 'number') {
            index = optionalText;
            optionalText = undefined;
        }
        let elements: Array<DomElement>;
        elements = await this.findByTextContaining(text, optionalText);
        const indexErrorMsg = `Invalid index "${index}" for text containing "${optionalText || text}", ${elements.length} elements found.`;
        const notFoundMsg = `No element with text containing "${optionalText || text}" found.`;
        return this._clickElements(elements, index, new WendigoError("clickTextContaining", indexErrorMsg), new QueryError("clickTextContaining", notFoundMsg));

    }

    @FailIfNotLoaded
    private _clickElements(elements: Array<DomElement>, index: number | undefined, indexError: Error, notFoundError: Error): Promise<number> {
        if (index !== undefined) {
            return this._validateAndClickElementByIndex(elements, index, indexError);
        } else {
            return this._validateAnd_clickElements(elements, notFoundError);
        }
    }

    private async _validateAndClickElementByIndex(elements: Array<DomElement>, index: number, error: Error): Promise<number> {
        if (index > elements.length || index < 0 || !elements[index]) {
            throw error;
        }
        await elements[index].click();
        return 1;
    }

    private async _validateAnd_clickElements(elements: Array<DomElement>, error: Error): Promise<number> {
        if (elements.length <= 0 || !elements[0]) {
            throw error;
        }
        for (const e of elements) {
            await e.click();
        }
        return elements.length;
    }

    private _clickCoordinates(x: number, y: number): Promise<void> {
        return this._page.mouse.click(x, y);
    }
}
