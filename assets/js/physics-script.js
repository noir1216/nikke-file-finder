//Syntax
const regexPatterns = {
	'Aim(Physics)': /spine\/physics\/(\w+)\/(\w+)\/aim (\w{1,32})/g,
	'AimShooting(Physics)': /spine\/physics\/(\w+)\/(\w+)\/aim-shooting (\w{1,32})/g,
	'Cover(Physics)': /spine\/physics\/(\w+)\/(\w+)\/cover (\w{1,32})/g,
};
		
//File Reader
function readFile(input) {
	const file = input.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			let fileContent = e.target.result;
			const matchSpinePhysics = fileContent.match(/spinephysicssettings_assets_all_([a-zA-Z0-9]+)|spineinternal_assets_all_([^"]+).bundle","{UnityEngine.AddressableAssets.Addressables.RuntimePath}\\\\\\\\StandaloneWindows64\\\\\\\\mods\\\\\\\\([a-zA-Z0-9]+)/);
			const matchKeyData = fileContent.match(/"m_KeyDataString":\s*"([^"]+)"/);
			
			if (matchSpinePhysics) {
				let word = matchSpinePhysics[1] || matchSpinePhysics[3];
				if (word && word.length !== 0) {
					document.getElementById("textArea2").value = word;
					if (matchKeyData) {
						let longString = matchKeyData[1];
						const decoded = decodeBase64(longString);
						document.getElementById('decoded').value = decoded;
					}
				}
				updateSelectorState();
			}
		};
		reader.readAsText(file);
	}
}

//Folder Reader
function readFolder(input) {
	const files = input.files;
	let combinedText = "";
	let delimiter = "|";
	if (files.length > 0) {
		for (const file of files) {
			if (file.name.toLowerCase().endsWith('.json')) {
				if (file.size >= 0 && file.size <= 25000000) { // kek
					const reader = new FileReader();
					reader.onload = function (e) {
						let fileContent = e.target.result;
						const matchKeyData = fileContent.match(/"m_KeyDataString":\s*"([^"]+)"/);
						const matchSpinePhysics = fileContent.match(/spinephysicssettings_assets_all_([a-zA-Z0-9]+)|spineinternal_assets_all_([^"]+).bundle","{UnityEngine.AddressableAssets.Addressables.RuntimePath}\\\\\\\\StandaloneWindows64\\\\\\\\mods\\\\\\\\([a-zA-Z0-9]+)/);
						if (matchSpinePhysics && document.getElementById("textArea2")) {
							let word = matchSpinePhysics[1] || matchSpinePhysics[3];
							if (word && word.length !== 0) {
								document.getElementById("textArea2").value = word;
								if (matchKeyData) {
									let longString = matchKeyData[1];
									combinedText += longString + delimiter; 
									const decoded = decodeBase64(combinedText);
									document.getElementById('decoded').value = decoded;
								}
							}
							updateSelectorState();
						}
					};
					reader.readAsText(file);
				} else {
				}
			} else {
			}
		}
	}
}

//Base64 Decoder
function decodeBase64(encodedInput) {
	const longStrings = encodedInput.split('|');
	let decoded = ''
	for (const longString of longStrings) {
		decoded += atob(longString).replace(/[\x00-\x1F\x7F]/g, ""); 
	}
	const matchedStrings = [];
	for (const key in regexPatterns) {
		const regex = regexPatterns[key];
		let match;
		while ((match = regex.exec(decoded)) !== null) {
			matchedStrings.push(match[0]);
		}
	}
	decoded = matchedStrings.join('\n');
	return decoded;
}

//Export Function
function exportTable() {
	const selector = document.getElementById("selector").value;
	const resultContainer = document.getElementById("resultContainer");
	const resultTables = resultContainer.querySelectorAll("table");
	const exportData = [["ID", "Ver", "Container"]]
	resultTables.forEach(table => {
		const rows = table.querySelectorAll("tbody tr");
		rows.forEach(row => {
			const columns = row.querySelectorAll("td");
			const rowData = Array.from(columns).map(column => column.textContent);
			exportData.push(rowData);
		});
	})
	const csvContent = exportData.map(row => row.join(",")).join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a")
	link.href = URL.createObjectURL(blob);
	link.download = `${selector}_Table.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function updateSelectorState() {
	const decoded = document.getElementById("decoded");
	const selector = document.getElementById("selector");
	const exportButton = document.getElementById("exportButton");
	const checkboxGroup = document.getElementById('checkboxGroup')
	selector.disabled = decoded.value.trim() === "";
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

//MAIN		
function analyzeText() {
	const text = document.getElementById("decoded").value;
	const selector = document.getElementById("selector").value;
	const resultContainer = document.getElementById("resultContainer");
	resultContainer.innerHTML = "";
	if (selector === "All") {
		for (const key in regexPatterns) {
			const regex = regexPatterns[key];
			const resultTable = document.createElement("table");
			resultTable.innerHTML = `<thead><tr><th>ID</th><th>Ver</th><th>Container</th></tr></thead><tbody></tbody>`;
			resultContainer.appendChild(resultTable);
			const resultBody = resultTable.querySelector("tbody");
			let matches;
			let rows = [];
			
			while ((matches = regex.exec(text)) !== null) {
			let char = matches[1];
			let variant = matches[2];
				let bundle = matches[3];
				rows.push({ char, variant, bundle });
			}
			rows.sort((a, b) => a.char - b.char || a.variant - b.variant);
				rows.forEach(row => {
				let charWithPrefix = 'c' + row.char;
				resultBody.innerHTML += `<tr><td>${charWithPrefix}</td><td>${row.variant}</td><td>${row.bundle}</td></tr>`;
			});
			resultTable.innerHTML += `<caption>${key}</caption>`;
		}
	} else if (selector !== "None") {
		const regex = regexPatterns[selector];
		const resultTable = document.createElement("table");
		resultTable.innerHTML = `<thead><tr><th>ID</th><th>Ver</th><th>Container</th></tr></thead><tbody></tbody>`;
		resultContainer.appendChild(resultTable);
		const resultBody = resultTable.querySelector("tbody");
		let matches;
		let rows = [];
		
		while ((matches = regex.exec(text)) !== null) {
			let char = matches[1];
			let variant = matches[2];
			let bundle = matches[3];
			rows.push({ char, variant, bundle });
		}
		rows.sort((a, b) => a.char - b.char || a.variant - b.variant);
		rows.forEach(row => {
		let charWithPrefix = 'c' + row.char;
		resultBody.innerHTML += `<tr><td>${charWithPrefix}</td><td>${row.variant}</td><td>${row.bundle}</td></tr>`;
		});
		resultTable.innerHTML += `<caption>${selector}</caption>`;
	}
	highlightRows();
}
