var msa = require('msa');

// make sure to export main, with the signature
function main(el, service, imEntity, state, config) {
	if (!state) state = {};
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

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
