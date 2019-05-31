const queryProteinToSequence = primaryAccession => ({
	name: 'Protein_Sequence',
	title: 'Protein --> Sequence',
	description:
		'for a specified protein or list proteins give the protein sequence and length.',
	from: 'Protein',
	select: [
		'primaryIdentifier',
		'primaryAccession',
		'sequence.length',
		'sequence.residues'
	],
	orderBy: [
		{
			path: 'primaryIdentifier',
			direction: 'ASC'
		}
	],
	where: [
		{
			path: 'Protein.primaryAccession',
			op: '=',
			value: primaryAccession
		}
	]
});

// eslint-disable-next-line
function queryData(primaryAccession, serviceUrl, imjsClient = imjs) {
	return new Promise((resolve, reject) => {
		const service = new imjsClient.Service({ root: serviceUrl });
		service
			.records(queryProteinToSequence(primaryAccession))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No protein associated with passed `primaryAccession`!');
			})
			.catch(reject);
	});
}

module.exports = queryData;
