import { transform } from './transform'

type TypeRegistryEntry =
	| { type: 'single'; Class: Function }
	| {
			type: 'discriminated'
			property: string
			options: Map<string, Function>
	  }

const ClassRegistry = new WeakMap<object, Map<string, TypeRegistryEntry>>()

interface TypeOptions {
	discriminator: {
		property: string
		subTypes: { name: string; value: Function }[]
	}
}

export function Type<T>(
	createClass: ((t: never) => Function) | undefined,
	options?: TypeOptions
) {
	return function (target: any, key: string) {
		const TypesRegistry =
			ClassRegistry.get(target) ?? new Map<string, TypeRegistryEntry>()
		ClassRegistry.set(target, TypesRegistry)

		if (createClass) {
			TypesRegistry.set(key, {
				type: 'single',
				Class: createClass(undefined as never),
			})
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
): Function {
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

function performTransformation(TypeClass: Function, value: any): any {
	if (value == null) {
		return value
	}
	if (Array.isArray(value)) {
		return value.map((nested) => performTransformation(TypeClass, nested))
	}
	if (ClassRegistry.has(TypeClass.prototype)) {
		if (typeof value === 'object' && value) {
			return plainToClass(TypeClass as any, value)
		}
		return value
	}
	return transform(TypeClass, value)
}

export function plainToClass<T extends object>(
	Class: { new (...args: any[]): T; prototype: object },
	data: object
): T {
	const dataNormalized: Record<string, any> = Object.assign(
		new Class(),
		data
	) as any

	const TypesRegistry = ClassRegistry.get(Class.prototype)
	if (!TypesRegistry) {
		return dataNormalized as any
	}

	for (const [key, typeEntry] of TypesRegistry.entries()) {
		if (hasOwnProperty.call(data, key)) {
			const currentValue = (data as any)[key]
			const TypeClass = resolveTypeFromEntry(typeEntry, currentValue)

			dataNormalized[key] = performTransformation(TypeClass, currentValue)
		}
	}
	return dataNormalized as any
}
