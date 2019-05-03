import { JSHandle, ElementHandle } from 'puppeteer';
import { isXPathQuery } from '../utils/utils';

export default class DomElement {
    public readonly element: ElementHandle;
    public readonly name?: string;

    constructor(elementHandle: ElementHandle, name?: string) {
        this.element = elementHandle;
        this.name = name;
    }

    public async query(selector: string): Promise<DomElement | null> {
        let elementHandle: ElementHandle | null;
        if (isXPathQuery(selector)) {
            selector = this.processXPath(selector);
            const results = await this.element.$x(selector);
            elementHandle = results[0] || null;
        } else elementHandle = await this.element.$(selector);
        return DomElement.processQueryResult(elementHandle, selector);
    }

    public async queryAll(selector: string): Promise<Array<DomElement>> {
        let elements: Array<ElementHandle>;
        if (isXPathQuery(selector)) {
            selector = this.processXPath(selector);
            elements = await this.element.$x(selector);
        } else elements = await this.element.$$(selector);

        return elements.map((e) => {
            return DomElement.processQueryResult(e, selector);
        }).filter(b => Boolean(b)) as Array<DomElement>;
    }

    public click(): Promise<void> {
        return this.element.click();
    }

    public tap(): Promise<void> {
        return this.element.tap();
    }

    public focus(): Promise<void> {
        return this.element.focus();
    }

    public hover(): Promise<void> {
        return this.element.hover();
    }

    public type(text: string, options?: { delay: number }): Promise<void> {
        return this.element.type(text, options);
    }

    public toString(): string {
        if (this.name) return this.name;
        else return `DomElement`;
    }

    public static processQueryResult(element?: JSHandle | null, name?: string): DomElement | null {
        if (!element) return null;
        const elementHandle = element.asElement();
        if (elementHandle) return new DomElement(elementHandle, name);
        else return null;
    }

    private processXPath(selector: string): string {
        if (selector[0] === '/') selector = `.${selector}`;
        return selector;
    }
}
