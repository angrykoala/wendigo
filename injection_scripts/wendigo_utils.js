"use strict";

window.WendigoUtils = {
    _serializer: new XMLSerializer(),
    serializeDom(domElement) {
        if(!domElement) return null;
        return this._serializer.serializeToString(domElement);
    },
    serializeNodeList(elements) {
        let result = [];
        for (let i = 0; i < elements.length; i++) {
            result.push(this.serializeDom(elements[i]));
        }
        return result;
    },
    isVisible(element) {
        if(!element) return false;
        let style = window.getComputedStyle(element, "");
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        else return true;
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
    getParentNodes: function(nodeList) {
        let res = [];
        for(let i = 0;i < nodeList.length;i++) {
            res.push(nodeList[i].parentNode);
        }
        return res;
    }
};
