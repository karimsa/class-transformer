import Benchmark from 'benchmark'

import { Type, plainToClass } from './'
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
}

new Benchmark.Suite()
	.add('class-transformer', () =>
		classTransformer.plainToClass(BenchClass, benchData)
	)
	.add('@karimsa/class-transformer', () => plainToClass(BenchClass, benchData))
	.on('cycle', (event) => console.log(String(event.target)))
	.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').map('name'))
	})
	.run({ async: true })
