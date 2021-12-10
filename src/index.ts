import { transform } from './transform'

// turns a valid JSON value into T
interface TypeClass<T> {
	new (value?: string | number | boolean | null): T
}

type TypeRegistryEntry =
	| { type: 'single'; Class: TypeClass<any> }
	| {
			type: 'discriminated'
			property: string
			options: Map<string, TypeClass<any>>
	  }

const ClassRegistry = new WeakMap<object, Map<string, TypeRegistryEntry>>()

interface TypeOptions {
	discriminator: {
		property: string
		subTypes: { name: string; value: TypeClass<any> }[]
	}
}

export function Type<T>(
	createClass: (() => TypeClass<T>) | undefined,
	options?: TypeOptions
) {
	return function (target: any, key: string) {
		const TypesRegistry =
			ClassRegistry.get(target) ?? new Map<string, TypeRegistryEntry>()
		ClassRegistry.set(target, TypesRegistry)

		if (createClass) {
			TypesRegistry.set(key, { type: 'single', Class: createClass() })
		} else {
			const classOptions = new Map()
			for (const { name, value } of options!.discriminator.subTypes) {
				classOptions.set(name, value)
			}

			TypesRegistry.set(key, {
				type: 'discriminated',
				property: options!.discriminator.property,
				options: classOptions,
			})
		}
	}
}

const hasOwnProperty = Object.prototype.hasOwnProperty

function resolveTypeFromEntry(
	typeEntry: TypeRegistryEntry,
	object: any
): TypeClass<any> {
	if (typeEntry.type === 'single') {
		return typeEntry.Class
	}

	if (typeof object === 'object' && object) {
		const discriminantValue = object[typeEntry.property]
		const typeClass = typeEntry.options.get(discriminantValue)
		if (typeClass) {
			return typeClass
		}
	}

	// this seems to be the default for 'class-transformer'
	return Object
}

export function plainToClass<T extends object>(
	Class: { new (): T; prototype: object },
	data: object
): T {
	const TypesRegistry = ClassRegistry.get(Class.prototype)
	if (!TypesRegistry) {
		console.warn(`Class was not found in the registry`)
		return data as any
	}

	const dataNormalized: Record<string, any> = { ...data }
	for (const [key, typeEntry] of TypesRegistry.entries()) {
		if (hasOwnProperty.call(data, key)) {
			const currentValue = (data as any)[key]
			const TypeClass = resolveTypeFromEntry(typeEntry, currentValue)

			if (ClassRegistry.has(TypeClass.prototype)) {
				if (typeof currentValue === 'object') {
					dataNormalized[key] = plainToClass(TypeClass, currentValue)
				}
			} else {
				dataNormalized[key] = transform(TypeClass, currentValue)
			}
		}
	}
	return dataNormalized as any
}
