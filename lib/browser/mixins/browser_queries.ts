import BrowserCore from '../browser_core';
import { ElementHandle } from 'puppeteer';

import DomElement from '../../models/dom_element';
import { FatalError, WendigoError } from '../../errors';
import { WendigoSelector } from '../../types';
import { isXPathQuery, cleanStringForXpath } from '../../utils/utils';

export default abstract class BrowserQueries extends BrowserCore {
    public async query(selector: WendigoSelector, optionalSelector?: string): Promise<DomElement | null> {
        this._failIfNotLoaded("query");

        let result: DomElement | null;
        if (typeof selector === 'string') {
            let elementHandle: ElementHandle | null;
            if (isXPathQuery(selector)) {
                const results = await this.page.$x(selector);
                elementHandle = results[0] || null;
            } else elementHandle = await this.page.$(selector);
            result = DomElement.processQueryResult(elementHandle, selector);
        } else if (selector instanceof DomElement) result = selector;
        else throw new WendigoError("query", "Invalid selector.");

        if (!optionalSelector) return result;
        else {
            if (!result) return null;
            else return result.query(optionalSelector);
        }
    }

    public async queryAll(selector: WendigoSelector, optionalSelector?: string): Promise<Array<DomElement>> {
        this._failIfNotLoaded("queryAll");
        let result: Array<DomElement>;

        if (typeof selector === 'string') {
            let rawElements: Array<ElementHandle>;
            if (isXPathQuery(selector)) rawElements = await this.page.$x(selector);
            else rawElements = await this.page.$$(selector);
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

    public async findByText(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        this._failIfNotLoaded("findByText");
        const xPathText = optionalText || text as string;
        const xPath = `//*[text()=${cleanStringForXpath(xPathText)}]`;

        if (optionalText) {
            try {
                return await this.queryAll(text, xPath);
            } catch (err) {
                throw WendigoError.overrideFnName(err, "findByText");
            }
        } else {
            return this.queryAll(xPath);
        }
    }

    public async findByTextContaining(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        this._failIfNotLoaded("findByTextContaining");
        const xPathText = optionalText || text as string;
        const xPath = `//*[contains(text(),${cleanStringForXpath(xPathText)})]`;
        if (optionalText) {
            try {
                return await this.queryAll(text, xPath);
            } catch (err) {
                throw WendigoError.overrideFnName(err, "findByTextContaining");
            }
        } else {
            const result = this.queryAll(xPath);
            return result;
        }
    }

    public findByAttribute(attributeName: string, attributeValue?: string): Promise<Array<DomElement>> {
        this._failIfNotLoaded("findByAttribute");
        if (attributeValue === undefined) {
            attributeValue = "";
        } else {
            attributeValue = `='${attributeValue}'`;
        }
        return this.queryAll(`[${attributeName}${attributeValue}]`);
    }

    public findCssPath(domElement: DomElement): Promise<string> {
        this._failIfNotLoaded("findCssPath");
        if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findCssPath", "Invalid element for css path query."));
        else return this.evaluate((e) => {
            return WendigoUtils.findCssPath(e);
        }, domElement);
    }

    public findXPath(domElement: DomElement): Promise<string> {
        this._failIfNotLoaded("findXPath");
        if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findXPath", "Invalid element for xPath query."));
        else return this.evaluate((e) => {
            return WendigoUtils.findXPath(e);
        }, domElement);
    }

    public elementFromPoint(x: number, y: number): Promise<DomElement | null> {
        this._failIfNotLoaded("elementFromPoint");
        if (typeof x !== 'number' || typeof y !== 'number') return Promise.reject(new FatalError("elementFromPoint", `Invalid coordinates [${x},${y}].`));
        return this.evaluate((evalX, evalY) => {
            const element = document.elementFromPoint(evalX, evalY);
            return element;
        }, x, y);
    }
}
