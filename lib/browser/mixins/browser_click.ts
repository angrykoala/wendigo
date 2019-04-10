import BrowserActions from './browser_actions';

import { WendigoError, QueryError } from '../../errors';
import DomElement from '../../models/dom_element';
import { WendigoSelector } from '../../types';

export default abstract class BrowserClick extends BrowserActions {
    public async click(selector: WendigoSelector | number, index?: number): Promise<number> {
        this.failIfNotLoaded("click");
        if (typeof selector === 'number') {
            if (!index || typeof index !== 'number') throw new WendigoError("click", `Invalid coordinates [${selector}, ${index}]`);
            await this.clickCoordinates(selector, index);
            return 1; // Returns always one click made
        } else {
            const elements = await this.queryAll(selector);
            const indexErrorMsg = `invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
            const notFoundMsg = `No element "${selector}" found.`;
            return this.clickElements(elements, index, new WendigoError("click", indexErrorMsg), new QueryError("click", notFoundMsg));
        }
    }

    public async clickText(text: string | DomElement, optionalText?: string | number, index?: number): Promise<number> {
        this.failIfNotLoaded("clickText");
        if (typeof optionalText === 'number') {
            index = optionalText;
            optionalText = undefined;
        }
        const elements = await this.findByText(text, optionalText);

        const indexErrorMsg = `invalid index "${index}" for text "${optionalText || text}", ${elements.length} elements found.`;
        const notFoundMsg = `No element with text "${optionalText || text}" found.`;
        return this.clickElements(elements, index, new WendigoError("clickText", indexErrorMsg), new QueryError("clickText", notFoundMsg));
    }

    public async clickTextContaining(text: string | DomElement, optionalText?: string | number, index?: number): Promise<number> {
        this.failIfNotLoaded("clickTextContaining");
        if (typeof optionalText === 'number') {
            index = optionalText;
            optionalText = undefined;
        }
        const elements = await this.findByTextContaining(text, optionalText);
        const indexErrorMsg = `invalid index "${index}" for text containing "${optionalText || text}", ${elements.length} elements found.`;
        const notFoundMsg = `No element with text containing "${optionalText || text}" found.`;
        return this.clickElements(elements, index, new WendigoError("clickTextContaining", indexErrorMsg), new QueryError("clickTextContaining", notFoundMsg));

    }

    private clickElements(elements: Array<DomElement>, index: number | undefined, indexError: Error, notFoundError: Error): Promise<number> {
        if (index !== undefined) {
            return this.validateAndClickElementByIndex(elements, index, indexError);
        } else {
            return this.validateAndClickElements(elements, notFoundError);
        }
    }

    private async validateAndClickElementByIndex(elements: Array<DomElement>, index: number, error: Error): Promise<number> {
        if (index > elements.length || index < 0 || !elements[index]) {
            throw error;
        }
        await elements[index].click();
        return 1;
    }

    private async validateAndClickElements(elements: Array<DomElement>, error: Error): Promise<number> {
        if (elements.length <= 0 || !elements[0]) {
            throw error;
        }
        for (const e of elements) {
            await e.click();
        }
        return elements.length;
    }

    private clickCoordinates(x: number, y: number): Promise<void> {
        return this.page.mouse.click(x, y);
    }
}
