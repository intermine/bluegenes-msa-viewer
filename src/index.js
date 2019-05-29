var msa = require('msa');
var queryGeneToProtein = require('./queries/geneToProtein');
var queryProteinToSeq = require('./queries/proteinToSequence');

// make sure to export main, with the signature
function main(el, service, imEntity, state, config) {
	if (!state) state = {};
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

	queryGeneToProtein(imEntity.value, service.root).then(res => {
		var gene = res[0];
		var proteins = gene.proteins;
		var queries = [];
		proteins.forEach(protein => {
			var query = queryProteinToSeq(protein.primaryAccession, service.root);
			queries.push(query);
		});

		// var fasta = '';
		Promise.all(queries).then(results => {
			results.forEach(() => {
				// var sequence = result[0].sequence.residues;
				// console.log(sequence);
			});
		});
	});

	var fasta = '>seq1\n\
	ACTG\n\
	>seq2\n\
	ACGG\n';

	var seqs = msa.io.fasta.parse(fasta);

	var m = msa.default({
		el: el,
		seqs: seqs
	});
	m.render();
}

module.exports = { main };
