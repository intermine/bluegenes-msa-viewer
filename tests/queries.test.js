const imjs = require('imjs');
const geneToProteinQuery = require('../src/queries/geneToProtein');
const proteinToSeqQuery = require('../src/queries/proteinToSequence');

describe('queries', () => {
	describe('gene -> protein', () => {
		const mockData = {
			geneId: '1007132',
			serviceUrl: 'https://www.humanmine.org/humanmine'
		};

		test('should return a promise resolving with gene having proteins', () => {
			expect.assertions(4);

			const queryRes = geneToProteinQuery(
				mockData.geneId,
				mockData.serviceUrl,
				imjs
			);

			expect(queryRes).toBeInstanceOf(Promise);
			return queryRes.then(res => {
				expect(res).toHaveProperty('proteins');
				expect(res.proteins).toBeInstanceOf(Array);
				expect(res.proteins.length).toBeGreaterThanOrEqual(1);
			});
		});

		test('should throw error if no protein associated with the given gene id', () => {
			const wrongMockData = Object.assign({}, mockData, {
				geneId: '1196911' // some wrong gene id
			});

			const queryRes = geneToProteinQuery(
				wrongMockData.geneId,
				wrongMockData.serviceUrl,
				imjs
			);

			return expect(queryRes).rejects.toBe('No associated proteins found');
		});
	});

	describe('protein -> sequence', () => {
		const mockData = {
			proteinAccessionId: 'Q8IZ69',
			serviceUrl: 'https://www.humanmine.org/humanmine'
		};
		test('should return a promise resolving with sequence when passed correct protein accession id', () => {
			const queryRes = proteinToSeqQuery(
				mockData.proteinAccessionId,
				mockData.serviceUrl,
				imjs
			);

			expect(queryRes).toBeInstanceOf(Promise);
			return queryRes.then(res => {
				expect(res).toHaveProperty('sequence');
				expect(res.sequence).toHaveProperty('residues');
				expect(res.sequence.residues).toBeTruthy();
			});
		});

		test('should throw error if no sequence associated with the given protein accession id', () => {
			const wrongMockData = Object.assign({}, mockData, {
				proteinAccessionId: '1100005' // some wrong protein accession id
			});

			const queryRes = proteinToSeqQuery(
				wrongMockData.proteinAccessionId,
				wrongMockData.serviceUrl,
				imjs
			);

			return expect(queryRes).rejects.toBe(
				'No protein found for UniProtKB accession 1100005'
			);
		});
	});
});
