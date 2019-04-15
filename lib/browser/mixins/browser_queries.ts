import BrowserCore from '../browser_core';
import { ElementHandle } from 'puppeteer';

import DomElement from '../../models/dom_element';
import { FatalError, WendigoError } from '../../errors';
import { CssSelector, XPathSelector, WendigoSelector } from '../../types';
import { isXPathQuery } from '../../utils/utils';

export default abstract class BrowserQueries extends BrowserCore {
    public async query(selector: WendigoSelector, optionalSelector?: string): Promise<DomElement | null> {
        this.failIfNotLoaded("query");

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
        this.failIfNotLoaded("queryAll");
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

    public async queryXPath(xPath: XPathSelector): Promise<Array<DomElement>> {
        this.failIfNotLoaded("queryXPath");
        const elements = await this.page.$x(xPath);
        return elements.map((e) => {
            return DomElement.processQueryResult(e, xPath);
        }).filter(b => Boolean(b)) as Array<DomElement>;
    }

    public async findByText(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        this.failIfNotLoaded("findByText");
        const xPathText = optionalText || text;
        const xPath = `//*[text()='${xPathText}']`;
        if (optionalText) {
            return this.queryAll(text, xPath);
        } else {
            return this.queryAll(xPath);
        }
    }

    public async findByTextContaining(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        this.failIfNotLoaded("findByTextContaining");
        const xPathText = optionalText || text;
        const xPath = `//*[contains(text(),'${xPathText}')]`;
        if (optionalText) {
            return this.queryAll(text, xPath);
        } else {
            const result = this.queryAll(xPath);
            return result;
        }
    }

    public findByAttribute(attributeName: string, attributeValue?: string): Promise<Array<DomElement>> {
        this.failIfNotLoaded("findByAttribute");
        if (attributeValue === undefined) {
            attributeValue = "";
        } else {
            attributeValue = `='${attributeValue}'`;
        }
        return this.queryAll(`[${attributeName}${attributeValue}]`);
    }

    public findCssPath(domElement: DomElement): Promise<CssSelector> {
        this.failIfNotLoaded("findCssPath");
        if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findCssPath", "Invalid element for css path query."));
        else return this.evaluate((e) => {
            return WendigoUtils.findCssPath(e);
        }, domElement);
    }

    public findXPath(domElement: DomElement): Promise<XPathSelector> {
        this.failIfNotLoaded("findXPath");
        if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findXPath", "Invalid element for xPath query."));
        else return this.evaluate((e) => {
            return WendigoUtils.findXPath(e);
        }, domElement);
    }

    public elementFromPoint(x: number, y: number): Promise<DomElement | null> {
        this.failIfNotLoaded("elementFromPoint");
        if (typeof x !== 'number' || typeof y !== 'number') return Promise.reject(new FatalError("elementFromPoint", `Invalid coordinates [${x},${y}].`));
        return this.evaluate((evalX, evalY) => {
            const element = document.elementFromPoint(evalX, evalY);
            return element;
        }, x, y);
    }

    // private subQueryXpath(parent: DomElement, selector: XPathSelector): Promise<Array<DomElement>> {
    //     if (selector[0] === "/") selector = `.${selector}`;
    //     // return parent.queryXPath(selector);
    //     return Promise.resolve([]);
    // }
}
