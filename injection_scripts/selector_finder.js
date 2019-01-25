"use strict";

if (!window.WendigoPathFinder) {
    window.WendigoPathFinder = {
        cssPath(node) {
            if (node.nodeType !== Node.ELEMENT_NODE)
                return '';

            const steps = [];
            let contextNode = node;
            while (contextNode) {
                const step = this._cssPathStep(contextNode, contextNode === node);
                if (!step)
                    break; // Error - bail out early.
                steps.push(step);
                if (step.optimized)
                    break;
                contextNode = contextNode.parentNode;
            }

            steps.reverse();
            return steps.join(' > ');
        },
        xPath(node, optimized = true) {
            if (node.nodeType === Node.DOCUMENT_NODE)
                return '/';

            const steps = [];
            let contextNode = node;
            while (contextNode) {
                const step = this._xPathValue(contextNode, optimized);
                if (!step)
                    break; // Error - bail out early.
                steps.push(step);
                if (step.optimized)
                    break;
                contextNode = contextNode.parentNode;
            }

            steps.reverse();
            return (steps.length && steps[0].optimized ? '' : '/') + steps.join('/');
        },
        _cssPathStep(node, isTargetNode) {
            if (node.nodeType !== Node.ELEMENT_NODE)
                return null;

            const id = node.getAttribute('id');
            if (id)
                return new this.Step(idSelector(id), true);
            const nodeNameLower = node.nodeName.toLowerCase();
            if (nodeNameLower === 'body' || nodeNameLower === 'head' || nodeNameLower === 'html')
                return new this.Step(node.localName, true);
            const nodeName = node.localName;

            const parent = node.parentNode;
            if (!parent || parent.nodeType === Node.DOCUMENT_NODE)
                return new this.Step(nodeName, true);

            function prefixedElementClassNames(node) {
                const classAttribute = node.getAttribute('class');
                if (!classAttribute)
                    return [];

                return classAttribute.split(/\s+/g).filter(Boolean).map((name) => {
                    // The prefix is required to store "__proto__" in a object-based map.
                    return `$${ name}`;
                });
            }

            function idSelector(id) {
                return `#${ escapeIdentifierIfNeeded(id)}`;
            }

            function escapeIdentifierIfNeeded(ident) {
                if (isCSSIdentifier(ident))
                    return ident;
                const shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
                const lastIndex = ident.length - 1;
                return ident.replace(/./g, (c, i) => {
                    return ((shouldEscapeFirst && i === 0) || !isCSSIdentChar(c)) ? escapeAsciiChar(c, i === lastIndex) : c;
                });
            }

            function escapeAsciiChar(c, isLast) {
                return `\\${ toHexByte(c) }${isLast ? '' : ' '}`;
            }

            function toHexByte(c) {
                let hexByte = c.charCodeAt(0).toString(16);
                if (hexByte.length === 1)
                    hexByte = `0${ hexByte}`;
                return hexByte;
            }

            function isCSSIdentChar(c) {
                if (/[a-zA-Z0-9_-]/.test(c))
                    return true;
                return c.charCodeAt(0) >= 0xA0;
            }

            function isCSSIdentifier(value) {
                // Double hyphen prefixes are not allowed by specification, but many sites use it.
                return /^-{0,2}[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
            }

            const prefixedOwnClassNamesArray = prefixedElementClassNames(node);
            let needsClassNames = false;
            let needsNthChild = false;
            let ownIndex = -1;
            let elementIndex = -1;
            const siblings = parent.children;
            for (let i = 0;
                (ownIndex === -1 || !needsNthChild) && i < siblings.length; ++i) {
                const sibling = siblings[i];
                if (sibling.nodeType !== Node.ELEMENT_NODE)
                    continue;
                elementIndex += 1;
                if (sibling === node) {
                    ownIndex = elementIndex;
                    continue;
                }
                if (needsNthChild)
                    continue;
                if (sibling.localName !== nodeName)
                    continue;

                needsClassNames = true;
                const ownClassNames = new Set(prefixedOwnClassNamesArray);
                if (!ownClassNames.size) {
                    needsNthChild = true;
                    continue;
                }
                const siblingClassNamesArray = prefixedElementClassNames(sibling);
                for (let j = 0; j < siblingClassNamesArray.length; ++j) {
                    const siblingClass = siblingClassNamesArray[j];
                    if (!ownClassNames.has(siblingClass))
                        continue;
                    ownClassNames.delete(siblingClass);
                    if (!ownClassNames.size) {
                        needsNthChild = true;
                        break;
                    }
                }
            }

            let result = nodeName;
            if (isTargetNode && nodeName.toLowerCase() === 'input' && node.getAttribute('type') && !node.getAttribute('id') &&
        !node.getAttribute('class'))
                result += `[type="${ node.getAttribute('type') }"]`;
            if (needsNthChild) {
                result += `:nth-child(${ ownIndex + 1 })`;
            } else if (needsClassNames) {
                for (const prefixedName of prefixedOwnClassNamesArray)
                    result += `.${ escapeIdentifierIfNeeded(prefixedName.substr(1))}`;
            }

            return new this.Step(result, false);
        },
        _xPathValue(node, optimized) {
            let ownValue;
            const ownIndex = this._xPathIndex(node);
            if (ownIndex === -1)
                return null; // Error.

            switch (node.nodeType) {
                case Node.ELEMENT_NODE:
                    if (optimized && node.getAttribute('id'))
                        return new this.Step(`//*[@id="${ node.getAttribute('id') }"]`, true);
                    ownValue = node.localName;
                    break;
                case Node.ATTRIBUTE_NODE:
                    ownValue = `@${ node.nodeName}`;
                    break;
                case Node.TEXT_NODE:
                case Node.CDATA_SECTION_NODE:
                    ownValue = 'text()';
                    break;
                case Node.PROCESSING_INSTRUCTION_NODE:
                    ownValue = 'processing-instruction()';
                    break;
                case Node.COMMENT_NODE:
                    ownValue = 'comment()';
                    break;
                case Node.DOCUMENT_NODE:
                    ownValue = '';
                    break;
                default:
                    ownValue = '';
                    break;
            }

            if (ownIndex > 0)
                ownValue += `[${ ownIndex }]`;

            return new this.Step(ownValue, node.nodeType === Node.DOCUMENT_NODE);
        },
        _xPathIndex(node) {
            // Returns -1 in case of error, 0 if no siblings matching the same expression, <XPath index among the same expression-matching sibling nodes> otherwise.
            function areNodesSimilar(left, right) {
                if (left === right)
                    return true;

                if (left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE)
                    return left.localName === right.localName;

                if (left.nodeType === right.nodeType)
                    return true;

                // XPath treats CDATA as text nodes.
                const leftType = left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType;
                const rightType = right.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType;
                return leftType === rightType;
            }

            const siblings = node.parentNode ? node.parentNode.children : null;
            if (!siblings)
                return 0; // Root node - no siblings.
            let hasSameNamedElements;
            for (let i = 0; i < siblings.length; ++i) {
                if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
                    hasSameNamedElements = true;
                    break;
                }
            }
            if (!hasSameNamedElements)
                return 0;
            let ownIndex = 1; // XPath indices start with 1.
            for (let i = 0; i < siblings.length; ++i) {
                if (areNodesSimilar(node, siblings[i])) {
                    if (siblings[i] === node)
                        return ownIndex;
                    ++ownIndex;
                }
            }
            return -1; // An error occurred: |node| not found in parent's children.
        },

        Step: class {
            constructor(value, optimized) {
                this.value = value;
                this.optimized = optimized || false;
            }

            toString() {
                return this.value;
            }
        }
    };
}
