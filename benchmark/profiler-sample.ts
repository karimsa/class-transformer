import Benchmark from 'benchmark'

import { Type, plainToClass } from '../'
import * as classTransformer from 'class-transformer'

class BenchClass {
	@Type(() => BenchClass)
	nested: BenchClass

	@Type(() => Boolean)
	bool: boolean

	@Type(() => Date)
	date: Date

	@Type(() => Date)
	other_date: Date
}

const benchData: BenchClass = {
	nested: {
		bool: null,
		nested: {
			bool: 'true',
			nested: {
				bool: false,
				date: new Date().toISOString(),
			},
		},
		other_date: new Date().toISOString(),
	},
	date: new Date().toISOString(),
} as any

for (let i = 0; i < 1e3; i++) {
	plainToClass(BenchClass, benchData)
}

