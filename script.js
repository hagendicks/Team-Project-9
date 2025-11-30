function validateLogin(event) {
    event.preventDefault();
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!email.value.trim() || !password.value.trim()) {
        alert("Please fill in all fields before logging in.");
        return false;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email.value)) {
        alert("Please enter a valid email address.");
        email.focus();
        return false;
    }

    alert("Login successful! Redirecting to Dashboard...");
    window.location.href = "index.html";
    return true;
}

function validateSignup(event) {
    event.preventDefault();
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!name.value.trim() || !email.value.trim() || !password.value.trim()) {
        alert("All fields are required to create an account.");
        return false;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email.value)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (password.value.length < 6) {
        alert("Password must be at least 6 characters long.");
        return false;
    }

    alert("Account created successfully! Redirecting to login...");
    window.location.href = "login.html";
    return true;
}

let materials = [];

function addMaterial(event) {
    event.preventDefault();
    const materialSelect = document.getElementById("material");
    const quantityInput = document.getElementById("quantity");

    const material = materialSelect.value;
    const quantity = parseFloat(quantityInput.value);

    if (!material || isNaN(quantity) || quantity <= 0) {
        alert("Please select a material and enter a valid quantity.");
        return;
    }


    showNotification('Material addition requested...', 'info');
    quantityInput.value = "";
}

function updateMaterialTable() {
    const tableBody = document.getElementById("materialTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

}

function updateTotalValue() {
    const totalElement = document.getElementById("totalValue");
    if (totalElement) {

        totalElement.textContent = "GHS 0.00";
    }
}

function assessDemand() {

    showNotification('Demand assessment requested from server...', 'info');
}

function saveRecentAnalysis(total, score) {
    const list = document.getElementById("recentList");
    if (!list) return;

}

function loadRecentAnalyses() {
    const history = JSON.parse(localStorage.getItem("recentAnalyses") || "[]");
    const tbody = document.getElementById("recentTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (history.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>No analyses found.</td></tr>";
        return;
    }

    history.forEach((entry) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>GHS ${entry.total.toLocaleString()}</td>
            <td>${entry.score}%</td>
        `;
        tbody.appendChild(row);
    });
}


function calculateGPE(event) {
    event.preventDefault();

    const calculateButton = event.target.querySelector('button[type="submit"]');
    const originalText = calculateButton.textContent;

    calculateButton.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
    calculateButton.disabled = true;


    setTimeout(() => {
        showNotification('GPE analysis request sent to server...', 'info');

        calculateButton.textContent = originalText;
        calculateButton.disabled = false;
    }, 1500);
}

function displayGPEResults(result) {
    const resultsDiv = document.getElementById('gpeResults');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
        <div style="border-left: 4px solid #2E2E2E; padding-left: 15px;">
            <p><strong>Submit the form to see analysis results</strong></p>
            <p>All calculations are performed server-side for accuracy and data security.</p>
        </div>
    `;
}

function saveGPEAnalysis(formData, result) {

}

function updateGPERecentTable() {
    const tbody = document.getElementById('gpeRecentTableBody');
    if (!tbody) return;

    const gpeHistory = JSON.parse(localStorage.getItem('gpeAnalyses') || '[]');

    if (gpeHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No GPE analyses found.</td></tr>';
        return;
    }

    tbody.innerHTML = gpeHistory.map(analysis => `
        <tr>
            <td>${analysis.date}</td>
            <td>${analysis.dfs}%</td>
            <td>${analysis.dom}</td>
            <td>GHS ${analysis.pricePerSqm.toLocaleString()}</td>
        </tr>
    `).join('');
}

function setupRealTimeCalculations() {
    const quantityInput = document.getElementById('quantity');
    const materialSelect = document.getElementById('material');

    if (quantityInput && materialSelect) {
        quantityInput.addEventListener('input', updateLiveCalculation);
        materialSelect.addEventListener('change', updateLiveCalculation);
    }

    setupGPERealTime();
}

function updateLiveCalculation() {
    const materialElement = document.getElementById('material');
    const quantityElement = document.getElementById('quantity');

    if (!materialElement || !quantityElement) return;

    const material = materialElement.value;
    const quantity = parseFloat(quantityElement.value);

    if (material && !isNaN(quantity) && quantity > 0) {
        const form = document.querySelector('form');
        if (!form) return;

        let preview = document.getElementById('calculationPreview');
        if (!preview) {
            const previewDiv = document.createElement('div');
            previewDiv.id = 'calculationPreview';
            previewDiv.className = 'calculation-preview';
            form.appendChild(previewDiv);
            preview = previewDiv;
        }

        preview.innerHTML = `
            <strong>Live Preview:</strong> Ready to calculate ${quantity} × ${material}
        `;
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidation);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const messageId = `${field.id}Validation`;

    const existingMessage = document.getElementById(messageId);
    if (existingMessage) {
        existingMessage.remove();
    }

    const message = document.createElement('div');
    message.id = messageId;
    message.className = 'validation-message';

    if (!value) {
        field.classList.remove('input-valid');
        field.classList.add('input-invalid');
        message.textContent = 'This field is required';
        message.className += ' invalid';
    } else {
        field.classList.remove('input-invalid');
        field.classList.add('input-valid');
        message.textContent = 'Looks good!';
        message.className += ' valid';
    }

    field.parentNode.appendChild(message);
}

function clearValidation(e) {
    const field = e.target;
    field.classList.remove('input-valid', 'input-invalid');

    const messageId = `${field.id}Validation`;
    const existingMessage = document.getElementById(messageId);
    if (existingMessage) {
        existingMessage.remove();
    }
}

function setupMaterialSearch() {
    const searchInput = document.getElementById('materialSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', filterMaterials);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMaterials();
        });
    });
}

