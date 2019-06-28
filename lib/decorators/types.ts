export type DecoratorFunction = (
  target: any,
  propertyKey: string,
  propertyDescriptor: PropertyDescriptor
) => void;
