//Syntaxes
const regexPatterns = {
	Aim: /spinecombatcharactergroup\(hd\)_assets_spine\/combat\/(\w+)\/(\w+)\/aim_hd_(\w+)\.bundle/g,
	Cover: /spinecombatcharactergroup\(hd\)_assets_spine\/combat\/(\w+)\/(\w+)\/cover_hd_(\w+)\.bundle/g,
	Standing: /spinestandingcharactergroup\(hd\)_assets_spine\/standing\/(\w+)\/(\w+)_hd_(\w+)\.bundle/g,
	'Portrait(Full)': /icons-char-full\(hd\)_assets_(\w+)_(\w+)_(\w+)\.bundle/g,
	'Portrait(Medium)': /icons-char-mi\(hd\)_assets_mi_(\w+)_(\w+)_s_(\w+)\.bundle/g,
	'Burst(Lobby)': /livewallpaperprefabs_assets_livewallpaper\/eventscene_(\w+)_cutscene_(\w+)\.bundle/g,
	'Burst(Battle)': /spotskillcutscene_assets_(\w+)_cut_scene_(\w+)\.bundle/g,
	'SD-Model' : /sdcharacters_assets_(\w+)_(\w+)_var_(\w+)\.bundle/g,
	Voice: /voice_required_pc_(\w+)_assets_all_(\w+)\.bundle/g,
	'Voice(MaxBond)': /voice_add_pc_(\w+)_assets_all_(\w+)\.bundle/g,
	'Voice(Title)': /voice_required_titlecall_assets_(\w+)_titlecall_1_(\w+)\.bundle/g,
	Background: /scenariobackground\(hd\)_assets_(\w+)_(\w+).bundle/g,
};

document.getElementById('uploadFile').addEventListener('click', function() {document.getElementById('fileInput').click();});
document.getElementById('uploadFolder').addEventListener('click', function() {document.getElementById('folderInput').click();});
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {checkbox.addEventListener('change', updateTableVisibility);});
document.addEventListener('DOMContentLoaded', fetchData);

//Fetch Nikke ID's
let nikkeNameID = {};
function fetchData() {
	fetch('https://api.dotgg.gg/nikke/characters/id')
		.then(response => response.json())
		.then(data => {
			displayData(data);
			const processedData = {};
            for (const [id, name] of Object.entries(data)) {
                const paddedId = id < 100 ? `0${id}` : id;
                processedData[paddedId] = name;
            }
            nikkeNameID = processedData;
		})
}

