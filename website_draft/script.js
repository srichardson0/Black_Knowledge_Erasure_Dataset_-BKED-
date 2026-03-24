document.addEventListener('DOMContentLoaded', () => {
    // Fade in effect mimicking the reference site's jQuery
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = 0;
    mainContent.style.display = 'block';
    let opacity = 0;
    const fadeInterval = setInterval(() => {
        if (opacity >= 1) clearInterval(fadeInterval);
        mainContent.style.opacity = opacity;
        opacity += 0.1;
    }, 30);

    const container = document.getElementById('data-container');
    if (!container) return;

    fetch('../data/model_hallucinations.csv')
        .then(response => {
            if (!response.ok) throw new Error("Dataset not found.");
            return response.text();
        })
        .then(csvText => {
            const parsedData = parseCSV(csvText);
            renderData(parsedData, container);
        })
        .catch(error => {
            container.innerHTML = `<tr><td colspan="5" style="color:red; padding:20px;">
                Error loading dataset. Please view through a local web server to allow file fetching.
            </td></tr>`;
            console.error(error);
        });
});

function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell.trim());
            if (currentRow.length > 0) rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }
    return rows;
}

function renderData(data, container) {
    const rows = data.slice(1); // Skip headers

    rows.forEach((row, index) => {
        if (row.length < 8) return;

        // Strip surrounding quotes
        const prompt = row[2] ? row[2].replace(/^"|"$/g, '') : 'N/A';
        const model = row[3] ? row[3].replace(/^"|"$/g, '') : 'Unknown';
        const modelOutput = row[4] ? row[4].replace(/^"|"$/g, '') : 'N/A';
        let date = row[5] ? row[5].replace(/^"|"$/g, '') : 'N/A';
        const errorType = row[6] ? row[6].replace(/^"|"$/g, '').replace(/_/g, ' ') : 'N/A';
        const errorDesc = row[7] ? row[7].replace(/^"|"$/g, '') : 'N/A';

        // Simplify the date format (e.g., "2025-12-18_23-08-25" to "Dec 2025") to match the reference style
        if(date.length > 7) {
            const d = new Date(date.substring(0, 10));
            if(!isNaN(d)) {
                date = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            }
        }

        // 1. Create the Main Visible Row
        const mainRow = document.createElement('tr');
        mainRow.className = 'linked';
        mainRow.innerHTML = `
            <td>${modelOutput.length > 60 ? modelOutput.substring(0, 60) + '...' : modelOutput}</td>
            <td>${errorType}</td>
            <td>${model}</td>
            <td><span class="toggle-arrow">▼</span></td>
        `;

        // 2. Create the Hidden Details Row (Drop-down)
        const detailsRow = document.createElement('tr');
        detailsRow.className = 'details-row';
        detailsRow.innerHTML = `
            <td colspan="4" class="details-content">
                <div class="details-label">Prompt</div>
                <div><em>"${prompt}"</em></div>
                
                <div class="details-label">Model Response</div>
                <div>${modelOutput}</div>
                
                <div class="details-label">Correction / Error Description</div>
                <div>${errorDesc}</div>
            </td>
        `;

        // 3. Attach click logic to toggle the dropdown
        mainRow.addEventListener('click', () => {
            mainRow.classList.toggle('open');
            detailsRow.classList.toggle('open');
        });

        // 4. Append both to the table body
        container.appendChild(mainRow);
        container.appendChild(detailsRow);
    });
}