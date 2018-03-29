"use strict";

class MixinBuilder {
    constructor(superclass) {
        this.superclass = superclass;
    }

    with(...mixins) {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    }
}



module.exports = function mix(superclass) {
    return new MixinBuilder(superclass);
};
