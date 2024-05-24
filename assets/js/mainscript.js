var applybtn = document.getElementById("applybtn");
document.getElementById('uploadFile').addEventListener('click', function() {document.getElementById('fileInput').click();});
document.getElementById('uploadFolder').addEventListener('click', function() {document.getElementById('folderInput').click();});
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {checkbox.addEventListener('change', updateTableVisibility);});
document.addEventListener('DOMContentLoaded', fetchData);
document.addEventListener('DOMContentLoaded', function() {handleClick('fileFinderLink', 'file-finder.html');});
document.addEventListener("keypress", function(event) {if (event.keyCode === 13) {applybtn.click();}});

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

function loadPage(page) {
	document.getElementById('maincontent').src = page;
}

function handleClick(clickedId, pageName) {
	document.querySelectorAll('.topnav a').forEach(link => {
		link.classList.remove('active');
	});
	document.getElementById(clickedId).classList.add('active');
	loadPage(pageName);
}

//Search Function
function applyFilter() {
    let idFilter = document.getElementById("idFilter").value.trim().toLowerCase();

    const match = idFilter.match(/^c(\d+)$/);
    if (match) {
        idFilter = match[1];
    }
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
    filteredIds.sort((a, b) => a - b);
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

