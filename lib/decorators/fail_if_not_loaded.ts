import { FatalError } from '../errors';

export default function FailIfNotLoaded(_target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor): void {
    const originalMethod = propertyDescriptor.value;
    propertyDescriptor.value = function(...args: Array<any>): any {
        const originalThis = this as any;
        if (!originalThis.loaded) return Promise.reject(new FatalError(propertyKey, `Cannot perform action before opening a page.`));
        return originalMethod.bind(originalThis)(...args);
    };
}
