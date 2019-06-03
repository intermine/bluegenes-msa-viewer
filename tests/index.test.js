const main = require('../src').main;

// Example
describe('main', () => {
	test('should throw error when called with wrong signature', () => {
		expect(() => {
			// testing with all falsy values
			main('', 0, null, undefined, []);
		}).toThrowError('Call main with correct signature');
	});

	test('should render something (atleast a div) into the `elem` passed', () => {
		// testing with all falsy values

		const el = document.createElement('div');

		main(
			el,
			{ root: 'http://www.humanmine.org/human' },
			{ value: 1000090 },
			{ testing: true },
			{} // so that it throws error
		);

		expect(el.innerHTML).toContain('div');
	});
});
