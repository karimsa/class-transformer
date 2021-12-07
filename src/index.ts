// turns a valid JSON value into T
interface TypeClass<T> {
	new (value?: string | number | boolean | null): T
}

const ClassRegistry = new WeakMap<object, Map<string, TypeClass<any>>>()

export function Type<T>(createClass: () => TypeClass<T>) {
	return function (target: any, key: string) {
		const TypesRegistry =
			ClassRegistry.get(target) ?? new Map<string, TypeClass<any>>()
		ClassRegistry.set(target, TypesRegistry)
		TypesRegistry.set(key, createClass())
	}
}

export function plainToClass<T>(
	Class: { new (): T; prototype: object },
	data: object
): T {
	const TypesRegistry = ClassRegistry.get(Class.prototype)
	if (!TypesRegistry) {
		console.warn(`Class was not found in the registry`)
		return data as any
	}

	const dataNormalized: Record<string, any> = { ...data }
	for (const [key, TypeClass] of TypesRegistry.entries()) {
		const currentValue = (data as any)[key]

		if (ClassRegistry.has(TypeClass.prototype)) {
			dataNormalized[key] = plainToClass(TypeClass, currentValue)
		} else {
			dataNormalized[key] = new TypeClass(currentValue)
		}
	}
	return dataNormalized as any
}
