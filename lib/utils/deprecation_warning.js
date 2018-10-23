"use strict";


module.exports = function deprecationWarning(deprecatedMethod, alternative) {
    const alternativeMsg = alternative ? `, use ${alternative} instead` : " ";
    console.warn(`Deprecation Warning: ${deprecatedMethod} is deprecated${alternativeMsg}.`);//eslint-disable-line
};
