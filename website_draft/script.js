let loadedChartData = null;
let chartInstances = {};
let isPaused = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIAL FADE IN
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.opacity = 0;
        mainContent.style.display = 'block';
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            if (opacity >= 1) clearInterval(fadeInterval);
            mainContent.style.opacity = opacity;
            opacity += 0.1;
        }, 30);
    }

    // 2. DATA LOADING & CAROUSEL INITIALIZATION
    const container = document.getElementById('data-container');
    if (container) {
        fetch('../data/model_hallucinations.csv')
            .then(response => {
                if (!response.ok) throw new Error("Dataset not found.");
                return response.text();
            })
            .then(csvText => {
                const parsedData = parseCSV(csvText);
                loadedChartData = parsedData;

                // Limit to 50 records + 1 for header
                const limitedData = parsedData.slice(0, 51); 

                renderData(limitedData, container);
                renderCharts(parsedData);
                
                // Start the autoscroll flow
                initCarousel();
            })
            .catch(error => {
                container.innerHTML = `<tr><td colspan="5" style="color:red; padding:20px;">
                    Error loading dataset. Please view through a local web server.
                </td></tr>`;
                console.error(error);
            });
    }

    // 3. THEME TOGGLE LOGIC
    const toggleCheckbox = document.getElementById('theme-toggle-checkbox');
    if (toggleCheckbox) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') toggleCheckbox.checked = true;

        toggleCheckbox.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (loadedChartData) renderCharts(loadedChartData);
        });
    }

    // 4. DRAGGABLE WINDOW LOGIC
    const draggableWindows = document.querySelectorAll('.draggable-window');
    let highestZIndex = 100;

    draggableWindows.forEach(win => {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        win.addEventListener('mousedown', (e) => {
            highestZIndex++;
            win.style.zIndex = highestZIndex;
            isDragging = true;
            win.classList.add('dragging');
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = win.offsetLeft;
            initialTop = win.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            win.style.left = `${initialLeft + dx}px`;
            win.style.top = `${initialTop + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            win.classList.remove('dragging');
        });
    });

    // 5. HIDE INSIGHTS TOGGLE
    const toggleBtn = document.getElementById('toggle-windows');
    const windowWrapper = document.getElementById('floating-container-wrapper');

    if (toggleBtn && windowWrapper) {
        toggleBtn.addEventListener('click', () => {
            windowWrapper.classList.toggle('windows-hidden');
            toggleBtn.textContent = windowWrapper.classList.contains('windows-hidden') 
                ? 'show insights' 
                : 'hide insights';
        });
    }

    // 6. START VISUAL EFFECTS
    startTypewriter();
    startRandomGlitch();
});

/* --- CAROUSEL & INTERACTION FUNCTIONS --- */

function initCarousel() {
    const scrollContainer = document.getElementById('full-table');
    if (!scrollContainer) return;

    // Pause logic for hover
    scrollContainer.addEventListener('mouseover', (e) => {
        // Stop the flow if hovering over an arrow or an open detail box
        if (e.target.classList.contains('toggle-arrow') || e.target.closest('.details-row')) {
            isPaused = true;
        }
    });

    scrollContainer.addEventListener('mouseout', (e) => {
        // Only resume if there are no rows currently clicked open
        const anyOpen = document.querySelector('tr.details-row.open');
        if (!anyOpen) {
            isPaused = false;
        }
    });

    function step() {
        if (!isPaused) {
            scrollContainer.scrollTop += 0.33; // Speed of the feed
            
            // Seamless loop: if we hit the bottom, snap to top
            if (scrollContainer.scrollTop >= (scrollContainer.scrollHeight - scrollContainer.clientHeight)) {
                scrollContainer.scrollTop = 0;
            }
        }
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

/* --- DATA PROCESSING & CHART FUNCTIONS --- */

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
    const rows = data.slice(1);
    rows.forEach((row) => {
        if (row.length < 8) return;
        const prompt = row[2] ? row[2].replace(/^"|"$/g, '') : 'N/A';
        const model = row[3] ? row[3].replace(/^"|"$/g, '') : 'Unknown';
        const modelOutput = row[4] ? row[4].replace(/^"|"$/g, '') : 'N/A';
        const errorType = row[6] ? row[6].replace(/^"|"$/g, '').replace(/_/g, ' ') : 'N/A';
        const errorDesc = row[7] ? row[7].replace(/^"|"$/g, '') : 'N/A';

        // Column widths here MUST match the <th> widths in your index.html
        const mainRow = document.createElement('tr');
        mainRow.className = 'linked';
        mainRow.innerHTML = `
            <td style="width: 45%;">${modelOutput.length > 60 ? modelOutput.substring(0, 60) + '...' : modelOutput}</td>
            <td style="width: 20%;">${errorType}</td>
            <td style="width: 30%;">${model}</td>
            <td style="width: 5%; text-align: center;"><span class="toggle-arrow">▼</span></td>
        `;

        const detailsRow = document.createElement('tr');
        detailsRow.className = 'details-row';
        detailsRow.innerHTML = `
            <td colspan="4" class="details-content">
                <div class="details-label">Prompt</div>
                <div style="white-space: normal;"><em>"${prompt}"</em></div>
                <div class="details-label">Model Response</div>
                <div style="white-space: normal;">${modelOutput}</div>
                <div class="details-label">Correction / Error Description</div>
                <div style="white-space: normal;">${errorDesc}</div>
            </td>
        `;

        mainRow.addEventListener('click', () => {
            const isOpen = detailsRow.classList.contains('open');
            
            // Clear other open rows for a clean focus
            document.querySelectorAll('.details-row.open').forEach(r => r.classList.remove('open'));
            document.querySelectorAll('tr.linked.open').forEach(r => r.classList.remove('open'));

            if (!isOpen) {
                mainRow.classList.add('open');
                detailsRow.classList.add('open');
                isPaused = true; // Stop flow while the user is reading
            } else {
                isPaused = false; 
            }
        });

        container.appendChild(mainRow);
        container.appendChild(detailsRow);
    });
}

function renderCharts(data) {
    const chartEl = document.getElementById('chart-error-type');
    if (!chartEl) return;
    destroyCharts();

    const headerRow = data[0] || [];
    const rows = data.slice(1).filter(row => row.length >= headerRow.length);
    const clean = cell => (cell || '').replace(/^"|"$/g, '').trim();
    const counts = { model: {}, error_type: {}, category: {} };

    const modelIdx = headerRow.findIndex(c => clean(c) === 'model');
    const errorIdx = headerRow.findIndex(c => clean(c) === 'error_type');
    const catIdx = headerRow.findIndex(c => clean(c) === 'category');

    rows.forEach(row => {
        const m = clean(row[modelIdx] || 'Unknown');
        const e = clean(row[errorIdx] || 'Unknown');
        const c = clean(row[catIdx] || 'Unknown');
        counts.model[m] = (counts.model[m] || 0) + 1;
        counts.error_type[e] = (counts.error_type[e] || 0) + 1;
        counts.category[c] = (counts.category[c] || 0) + 1;
    });

    const theme = getComputedStyle(document.documentElement);
    const textColor = theme.getPropertyValue('--text-primary').trim();
    const accent = theme.getPropertyValue('--accent').trim();
    const secondary = theme.getPropertyValue('--text-secondary').trim();
    const chartPalette = [accent, secondary, '#84aeae', '#b5d3d9', '#c3d8db', '#d8e6eb'];

    const createBarChart = (id, label, source) => {
        const ctx = document.getElementById(id)?.getContext('2d');
        if (!ctx) return;
        const entries = Object.entries(source).sort((a, b) => b[1] - a[1]);
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0].replace(/_/g, ' ')),
                datasets: [{ label, data: entries.map(e => e[1]), backgroundColor: chartPalette }]
            },
            options: { 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { 
                    x: { ticks: { color: textColor }, grid: { display: false } }, 
                    y: { ticks: { color: textColor } } 
                } 
            }
        });
    };

    const createDoughnutChart = (id, source) => {
        const ctx = document.getElementById(id)?.getContext('2d');
        if (!ctx) return;
        const entries = Object.entries(source).sort((a, b) => b[1] - a[1]);
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{ 
                    data: entries.map(e => e[1]), 
                    backgroundColor: chartPalette,
                    borderColor: theme.getPropertyValue('--bg-primary').trim(),
                    borderWidth: 2
                }]
            },
            options: { 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'bottom', labels: { color: textColor, padding: 20 } } 
                } 
            }
        });
    };

    chartInstances.errorType = createBarChart('chart-error-type', 'Errors', counts.error_type);
    chartInstances.categoryCounts = createBarChart('chart-category-counts', 'Records', counts.category);
    chartInstances.modelCounts = createDoughnutChart('chart-model-counts', counts.model);
}

function destroyCharts() {
    Object.values(chartInstances).forEach(c => c?.destroy());
    chartInstances = {};
}

function startTypewriter() {
    const text = "The AI 'Hallucinations' Project";
    const container = document.getElementById('typewriter');
    if (!container) return;
    let index = 0;
    function type() {
        if (index < text.length) {
            container.textContent += text.charAt(index);
            index++;
            setTimeout(type, Math.random() * 100 + 50);
        }
    }
    container.textContent = "";
    type();
}

function startRandomGlitch() {
    const title = document.getElementById('title-l1');
    if (!title) return;
    const glitchBurst = () => {
        title.classList.add('glitch-active');
        setTimeout(() => {
            title.classList.remove('glitch-active');
            setTimeout(glitchBurst, Math.random() * 7000 + 3000);
        }, Math.random() * 250 + 150);
    };
    setTimeout(glitchBurst, 5000);
}