function filterMaterials() {
    const searchInput = document.getElementById('materialSearch');
    const activeFilterBtn = document.querySelector('.filter-btn.active');

    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase() || '';
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const rows = document.querySelectorAll('#materialsTable tbody tr');

    rows.forEach(row => {
        const material = row.cells[0].textContent.toLowerCase();
        const category = row.cells[3].textContent.toLowerCase();
        const matchesSearch = material.includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || category.includes(activeFilter);

        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}

function animateProgressBar(progressId, targetValue, duration = 1000) {
    const progressBar = document.getElementById(progressId);
    if (!progressBar) return;

    const progressFill = progressBar.querySelector('.progress-fill');
    if (!progressFill) return;

    let startValue = 0;
    const increment = targetValue / (duration / 16);

    const animate = () => {
        startValue += increment;
        if (startValue >= targetValue) {
            progressFill.style.width = targetValue + '%';
            return;
        }
        progressFill.style.width = startValue + '%';
        requestAnimationFrame(animate);
    };

    animate();
}

function setupInteractiveTables() {
    const tables = document.querySelectorAll('.interactive-table');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            row.addEventListener('click', function() {
                rows.forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');

                const material = this.cells[0].textContent;
                showNotification(`Selected: ${material}`, 'info');
            });
        });
    });
}

function setupGPERealTime() {
    const gpeInputs = document.querySelectorAll('#gpeForm input, #gpeForm select');

    gpeInputs.forEach(input => {
        input.addEventListener('input', debounce(updateGPEPreview, 500));
        input.addEventListener('change', debounce(updateGPEPreview, 300));
    });
}

function updateGPEPreview() {
    const pricePerSqmElement = document.getElementById('pricePerSqm');
    const areaElement = document.getElementById('area');

    if (!pricePerSqmElement || !areaElement) return;

    const pricePerSqm = pricePerSqmElement.value || '';
    const area = areaElement.value || '';

    if (pricePerSqm && area) {
        const gpeForm = document.querySelector('#gpeForm');
        if (!gpeForm) return;

        let preview = document.getElementById('gpePreview');
        if (!preview) {
            const previewDiv = document.createElement('div');
            previewDiv.id = 'gpePreview';
            previewDiv.className = 'calculation-preview';
            gpeForm.appendChild(previewDiv);
            preview = previewDiv;
        }

        preview.innerHTML = `
            <strong>Inputs Updated:</strong> Review your entries
            <br><small>All fields filled - ready to calculate</small>
        `;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setupFormValidation();
    setupMaterialSearch();
    setupInteractiveTables();
    setupGPERealTime();

    if (document.getElementById('recentTableBody')) {
        loadRecentAnalyses();
    }

    if (document.getElementById('gpeRecentTableBody')) {
        updateGPERecentTable();
    }

    setTimeout(() => {
        const demandProgress = document.getElementById('demandProgress');
        const costProgress = document.getElementById('costProgress');

        if (demandProgress) animateProgressBar('demandProgress', 75);
        if (costProgress) animateProgressBar('costProgress', 60);
    }, 1000);
});

function refreshInsights() {
    showNotification('Refreshing insights from server...', 'info');
}

function initializeCharts() {
    initializeCostChart();
    initializeDemandChart();
    initializePriceChart();
    initializeGPEDistributionChart();
}

function initializeCostChart() {
    const costCtx = document.getElementById('costChart');
    if (!costCtx) return;

    new Chart(costCtx, {
        type: 'doughnut',
        data: {
            labels: ['Cement', 'Steel', 'Blocks', 'Sand', 'Paint'],
            datasets: [{
                data: [25, 35, 15, 15, 10],
                backgroundColor: [
                    '#2E2E2E',
                    '#4a4a4a',
                    '#666',
                    '#888',
                    '#aaa'
                ],
                borderWidth: 2,
                borderColor: '#FFFAFA'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'Material Cost Distribution'
                }
            }
        }
    });
}

