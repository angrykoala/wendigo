import DomElement from '../models/dom_element';
import { FatalError, WendigoError, QueryError } from '../errors';
import BrowserCore from './browser_core';
import { CssSelector, XPathSelector } from '../types';

export default abstract class BrowserQueries extends BrowserCore {
    public async query(selector: CssSelector | DomElement, optionalSelector?: CssSelector): Promise<DomElement | null> {
        this.failIfNotLoaded("query");
        if (optionalSelector) {
            if (!(selector instanceof DomElement)) return Promise.reject(new WendigoError("query", "Invalid parent element."));
            return this.subQuery(selector, optionalSelector);
        }
        if (typeof selector === 'string') {
            const elementHandle = await this.page.$(selector);
            return DomElement.processQueryResult(elementHandle, selector);
        } else if (selector instanceof DomElement) return Promise.resolve(selector);
        else return Promise.reject(new FatalError("query", "Invalid Selector on browser.query."));
    }

    public async queryAll(selector: CssSelector | DomElement, optionalSelector?: CssSelector): Promise<Array<DomElement>> {
        this.failIfNotLoaded("queryAll");
        if (optionalSelector) {
            if (!(selector instanceof DomElement)) throw new WendigoError("queryAll", "Invalid parent element.");
            return this.subQueryAll(selector, optionalSelector);
        }
        if (typeof selector === 'string') {
            const elements = await this.page.$$(selector);
            return elements.map((e) => {
                return DomElement.processQueryResult(e, selector);
            }).filter(b => Boolean(b)) as Array<DomElement>;
        } else if (!Array.isArray(selector)) { // TODO: throw error if selector is nor domelement
            return [selector];
        } else return selector;
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
            const elem = await this.query(text);
            if (!elem) throw new QueryError("findByText", `Element ${text} not found.`);
            return this.subQueryXpath(elem, xPath);
        } else {
            return this.queryXPath(xPath);
        }
    }

    public async findByTextContaining(text: string | DomElement, optionalText?: string): Promise<Array<DomElement>> {
        this.failIfNotLoaded("findByTextContaining");
        const xPathText = optionalText || text;
        const xPath = `//*[contains(text(),'${xPathText}')]`;
        if (optionalText) {
            const elem = await this.query(text);
            if (!elem) throw new QueryError("findByTextContaining", `Element ${text} not found.`);
            return this.subQueryXpath(elem, xPath);
        } else {
            return this.queryXPath(xPath);
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

    private subQueryXpath(parent: DomElement, selector: XPathSelector): Promise<Array<DomElement>> {
        if (selector[0] === "/") selector = `.${selector}`;
        return parent.queryXPath(selector);
    }

    private subQuery(parent: DomElement, selector: CssSelector): Promise<DomElement | null> {
        return parent.query(selector);
    }

    private subQueryAll(parent: DomElement, selector: CssSelector): Promise<Array<DomElement>> {
        return parent.queryAll(selector);
    }
}
