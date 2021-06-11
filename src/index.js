var msa = require('@intermine/msa-viewer');
var queryGeneToProtein = require('./queries/geneToProtein');
var queryProteinToSeq = require('./queries/proteinToSequence');
var sequenceAlignServiceUrl = require('./sequence-align-service');

function renderError(el, message) {
	el.innerHTML = `
	<div class="center">
		${message}
	</div>
`;
}

function getAlignedSequence(length, fasta) {
	const fetchResult = fetch(sequenceAlignServiceUrl + '/align-sequence', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ sequence: fasta })
	}).then(res => res.json());
	return length > 1 ? fetchResult : Promise.resolve({ data: fasta });
}

// make sure to export main, with the signature
function main(el, service, imEntity, state, config) {
	if (!state) state = {};
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

	el.innerHTML = `
	<h3 class="center">Multiple Sequence Alignment Viewer - Loading...</h3>
	`;

	el.innerHTML += `
	<div class="loading center"><div></div></div>
	`;

	// don't do queries when in `testing` state
	if (state.testing) return;

	// fetch all proteins associated with the particular gene
	queryGeneToProtein(imEntity.Gene.value, service.root)
		.then(gene => {
			var proteins = gene.proteins;
			var queries = [];

			// TODO: I don't think it's necessary to query first for proteins, and
			// then their sequences. We could just ask for their sequences right
			// away. This could be an idea for a future refactor.
			proteins.forEach(protein => {
				// protein to sequence query
				var query = queryProteinToSeq(protein.primaryAccession, service.root);
				queries.push(query);
			});

			var fasta = '';
			Promise.all(queries)
				.then(results => {
					// concat all sequences together
					results.forEach((result, i) => {
						var sequence =
							result.sequence.residues + (i == results.length - 1 ? '' : '\n');
						fasta += '>' + proteins[i].primaryAccession + '\n' + sequence;
					});

					getAlignedSequence(results.length, fasta)
						.then(res => {
							if (res.error) {
								throw res.error;
							}

							// parse sequences via msa lib
							var seqs = msa.io.fasta.parse(res.data);

							// initialise viewer
							var viewer = msa.default({
								el: el,
								seqs: seqs
							});

							viewer.render();

							// text to notify for horizontal scroll since the msa-viewer lib doesn't support showing the scrollbar and user must be aware
							setTimeout(() => {
								const text = document.createElement('span');
								text.innerText =
									'Remember: You can scroll through the viewer horizontally to view the full sequence.';
								text.style.fontSize = '12px';
								el.prepend(text);
							}, 1500);

							// remove header
							document.getElementsByClassName(
								'biojs_msa_header'
							)[0].style.display = 'none';
						})
						.catch(error => {
							if (error instanceof Error) {
								// Error is from fetch, which usually means it failed to reach the server.
								console.error(error); // eslint-disable-line
								renderError(el, 'Failed to reach sequence alignment server');
							} else {
								// Error is a JS object from sequence alignment server.
								console.error('Error when aligning sequences', error); // eslint-disable-line
								renderError(el, 'Error occurred when aligning sequences');
							}
						});
				})
				.catch(error => {
					if (typeof error === 'string') {
						renderError(el, error);
					} else {
						renderError(el, 'Failed to query for protein sequences');
					}
				});
		})
		.catch(error => {
			if (typeof error === 'string') {
				renderError(el, error);
			} else {
				console.error(error); // eslint-disable-line
				renderError(el, 'Failed to query for proteins');
			}
		});
}

module.exports = { main };