function initializeDemandChart() {
    const demandCtx = document.getElementById('demandChart');
    if (!demandCtx) return;

    new Chart(demandCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Demand Score (%)',
                data: [65, 75, 70, 80, 85, 90],
                borderColor: '#2E2E2E',
                backgroundColor: 'rgba(46, 46, 46, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2E2E2E',
                pointBorderColor: '#FFFAFA',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Demand Trends'
                }
            }
        }
    });
}

function initializePriceChart() {
    const priceCtx = document.getElementById('priceChart');
    if (!priceCtx) return;

    new Chart(priceCtx, {
        type: 'bar',
        data: {
            labels: ['Cement', 'Steel', 'Blocks', 'Sand', 'Paint'],
            datasets: [{
                label: 'Price (GHS)',
                data: [85, 4200, 3.5, 250, 300],
                backgroundColor: [
                    'rgba(46, 46, 46, 0.8)',
                    'rgba(74, 74, 74, 0.8)',
                    'rgba(102, 102, 102, 0.8)',
                    'rgba(136, 136, 136, 0.8)',
                    'rgba(170, 170, 170, 0.8)'
                ],
                borderColor: [
                    '#2E2E2E',
                    '#4a4a4a',
                    '#666',
                    '#888',
                    '#aaa'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Price (GHS)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Material Price Comparison'
                }
            }
        }
    });
}

function initializeGPEDistributionChart() {
    const gpeCtx = document.getElementById('gpeDistributionChart');
    if (!gpeCtx) return;

    new Chart(gpeCtx, {
        type: 'pie',
        data: {
            labels: ['High Demand', 'Moderate Demand', 'Low Demand'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: [
                    '#27ae60',
                    '#f39c12',
                    '#e74c3c'
                ],
                borderWidth: 2,
                borderColor: '#FFFAFA'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'GPE Demand Level Distribution'
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupFormValidation();
    setupMaterialSearch();
    setupInteractiveTables();
    setupGPERealTime();
    setupUserProfile();
    updateHeaderProfile();

    if (document.getElementById('recentTableBody')) {
        loadRecentAnalyses();
    }

    if (document.getElementById('gpeRecentTableBody')) {
        updateGPERecentTable();
    }

    if (document.getElementById('costChart')) {
        initializeCharts();
    }

    setTimeout(() => {
        const demandProgress = document.getElementById('demandProgress');
        const costProgress = document.getElementById('costProgress');

        if (demandProgress) animateProgressBar('demandProgress', 75);
        if (costProgress) animateProgressBar('costProgress', 60);
    }, 1000);
});

    setTimeout(() => {
        const demandProgress = document.getElementById('demandProgress');
        const costProgress = document.getElementById('costProgress');

        if (demandProgress) animateProgressBar('demandProgress', 75);
        if (costProgress) animateProgressBar('costProgress', 60);
    }, 1000);
});
const form = document.getElementById('gpeForm');
const bar = document.getElementById('bar');
const dfsEl = document.getElementById('dfs');
const domEl = document.getElementById('dom');
const API_URL = "https://gpe-backend.onrender.com/api/predict";

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    console.log("GPE form submitted!");
    console.log("Raw FormData:", new FormData(form));
    const data = Object.fromEntries(new FormData(form).entries());
    const rawEntries = [...new FormData(form).entries()];
    console.log("FormData entries:", rawEntries);
    console.log("Data object:", data);

    for (const k in data) { // convert numerics
        if (['floor'].includes(k)) continue;
        if (data[k] === '') { delete data[k]; continue; }
        const n = Number(data[k]);
        if (!Number.isNaN(n)) data[k] = n;
    }
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
        });
    const out = await res.json();
    console.log(out); // optional, for debugging in the browser console
    const dfs = Math.max(0, Math.min(100, Number(out.DFS_percent ?? 0)));
    const dom = Number(out.predicted_DOM_days ?? 0);
    bar.style.width = dfs + '%';
    dfsEl.textContent = dfs.toFixed(1);
    domEl.textContent = dom.toFixed(1);
});

function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.toggle('active');
    }
}

function updateUserInfo() {
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userName = localStorage.getItem('userName') || 'User';
    
    const userNameElement = document.querySelector('.user-name');
    const userEmailElement = document.getElementById('userEmailDisplay');
    
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    if (userEmailElement) {
        userEmailElement.textContent = userEmail;
    }
}

function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

function setupUserProfile() {
    updateUserInfo();
    
    const userInfoElement = document.querySelector('.user-info');
    if (userInfoElement) {
        userInfoElement.addEventListener('click', toggleUserMenu);
    }
    
    document.addEventListener('click', function(event) {
        const userMenu = document.getElementById('userMenu');
        const userInfo = document.querySelector('.user-info');
        
        if (userMenu && userInfo && !userInfo.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.remove('active');
        }
    });
}
