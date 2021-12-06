// turns a valid JSON value into T
interface TypeClass<T> {
  new (value?: string | number | boolean | null): T;
}

const ClassRegistry = new WeakMap<object, Map<string, TypeClass<any>>>();

export function Type<T>(createClass: () => TypeClass<T>) {
  return function (target: any, key: string) {
    const TypesRegistry =
      ClassRegistry.get(target) ?? new Map<string, TypeClass<any>>();
    ClassRegistry.set(target, TypesRegistry);
    TypesRegistry.set(key, createClass());
  };
}

export function plainToClass(
  Class: { new (): any; prototype: object },
  data: object
) {
  const TypesRegistry = ClassRegistry.get(Class.prototype);
  if (!TypesRegistry) {
    console.warn(`Class was not found in the registry`);
    return data;
  }

  const dataNormalized = { ...data };
  for (const [key, TypeClass] of TypesRegistry.entries()) {
    if (ClassRegistry.has(TypeClass.prototype)) {
      dataNormalized[key] = plainToClass(TypeClass, data[key]);
    } else {
      dataNormalized[key] = new TypeClass(data[key]);
    }
  }
  return dataNormalized;
}

