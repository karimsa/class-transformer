const BuiltinTransformers = new Map<any, (value: any) => any>()

BuiltinTransformers.set(Number, (value: string) => Number(value))
BuiltinTransformers.set(Boolean, (value: any) => {
	if (typeof value === 'string') {
		return value === 'true'
	}
	if (typeof value === 'boolean') {
		return value
	}
	return false
})

export function transform(TypeClass: any, value: any) {
	const transformValue = BuiltinTransformers.get(TypeClass)
	if (transformValue) {
		return transformValue(value)
	}
	return new TypeClass(value)
}
