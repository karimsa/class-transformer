import { test, expect } from '@jest/globals'

import { Type, plainToClass } from '../'

const expectType = <T>(value: T) => value

test('should parse dates correctly', () => {
	class TestClass {
		@Type(() => Date)
		date: Date
	}

	expect(
		expectType<TestClass>(
			plainToClass(TestClass, {
				date: new Date().toISOString(),
			})
		)
	).toMatchSnapshot({
		date: expect.any(Date),
	})
})