function displayData(data) {
	const tableBody = document.querySelector('#charactersTable tbody');
	tableBody.innerHTML = ''; 

	for (const id in data) {
		if (data.hasOwnProperty(id)) {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${id}</td>
				<td>${data[id]}</td>
				`;
			tableBody.appendChild(row);
		}
	}
}

//File Reader
function readFile(input) {
	const file = input.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			let fileContent = e.target.result;
			const matchedStrings = [];
			const matchIcon = fileContent.match(/icons-char-si\(hd\)_assets_all_(\w+)\.bundle/);
		
			if (matchIcon) {
				let word = matchIcon[1];
				document.getElementById("textArea2").value = word;
			}
		
			for (const key in regexPatterns) {
				const regex = regexPatterns[key];
				let match;
				while ((match = regex.exec(fileContent)) !== null) {
					matchedStrings.push(match[0]);
				}
			}

			fileContent = matchedStrings.join('\n');
			document.getElementById("textArea").value = fileContent;
			updateSelectorState();
		};
		reader.readAsText(file);
	}
}

//Folder Reader
function readFolder(input) {
	const files = input.files;
	if (files.length > 0) {
		let combinedText = "";
		for (const file of files) {
			if (file.name.toLowerCase().endsWith('.json')) {
				const reader = new FileReader();
				reader.onload = function (e) {
					const fileContent = e.target.result;
					const matchedStrings = [];
					const matchIcon = fileContent.match(/icons-char-si\(hd\)_assets_all_(\w+)\.bundle/);

					if (matchIcon) {
							let word = matchIcon[1];
							document.getElementById("textArea2").value = word;
						}

					for (const key in regexPatterns) {
							const regex = regexPatterns[key];
							let match;
							while ((match = regex.exec(fileContent)) !== null) {
								matchedStrings.push(match[0]);
							}
						}

						combinedText += matchedStrings.join('\n');
						document.getElementById("textArea").value = combinedText;
						updateSelectorState();
					};
				reader.readAsText(file);
			}
		}
	}
}

//Search Function
function applyFilter() {
    const idFilter = document.getElementById("idFilter").value.trim().toLowerCase();
    let idsToSearch = new Set();

    for (const [id, name] of Object.entries(nikkeNameID)) {
        if (id.includes(idFilter) || name.toLowerCase().includes(idFilter)) {
            idsToSearch.add(id);
        }
    }

    const resultTables = document.querySelectorAll(".table-container table");
    resultTables.forEach(table => {
        const tableBody = table.querySelector("tbody");
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const idColumn = row.querySelector("td:first-child");
            const idValue = idColumn.textContent.toLowerCase();
            if ([...idsToSearch].some(idToSearch => idValue.includes(idToSearch) || idValue.includes(idFilter))) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
    showFilteredResultsPopup([...idsToSearch]);
}

//Filtered Result Popup
function showFilteredResultsPopup(filteredIds) {
    const existingPopup = document.getElementById("filteredResultsPopup");
    if (existingPopup) {
        existingPopup.remove();
    }
    const popup = document.createElement("div");
    popup.id = "filteredResultsPopup";
    popup.classList.add("filtered-results-popup");
    const popupHeader = document.createElement("div");
    popupHeader.classList.add("filtered-results-header");
    const popupTitle = document.createElement("h3");
    popupTitle.classList.add("filtered-results-title");
    popupTitle.textContent = `"${document.getElementById("idFilter").value}"`;
    const closeButton = document.createElement("button");
    closeButton.classList.add("filtered-results-close-button");
    closeButton.textContent = "X";
    closeButton.onclick = closeFilteredResultsPopup;
    popupHeader.appendChild(popupTitle);
    popupHeader.appendChild(closeButton);
    popup.appendChild(popupHeader);

    const popupContent = document.createElement("div");
    popupContent.classList.add("filtered-results-content");

    const resultList = document.createElement("ul");
    resultList.classList.add("filtered-results-list");
    filteredIds.forEach(id => {
        const listItem = document.createElement("li");
        listItem.textContent = `${id}: ${nikkeNameID[id]}`;
        resultList.appendChild(listItem);
    });

    popupContent.appendChild(resultList);
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
}

function closeFilteredResultsPopup() {
    const popup = document.getElementById("filteredResultsPopup");
    if (popup) {
        popup.remove();
    }
}

function clearFilter() {
	const resultTables = document.querySelectorAll(".table-container table");
	resultTables.forEach(table => {
		const tableBody = table.querySelector("tbody");
		const rows = tableBody.querySelectorAll("tr");
		rows.forEach(row => {
			row.style.display = "";
		});
	});
	document.getElementById("idFilter").value = "";
	closeFilteredResultsPopup();
}

//Export Function
function exportTable() {
	const selector = document.getElementById("selector").value;
	const resultContainer = document.getElementById("resultContainer");
	const resultTables = resultContainer.querySelectorAll("table");
	const exportData = [["ID", "Ver", "Container"]];
	resultTables.forEach(table => {
		const rows = table.querySelectorAll("tbody tr");
		rows.forEach(row => {
			const columns = row.querySelectorAll("td");
			const rowData = Array.from(columns).map(column => column.textContent);
			exportData.push(rowData);
		});
	});
	const csvContent = exportData.map(row => row.join(",")).join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${selector}_Table.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function updateSelectorState() {
	const textArea = document.getElementById("textArea");
	const selector = document.getElementById("selector");
	const exportButton = document.getElementById("exportButton");
	const checkboxGroup = document.getElementById('checkboxGroup');
	selector.disabled = textArea.value.trim() === "";
	exportButton.disabled = selector.value === "None" || selector.value === "All";

	selector.addEventListener('change', function() {
		if (selector.value === 'All') {
			checkboxGroup.style.visibility = 'visible';
		} else {
			checkboxGroup.style.visibility = 'hidden';
		}
	});
	analyzeText();
	updateTableVisibility();
}

function updateTableVisibility() {
	const resultTables = document.querySelectorAll(".table-container table");
	const checkboxes = document.querySelectorAll('input[type="checkbox"]');
	const selector = document.getElementById("selector").value;
	resultTables.forEach((table, index) => {
		const checkbox = checkboxes[index];
		if (checkbox && !checkbox.checked && selector === "All") {
			table.style.display = "none";
		} else {
			table.style.display = "";
		}
	});
}

//MAIN
function analyzeText() {
	const text = document.getElementById("textArea").value;
	const selector = document.getElementById("selector").value;
	const resultContainer = document.getElementById("resultContainer");
	if (selector === "All") {
		resultContainer.innerHTML = "";
		for (const key in regexPatterns) {
			const regex = regexPatterns[key];
			const resultTable = document.createElement("table");
			if (key === "Background"){
					resultTable.innerHTML = `<thead><tr><th>ID</th><th>File</th></tr></thead><tbody></tbody>`;
			} else {
					resultTable.innerHTML = `<thead><tr><th>ID</th><th>Ver</th><th>File</th></tr></thead><tbody></tbody>`;
			}
			resultContainer.appendChild(resultTable);
			const resultBody = resultTable.querySelector("tbody");
			let matches;
			let rowsHtml = '';
			while ((matches = regex.exec(text)) !== null) {
				let tchar, char, variant, bundle;
				if (key === "Burst(Lobby)" || key === "Burst(Battle)" || key === "Voice" || key === "Voice(MaxBond)" || key === "Voice(Title)") {
					tchar = matches[1];
					char = getFirstPartOfChar(tchar);
					variant = getVariantFromChar(tchar);
					bundle = matches[2];
				} else if (key === "Background"){
					char = matches[1];
					bundle = matches[2];
				} else {
					char = matches[1];
					variant = matches[2];
					bundle = matches[3];
				}
			if (key === "Background"){
					rowsHtml += `<tr><td>${char}</td><td>${bundle}</td></tr>`;
				} else {
					rowsHtml += `<tr><td>${char}</td><td>${variant}</td><td>${bundle}</td></tr>`;
				}
			}
			const sortedRows = rowsHtml.split('</tr>')
				.filter(row => row.trim() !== '')
				.sort((a, b) => {
					const aID = a.split('</td>')[0].split('<td>')[1];
					const bID = b.split('</td>')[0].split('<td>')[1];
					const aVer = a.split('</td>')[1].split('<td>')[1];
					const bVer = b.split('</td>')[1].split('<td>')[1];
					if (aID !== bID) {
						return aID.localeCompare(bID);
					} else {
						return aVer.localeCompare(bVer);
					}
				})
				.join('</tr>');
			resultBody.innerHTML = sortedRows;
			resultTable.innerHTML += `<caption>${key}</caption>`;
		}
	} else if (selector !== "None") {
		const regex = regexPatterns[selector];
		const resultTable = document.createElement("table");
		if (selector === "Background"){
			resultTable.innerHTML = `<thead><tr><th>ID</th><th>File</th></tr></thead><tbody></tbody>`;
		} else {
			resultTable.innerHTML = `<thead><tr><th>ID</th><th>Ver</th><th>File</th></tr></thead><tbody></tbody>`;
		}
		resultContainer.innerHTML = "";
		resultContainer.appendChild(resultTable);
		const resultBody = resultTable.querySelector("tbody");
		let matches;
		let rowsHtml = '';
		while ((matches = regex.exec(text)) !== null) {
			let tchar, char, variant, bundle;
			if (selector === "Burst(Lobby)" || selector === "Burst(Battle)" || selector === "Voice" || selector === "Voice(MaxBond)" || selector === "Voice(Title)") {
				tchar = matches[1];
				char = getFirstPartOfChar(tchar);
				variant = getVariantFromChar(tchar);
				bundle = matches[2];
			} else if (selector === "Background"){
				char = matches[1];
				bundle = matches[2];
			} else {
				char = matches[1];
				variant = matches[2];
				bundle = matches[3];
			}
			if (selector === "Background"){
				rowsHtml += `<tr><td>${char}</td><td>${bundle}</td></tr>`;
			} else {
				rowsHtml += `<tr><td>${char}</td><td>${variant}</td><td>${bundle}</td></tr>`;
			}
		}
		const sortedRows = rowsHtml.split('</tr>')
			.filter(row => row.trim() !== '')
			.sort((a, b) => {
				const aID = a.split('</td>')[0].split('<td>')[1];
				const bID = b.split('</td>')[0].split('<td>')[1];
				const aVer = a.split('</td>')[1].split('<td>')[1];
				const bVer = b.split('</td>')[1].split('<td>')[1];
				if (aID !== bID) {
					return aID.localeCompare(bID);
				} else {
					return aVer.localeCompare(bVer);
				}
			})
			.join('</tr>');
		resultBody.innerHTML = sortedRows;
		resultTable.innerHTML += `<caption>${selector}</caption>`;
	} else {
		resultContainer.innerHTML = "";
	}
	highlightRows();
}

//File Variant
function getVariantFromChar(tchar) {
	return tchar.includes("_") ? tchar.split("_")[1] : "00";
}

//Remove Variant from ID
function getFirstPartOfChar(tchar) {
	const parts = tchar.split('_');
	return parts.length > 0 ? parts[0] : tchar;
}

//Table Layout
function highlightRows() {
	const resultTables = document.querySelectorAll(".table-container table");
	resultTables.forEach(table => {
		const tableBody = table.querySelector("tbody");
		const rows = tableBody.querySelectorAll("tr");
		let idRowsMap = new Map();

		rows.forEach(row => {
			const firstColumn = row.querySelector("td:first-child");
			const id = firstColumn ? firstColumn.textContent.trim() : '';
		if (!idRowsMap.has(id)) {
				idRowsMap.set(id, []);
			}
		idRowsMap.get(id).push(row);
		});

		idRowsMap.forEach(idRows => {
			let groupStarted = false;
			const columnCount = idRows[0].querySelectorAll("td").length;
			idRows.forEach((row, index) => {
				const secondColumn = row.querySelector("td:nth-child(2)");
				const thirdColumn = row.querySelector("td:nth-child(3)");
				const isSecondColumnExceeded = secondColumn ? secondColumn.textContent.length > 2 : false;
				const isThirdColumnExceeded = thirdColumn ? thirdColumn.textContent.length > 32 : false;

				if (!groupStarted) {
					row.style.borderTop = "2px solid black";
					groupStarted = true;
				} else {
					row.style.borderTop = "none";
				}
				if (columnCount > 2 && (isSecondColumnExceeded || isThirdColumnExceeded)) {
					row.style.backgroundColor = "lightcoral";
				} else {
					row.style.backgroundColor = "";
				}
				const lastColumn = row.querySelector("td:last-child");
				if (lastColumn) {
					lastColumn.style.borderRight = "2px solid black";
				}
				const firstColumn = row.querySelector("td:first-child");
				if (firstColumn) {
					firstColumn.style.borderLeft = "2px solid black";
				}
			});

			if (groupStarted) {
				const lastRow = idRows[idRows.length - 1];
				lastRow.style.borderBottom = "2px solid black";
				const lastColumn = lastRow.querySelector("td:last-child");
				if (lastColumn) {
					lastColumn.style.borderRight = "2px solid black";
				}
			}
		});
		const headerRow = table.querySelector("thead tr");

		if (headerRow) {
			headerRow.style.borderTop = "2px solid black";
			headerRow.style.borderBottom = "2px solid black";
			const firstHeader = headerRow.querySelector("th:first-child");
			if (firstHeader) {
				firstHeader.style.borderLeft = "2px solid black";
			}
			const lastHeader = headerRow.querySelector("th:last-child");
			if (lastHeader) {
				lastHeader.style.borderRight = "2px solid black";
			}
		}
	});
}
