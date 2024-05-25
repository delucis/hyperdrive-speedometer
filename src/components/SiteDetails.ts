import Chartist from 'https://esm.sh/chartist@0.11.4';

function makeTable(table: Element) {
	const labels = [];
	const series = [];

	let rows = Array.from(table.querySelectorAll(':scope tbody tr'));
	let minY = 90;
	let maxY = 100;
	rows = rows.reverse();

	for (let row of rows) {
		const label = row.children[0].innerText.split(' ');
		labels.push(label.slice(0, 2).join(' '));
		const childCount = row.children.length - 1;
		let seriesIndex = 0;
		for (let j = 0, k = childCount; j < k; j++) {
			const data = row.children[j + 1].dataset;
			if (data && data.numericValue) {
				minY = Math.min(data.numericValue, minY);
				maxY = Math.max(data.numericValue, maxY);
				if (!series[seriesIndex]) {
					series[seriesIndex] = [];
				}
				series[seriesIndex].push(data.numericValue);
				seriesIndex++;
			}
		}
	}

	const options = {
		high: Math.max(maxY, 100),
		low: Math.max(0, minY - 5),
		fullWidth: true,
		onlyInteger: true,
		showPoint: false,
		lineSmooth: true,
		axisX: {
			showGrid: true,
			showLabel: true,
		},
		chartPadding: {
			right: 40,
		},
	};

	new Chartist.Line(
		table.parentNode.nextElementSibling,
		{
			labels: labels,
			series: series,
		},
		options
	);
}

function initializeAllTables(scope: Document | Element) {
	const tables = scope.querySelectorAll('[data-make-chart]');
	for (let table of tables) {
		// make sure not in a closed details
		if (table.closest('details[open]') || !table.closest('details')) {
			makeTable(table);
		}
	}
}

initializeAllTables(document);

const expandAliases = document.querySelectorAll('[data-expand-alias]');
for (const alias of expandAliases) {
	alias.addEventListener(
		'click',
		function (e) {
			e.preventDefault();
			const href = e.target.closest('a[href]').getAttribute('href');
			if (href) {
				const details = document.querySelector(href);
				if (details) details.open = !details.hasAttribute('open');
			}
		},
		false
	);
}
