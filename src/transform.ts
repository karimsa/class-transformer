const BuiltinTransformers = new Map<any, (value: any) => any>()

BuiltinTransformers.set(Number, (value: string) => Number(value))
BuiltinTransformers.set(Boolean, (value: any) => Boolean(value))

export function transform(TypeClass: any, value: any) {
	const transformValue = BuiltinTransformers.get(TypeClass)
	if (transformValue) {
		return transformValue(value)
	}
	return new TypeClass(value)
}
