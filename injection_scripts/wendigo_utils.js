"use strict";

window.WendigoUtils = {
    isVisible(element) {
        if(!element) return false;
        const style = window.getComputedStyle(element);
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        else return true;
    },
    queryElement(selector) {
        if(typeof selector === 'string') {
            return document.querySelector(selector);
        } else return selector;
    },
    queryAll(selector) {
        if(typeof selector === 'string') {
            return document.querySelectorAll(selector);
        } else{
            if(!Array.isArray(selector)) {
                selector = [selector];
            }
            return selector;
        }
    },
    xPathQuery: function(xPath) {
        let xPathResult = document.evaluate(xPath, document, null, XPathResult.ANY_TYPE, null);
        let result = [];
        let r = xPathResult.iterateNext();
        while(r !== null) {
            result.push(r);
            r = xPathResult.iterateNext();
        }
        return result;
    },
    getStyles(element, pseudoSelector) {
        const rawStyles = getComputedStyle(element, pseudoSelector);
        const result = {};
        for(let i = 0;i < rawStyles.length;i++) {
            const name = rawStyles[i];
            result[name] = rawStyles.getPropertyValue(name);
        }
        return result;
    }
};
