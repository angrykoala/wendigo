"use strict";

// Based on https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/elements/DOMPath.js

// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found at https://github.com/ChromeDevTools/devtools-frontend/blob/master/LICENSE

// Minor refactor and modifications made by @angrykoala for wendigo

/* eslint-disable no-continue, complexity */

if (!window.WendigoPathFinder) {
    class Step {
        constructor(value, optimized) {
            this.value = value;
            this.optimized = optimized || false;
        }

        toString() {
            return this.value;
        }
    }


    const _cssPathFinderHelpers = {
        _stepPreprocess(node) {
            if (node.nodeType !== Node.ELEMENT_NODE)
                return null;

            const id = node.getAttribute('id');
            if (id)
                return new Step(this.idSelector(id), true);
            const nodeNameLower = node.nodeName.toLowerCase();
            if (nodeNameLower === 'body' || nodeNameLower === 'head' || nodeNameLower === 'html')
                return new Step(node.localName, true);
            const nodeName = node.localName;

            const parent = node.parentNode;
            if (!parent || parent.nodeType === Node.DOCUMENT_NODE)
                return new Step(nodeName, true);
        },

        _cssPathStep(node, isTargetNode) {
            const value = this._stepPreprocess(node);
            if (value !== undefined) return value;


            const parent = node.parentNode;
            const nodeName = node.localName;

            const prefixedOwnClassNamesArray = this.prefixedElementClassNames(node);
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
                const siblingClassNamesArray = this.prefixedElementClassNames(sibling);
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
                    result += `.${ this.escapeIdentifierIfNeeded(prefixedName.substr(1))}`;
            }

            return new Step(result, false);
        },
        prefixedElementClassNames(node) {
            const classAttribute = node.getAttribute('class');
            if (!classAttribute)
                return [];

            return classAttribute.split(/\s+/g).filter(Boolean).map((name) => {
            // The prefix is required to store "__proto__" in a object-based map.
                return `$${ name}`;
            });
        },
        idSelector(id) {
            return `#${ this.escapeIdentifierIfNeeded(id)}`;
        },
        escapeIdentifierIfNeeded(ident) {
            if (this.isCSSIdentifier(ident))
                return ident;
            const shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
            const lastIndex = ident.length - 1;
            return ident.replace(/./g, (c, i) => {
                return ((shouldEscapeFirst && i === 0) || !this.isCSSIdentChar(c)) ? this.escapeAsciiChar(c, i === lastIndex) : c;
            });
        },
        escapeAsciiChar(c, isLast) {
            return `\\${ this.toHexByte(c) }${isLast ? '' : ' '}`;
        },
        toHexByte(c) {
            let hexByte = c.charCodeAt(0).toString(16);
            if (hexByte.length === 1)
                hexByte = `0${ hexByte}`;
            return hexByte;
        },
        isCSSIdentChar(c) {
            if (/[a-zA-Z0-9_-]/.test(c))
                return true;
            return c.charCodeAt(0) >= 0xA0;
        },
        isCSSIdentifier(value) {
        // Double hyphen prefixes are not allowed by specification, but many sites use it.
            return /^-{0,2}[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
        }
    };
    const _xPathFinderHelpers = {
        _xPathStep(node) {
            let ownValue;
            const ownIndex = this._xPathIndex(node);
            if (ownIndex === -1)
                return null; // Error.

            switch (node.nodeType) {
                case Node.ELEMENT_NODE:
                    if (node.getAttribute('id'))
                        return new Step(`//*[@id="${ node.getAttribute('id') }"]`, true);
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

            return new Step(ownValue, node.nodeType === Node.DOCUMENT_NODE);
        },
        _xPathIndex(node) {
            const siblings = node.parentNode ? node.parentNode.children : null;
            if (!siblings)
                return 0; // Root node - no siblings.
            let hasSameNamedElements = false;
            for (let i = 0; i < siblings.length; ++i) {
                if (this.areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
                    hasSameNamedElements = true;
                    break;
                }
            }
            if (!hasSameNamedElements)
                return 0;
            let ownIndex = 1; // XPath indices start with 1.
            for (let i = 0; i < siblings.length; ++i) {
                if (this.areNodesSimilar(node, siblings[i])) {
                    if (siblings[i] === node)
                        return ownIndex;
                    ownIndex++;
                }
            }
            return -1; // An error occurred: |node| not found in parent's children.
        },
        areNodesSimilar(left, right) {
            // Returns -1 in case of error, 0 if no siblings matching the same expression, <XPath index among the same expression-matching sibling nodes> otherwise.
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
    };


    window.WendigoPathFinder = {
        cssPath(node) {
            if (node.nodeType !== Node.ELEMENT_NODE)
                return '';
            const stepsFunction = _cssPathFinderHelpers._cssPathStep.bind(_cssPathFinderHelpers);
            const steps = this._generatePathSteps(node, stepsFunction);
            return steps.join(' > ');
        },
        xPath(node) {
            if (node.nodeType === Node.DOCUMENT_NODE)
                return '/';

            const stepsFunction = _xPathFinderHelpers._xPathStep.bind(_xPathFinderHelpers);
            const steps = this._generatePathSteps(node, stepsFunction);
            return (steps.length && steps[0].optimized ? '' : '/') + steps.join('/');
        },
        _generatePathSteps(node, stepFunction) {
            const steps = [];
            let contextNode = node;
            while (contextNode) {
                const step = stepFunction(contextNode, contextNode === node);
                if (!step)
                    break; // Error - bail out early.
                steps.push(step);
                if (step.optimized)
                    break;
                contextNode = contextNode.parentNode;
            }

            steps.reverse();
            return steps;
        }
    };
}

/* eslint-enable no-continue, complexity */
