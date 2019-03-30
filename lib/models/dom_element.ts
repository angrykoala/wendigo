import { JSHandle, ElementHandle } from 'puppeteer';
import { WendigoSelector } from '../types';

export default class DomElement {
    public readonly element: ElementHandle;
    public readonly name?: string;

    constructor(elementHandle: ElementHandle, name?: string) {
        this.element = elementHandle;
        this.name = name;
    }

    public async query(selector: string): Promise<DomElement | null> {
        const element = await this.element.$(selector);
        return DomElement.processQueryResult(element, selector);
    }

    public async queryXPath(selector: string): Promise<Array<DomElement>> {
        return this.element.$x(selector).then((elements) => {
            return elements.map((e) => {
                return new DomElement(e, selector);
            });
        });
    }

    public async queryAll(selector: string): Promise<Array<DomElement>> {
        return this.element.$$(selector).then((elements) => {
            return elements.map((e) => {
                return new DomElement(e, selector);
            });
        });
    }

    public click(): Promise<void> {
        return this.element.click();
    }

    public tap(): Promise<void> {
        return this.element.tap();
    }

    public toString(): string {
        if (this.name) return this.name;
        else return `DomElement`;
    }

    public static processQueryResult(element?: JSHandle | null, name?: string): DomElement | null {
        if (element) {
            const elementHandle = element.asElement();
            if (elementHandle) return new DomElement(elementHandle, name);
        }
        return null;
    }
}
