import 'reflect-metadata'
import { test, expect } from '@jest/globals'
import * as classTransformer from 'class-transformer'

import * as kClassTransformer from '../'

const Type = ((createClass: any, options: any) => {
	return (target: any, key: string) => {
		classTransformer.Type(createClass, options)(target, key)
		kClassTransformer.Type(createClass, options)(target, key)
	}
}) as typeof classTransformer.Type

function clone(value: any) {
	return JSON.parse(JSON.stringify(value))
}

function shouldTransformCorrectly(TestClass: any, data: object) {
	const actual = kClassTransformer.plainToClass(TestClass, data) as any
	const expected = classTransformer.plainToClass(TestClass, data) as any

	expect(clone(actual)).toEqual(clone(expected))
}

class NestedClass {
	@Type(() => Number)
	nested_num: number
}

class OptionOne {
	@Type(() => (() => '1') as any)
	option: '1'

	@Type(() => Boolean)
	option_one: boolean
}

class OptionTwo {
	@Type(() => (() => '2') as any)
	option: '2'

	@Type(() => Number)
	option_two: number
}

class OptionThree {
	@Type(() => (() => '3') as any)
	option: '3'

	@Type(() => String)
	option_three: string
}

class TestClass {
	@Type(() => Date)
	date: Date

	@Type(() => Number)
	num: number

	@Type(() => Boolean)
	bool: boolean

	@Type(() => NestedClass)
	nested: NestedClass

	@Type(() => NestedClass)
	nested_list: NestedClass[]

	@Type(undefined, {
		discriminator: {
			property: 'option',
			subTypes: [
				{ value: OptionOne, name: '1' },
				{ value: OptionOne, name: '2' },
				{ value: OptionOne, name: '3' },
			],
		},
		keepDiscriminatorProperty: true,
	})
	varying_object: OptionOne | OptionTwo | OptionThree
}

test('should parse valid values correctly', () => {
	shouldTransformCorrectly(TestClass, {
		date: new Date().toISOString(),
		num: Math.PI,
		bool: true,
		nested: {
			nested_num: 5.134,
		},
		nested_list: [
			{
				nested_num: 1341.3435,
			},
			{
				nested_num: 138484.2,
			},
		],
	})
	shouldTransformCorrectly(TestClass, {
		date: new Date().toISOString(),
		num: Math.PI,
		bool: true,
		nested: {
			nested_num: '5.134',
		},
		nested_list: [
			{
				nested_num: '93838134.4',
			},
		],
	})
})

test('should parse invalid values', () => {
	shouldTransformCorrectly(TestClass, {
		date: 'not a date',
		num: 'not a number',
		bool: 'not a bool',
		nested: 'not nested object',
		nested_list: 'fudge',
	})
	shouldTransformCorrectly(TestClass, {
		nested: {
			nested_num: 'not a num',
		},
		nested_list: ['nested value'],
	})
	shouldTransformCorrectly(TestClass, {
		nested_list: [
			'invalid',
			{
				nested_num: 1434.134,
			},
			{
				nested_num: 'invalid nested',
			},
		],
	})
})

test('should parse partial objects', () => {
	shouldTransformCorrectly(TestClass, {
		date: new Date().toISOString(),
	})
	shouldTransformCorrectly(TestClass, {
		nested: {},
	})
})

test('should parse discriminating types', () => {
	shouldTransformCorrectly(TestClass, {
		varying_object: {
			option: '1',
			option_one: 1,
			option_two: true,
			option_three: 'three',
		},
	})
	shouldTransformCorrectly(TestClass, {
		varying_object: {
			option: '2',
			option_one: 1,
			option_two: true,
			option_three: 'three',
		},
	})
	shouldTransformCorrectly(TestClass, {
		varying_object: {
			option: '3',
			option_one: 1,
			option_two: true,
			option_three: 'three',
		},
	})
	shouldTransformCorrectly(TestClass, {
		varying_object: {
			option: 'invalid',
			option_one: 1,
			option_two: true,
			option_three: 'three',
		},
	})
})

test('undecorated classes', () => {
	class UntypedClass {
		foo: number
	}
	shouldTransformCorrectly(UntypedClass, {
		foo: 1,
	})
})
