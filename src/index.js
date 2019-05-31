var msa = require('msa');
var queryGeneToProtein = require('./queries/geneToProtein');
var queryProteinToSeq = require('./queries/proteinToSequence');

// make sure to export main, with the signature
function main(el, service, imEntity, state, config) {
	if (!state) state = {};
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

	el.innerHTML = `
		<h3 class="center">MSA Viewer - Loading...</h3>
	`;

	el.innerHTML += `
		<div class="loading center"><div></div></div>
	`;

	// fetch all proteins associated with the particular gene
	queryGeneToProtein(imEntity.value, service.root)
		.then(gene => {
			var proteins = gene.proteins;
			var queries = [];

			proteins.forEach(protein => {
				// protein to sequence query
				var query = queryProteinToSeq(protein.primaryAccession, service.root);
				queries.push(query);
			});

			var fasta = '';
			Promise.all(queries).then(results => {
				// concat all sequences together
				results.forEach((result, i) => {
					var sequence =
						result.sequence.residues + (i == results.length - 1 ? '' : '\n');
					fasta += '>' + proteins[i].primaryAccession + '\n' + sequence;
				});

				// parse sequences via msa lib
				var seqs = msa.io.fasta.parse(fasta);

				// initialise viewer
				var viewer = msa.default({
					el: el,
					seqs: seqs
				});

				viewer.render();

				// remove header
				document.getElementsByClassName('biojs_msa_header')[0].style.display =
					'none';
			});
		})
		.catch(() => {
			el.innerHTML = `
				<div class="center">
					No Proteins associated with the gene
				</div>
			`;
		});
}

module.exports = { main };
