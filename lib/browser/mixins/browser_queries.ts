import BrowserCore from '../browser_core';

import DomElement from '../../models/dom_element';
import { FatalError, WendigoError } from '../../errors';
import { WendigoSelector } from '../../types';
import { isXPathQuery, createFindTextXPath } from '../../utils/utils';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';
import OverrideError from '../../decorators/override_error';
import { ElementHandle } from '../../puppeteer_wrapper/puppeteer_types';

export default abstract class BrowserQueries extends BrowserCore {

    @FailIfNotLoaded
    public async query(selector: WendigoSelector, optionalSelector?: string): Promise<DomElement | null> {

        let result: DomElement | null;
        if (typeof selector === 'string') {
            let elementHandle: ElementHandle | null;
            if (isXPathQuery(selector)) {
                const results = await this._page.$x(selector);
                elementHandle = results[0] || null;
            } else elementHandle = await this._page.$(selector);
            result = DomElement.processQueryResult(elementHandle, selector);
        } else if (selector instanceof DomElement) result = selector;
        else throw new WendigoError("query", "Invalid selector.");

        if (!optionalSelector) return result;
        else {
            if (!result) return null;
            else return result.query(optionalSelector);
        }
    }

    @FailIfNotLoaded
    public async queryAll(selector: WendigoSelector, optionalSelector?: string): Promise<Array<DomElement>> {
        let result: Array<DomElement>;

        if (typeof selector === 'string') {
            let rawElements: Array<ElementHandle>;
            if (isXPathQuery(selector)) rawElements = await this._page.$x(selector);
            else rawElements = await this._page.$$(selector);
            result = rawElements.map((e) => {
                return DomElement.processQueryResult(e, selector);
            }).filter(b => Boolean(b)) as Array<DomElement>;
        } else if (selector instanceof DomElement) result = [selector];
        else throw new WendigoError("queryAll", "Invalid selector.");

        if (!optionalSelector) return result;
        else {
            const subQueryPromises = result.map((r) => {
                return r.queryAll(optionalSelector);
            });
            const nestedResults = await Promise.all(subQueryPromises);
            return nestedResults.reduce((acc, res) => {
                return acc.concat(res);
            }, []);
        }
    }

    @FailIfNotLoaded
    @OverrideError()
    public async findByText(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        const xPathText = optionalText || text as string;
        const xPath = createFindTextXPath(xPathText);

        if (optionalText) {
            return await this.queryAll(text, xPath);
        } else {
            return this.queryAll(xPath);
        }
    }

    // @FailIfNotLoaded
    // @OverrideError()
    // public async findByLabel(text: string): Promise<Array<DomElement>> {
    //     const xPath = createFindTextXPath(text, false, "label");
    //     const elements = await this.queryAll(xPath);
    //     // elements[0].
    //     // Get attributes of dom element
    //     //search by id
    //     return elements
    //
    //     // const xPathText = optionalText || text as string;
    //     // const xPath = createFindTextXPath(xPathText);
    //     //
    //     // if (optionalText) {
    //     //     return await this.queryAll(text, xPath);
    //     // } else {
    //     //     return this.queryAll(xPath);
    //     // }
    // }

    @FailIfNotLoaded
    @OverrideError()
    public async findByTextContaining(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        const xPathText = optionalText || text as string;
        const xPath = createFindTextXPath(xPathText, true);

        if (optionalText) {
            return await this.queryAll(text, xPath);
        } else {
            const result = this.queryAll(xPath);
            return result;
        }
    }

    @FailIfNotLoaded
    public findByAttribute(attributeName: string, attributeValue?: string): Promise<Array<DomElement>> {
        if (attributeValue === undefined) {
            attributeValue = "";
        } else {
            attributeValue = `='${attributeValue}'`;
        }
        return this.queryAll(`[${attributeName}${attributeValue}]`);
    }

    @FailIfNotLoaded
    public findCssPath(domElement: DomElement): Promise<string> {
        if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findCssPath", "Invalid element for css path query."));
        else return this.evaluate((e) => {
            return WendigoUtils.findCssPath(e);
        }, domElement);
    }

    @FailIfNotLoaded
    public findXPath(domElement: DomElement): Promise<string> {
        if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findXPath", "Invalid element for xPath query."));
        else return this.evaluate((e) => {
            return WendigoUtils.findXPath(e);
        }, domElement);
    }

    @FailIfNotLoaded
    public elementFromPoint(x: number, y: number): Promise<DomElement | null> {
        if (typeof x !== 'number' || typeof y !== 'number') return Promise.reject(new FatalError("elementFromPoint", `Invalid coordinates [${x},${y}].`));
        return this.evaluate((evalX, evalY) => {
            const element = document.elementFromPoint(evalX, evalY);
            return element;
        }, x, y);
    }
}
