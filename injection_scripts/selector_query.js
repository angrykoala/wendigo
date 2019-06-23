"use strict";

if (!window.WendigoQuery) {
    window.WendigoQuery = {
        selectorTypes: {// Warning: Same as selector type
            css: "css",
            xpath: "xpath",
            domElement: "domElement"
        },
        query(selector) {
            const type = this._parseSelectorType(selector);
            switch (type) {
                case this.selectorTypes.css:
                    return this.queryCss(selector);
                case this.selectorTypes.xpath:
                    return this.queryXPath(selector);
                case this.selectorTypes.domElement:
                    return this.queryDomElement(selector);
                default:
                    throw new Error(`Query Error: ${selector} with type ${type}`);
            }
        },
        queryAll(selector) {
            const type = this._parseSelectorType(selector);

            switch (type) {
                case this.selectorTypes.css:
                    return this.queryCssAll(selector);
                case this.selectorTypes.xpath:
                    return this.queryXPathAll(selector);
                case this.selectorTypes.domElement:
                    return this.queryDomElementAll(selector);
                default:
                    throw new Error(`QueryAll Error: ${selector} with type ${type}`);
            }
        },
        queryCss(cssSelector) {
            return document.querySelector(cssSelector);
        },
        queryCssAll(cssSelector) {
            return Array.from(document.querySelectorAll(cssSelector));
        },
        queryDomElement(element) {
            if (Array.isArray(element)) return element[0];
            else return element;
        },
        queryDomElementAll(elements) {
            if (Array.isArray(elements)) return elements;
            else return [elements];
        },
        queryXPath(xPath) {
            const xPathResult = document.evaluate(xPath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
            const result = xPathResult.iterateNext();
            if (result.nodeType !== 1) return null;
            return result;
        },
        queryXPathAll(xPath) {
            const xPathResult = document.evaluate(xPath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
            const result = [];
            let r = xPathResult.iterateNext();
            while (r !== null) {
                if (r.nodeType === 1) // Not an element
                    result.push(r);
                r = xPathResult.iterateNext();
            }
            return result;
        },

        _parseSelectorType(selector) {
            if (typeof(selector) === "string") {
                if (selector.length === 0) return null;
                if (this._isXPathQuery(selector)) return this.selectorTypes.xpath;
                else return this.selectorTypes.css;
            } else if (typeof(selector) === "object") {
                return this.selectorTypes.domElement;
            } else return null;
        },

        // NOTE: Duplicate of utils.isXPathQuery
        _isXPathQuery(s) {
            if (s[0] === '/') return true;
            if (/^.\./.test(s)) return true;
            const axisSplit = s.split("::");
            if (axisSplit.length > 1) {
                const validAxis = ["ancestor", "ancestor-or-self", "attribute", "child", "descendant", "descendant-or-self",
                    "following", "following-sibling", "namespace", "parent", "preceding", "preceding-sibling", "self"
                ];
                const axe = axisSplit[0];
                if (validAxis.indexOf(axe) !== -1) return true;
            }
            return false;
        }
    };
}
