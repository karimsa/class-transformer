import 'reflect-metadata'
import { test, expect } from '@jest/globals'
import isEqual from 'lodash/isEqual'
import * as classTransformer from 'class-transformer'

import { Type, plainToClass } from '../'

function clone(value: any) {
	return JSON.parse(JSON.stringify(value))
}

function shouldTransformCorrectly(TestClass: any, data: object) {
	const actual = plainToClass(TestClass, data) as any
	const expected = classTransformer.plainToClass(TestClass, data) as any

	expect(clone(actual)).toEqual(clone(expected))
}

class NestedClass {
	@classTransformer.Type(() => Number)
	@Type(() => Number)
	nested_num: number
}

class TestClass {
	@classTransformer.Type(() => Date)
	@Type(() => Date)
	date: Date

	@classTransformer.Type(() => Number)
	@Type(() => Number)
	num: number

	@classTransformer.Type(() => Boolean)
	@Type(() => Boolean)
	bool: boolean

	@classTransformer.Type(() => NestedClass)
	@Type(() => NestedClass)
	nested: NestedClass
}

test('should parse dates correctly', () => {
	shouldTransformCorrectly(TestClass, {
		date: new Date().toISOString(),
		num: Math.PI,
		bool: true,
		nested: {
			nested_num: 5.134,
		},
	})
	shouldTransformCorrectly(TestClass, {
		date: new Date().toISOString(),
		num: Math.PI,
		bool: true,
		nested: {
			nested_num: '5.134',
		},
	})
})

test('should parse invalid values', () => {
	shouldTransformCorrectly(TestClass, {
		date: 'not a date',
		num: 'not a number',
		bool: 'not a bool',
		nested: 'not nested object',
	})
	shouldTransformCorrectly(TestClass, {
		nested: {
			nested_num: 'not a num',
		},
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
