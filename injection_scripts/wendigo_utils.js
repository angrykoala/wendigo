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
        var xPathResult = document.evaluate(xPath, document, null, XPathResult.ANY_TYPE, null);// eslint-disable-line
        var result = [];// eslint-disable-line
        var r=xPathResult.iterateNext(); // eslint-disable-line
        while(r !== null) {
            result.push(r);
            r = xPathResult.iterateNext();
        }
        return result;
    },
    getParentNodes: function(nodeList) {
        var res = [];// eslint-disable-line
        for(var i=0;i<nodeList.length;i++){// eslint-disable-line
            res.push(nodeList[i].parentNode);
        }
        return res;
    }
};
