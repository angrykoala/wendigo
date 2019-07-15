type Class<T = unknown> = new (...arguments: any[]) => T;

type ComponentFunction = (...args: Array<any>) => any;

type Component = { [s: string]: any } | ComponentFunction;

declare module 'compositer' {
    function compose(baseClass: Class, components: Component, ...childParams: Array<any>): Class;
    export = compose;
}
