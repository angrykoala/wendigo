"use strict";

module.exports = class DomElement {
    constructor(elementHandle, name) {
        this.element = elementHandle;
        this.name = name;
    }

    query(selector) {
        return this.element.$(selector).then((element) => {
            return DomElement._processQueryResult(element, selector);
        });
    }

    queryXPath(selector) {
        return this.element.$x(selector).then((elements) => {
            return elements.map((e) => {
                return DomElement._processQueryResult(e, selector);
            });
        });
    }

    queryAll(selector) {
        return this.element.$$(selector).then((elements) => {
            return elements.map((e) => {
                return DomElement._processQueryResult(e, selector);
            });
        });
    }

    click() {
        return this.element.click();
    }

    tap() {
        return this.element.tap();
    }

    toString() {
        if (this.name) return this.name;
        else return `DomElement`;
    }

    static _processQueryResult(element, name) {
        if (element) {
            return new DomElement(element, name);
        } else return null;
    }
};
