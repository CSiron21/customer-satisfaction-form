/**
 * Dashboard JS
 * Handles loading data from API, rendering paginated table,
 * and modal interactions for the Admin Dashboard.
 */

document.addEventListener('DOMContentLoaded', async function () {
    // --- Require authentication ---
    Auth.requireLogin();

    // --- Display admin username in nav ---
    const navUsername = document.getElementById('nav-username');
    if (navUsername) {
        navUsername.textContent = Auth.getUsername() || 'Admin';
    }

    // --- Logout handler ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            Auth.logout();
        });
    }

    // --- Load submissions from API ---
    let submissions = [];
    try {
        submissions = await API.getAllSubmissions();
    } catch (err) {
        console.error('Failed to load submissions:', err);
    }

    // --- Update summary cards ---
    const counts = {
        total: submissions.length,
        satisfied: submissions.filter(s => s.satisfaction === 'Satisfied').length,
        notSatisfied: 0
    };
    counts.notSatisfied = counts.total - counts.satisfied;

    document.getElementById('count-total').textContent = counts.total;
    document.getElementById('count-satisfied').textContent = counts.satisfied;
    document.getElementById('count-not-satisfied').textContent = counts.notSatisfied;

    // --- Pagination State ---
    let currentPage = 1;
    let entriesPerPage = 10;

    const tableContent = document.getElementById('table-content');
    const tableFooter = document.getElementById('table-footer');
    const paginationInfo = document.getElementById('pagination-info');
    const paginationControls = document.getElementById('pagination-controls');
    const entriesSelect = document.getElementById('entries-select');

    // --- Entries selector handler ---
    entriesSelect.addEventListener('change', function () {
        entriesPerPage = parseInt(this.value, 10);
        currentPage = 1;
        renderTable();
    });

    // --- Render Table with Pagination ---
    function renderTable() {
        if (submissions.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state">' +
                '<i class="fas fa-inbox"></i>' +
                '<h3>No Submissions Yet</h3>' +
                '<p>Submissions from the customer satisfaction form will appear here.</p>' +
                '</div>';
            tableFooter.style.display = 'none';
            return;
        }

        var totalPages = Math.ceil(submissions.length / entriesPerPage);
        if (currentPage > totalPages) currentPage = totalPages;

        var start = (currentPage - 1) * entriesPerPage;
        var end = Math.min(start + entriesPerPage, submissions.length);
        var pageData = submissions.slice(start, end);

        // Build table
        var html =
            '<div class="table-responsive">' +
            '<table class="table submissions-table align-middle">' +
            '<thead><tr>' +
            '<th scope="col">#</th>' +
            '<th scope="col">Category</th>' +
            '<th scope="col">Service / Purpose</th>' +
            '<th scope="col">Satisfaction</th>' +
            '<th scope="col">Submitted At</th>' +
            '<th scope="col" class="text-end">Action</th>' +
            '</tr></thead>' +
            '<tbody id="submissions-tbody">';

        for (var i = 0; i < pageData.length; i++) {
            var sub = pageData[i];
            var service = sub.service || '';
            var displayService = service.length > 100 ? service.substring(0, 60) + '...' : service;
            var badgeClass = sub.satisfaction === 'Satisfied' ? 'badge-satisfied' : 'badge-not-satisfied';
            var badgeIcon = sub.satisfaction === 'Satisfied' ? 'fa-smile' : 'fa-frown';

            html +=
                '<tr>' +
                '<td class="td-id">' + escapeHtml(String(sub.id)) + '</td>' +
                '<td>' + (sub.category ? escapeHtml(sub.category) : '<span class="text-muted">—</span>') + '</td>' +
                '<td>' + (displayService ? escapeHtml(displayService) : '<span class="text-muted">—</span>') + '</td>' +
                '<td><span class="' + badgeClass + '"><i class="fas ' + badgeIcon + ' me-1"></i>' + escapeHtml(sub.satisfaction) + '</span></td>' +
                '<td class="td-date">' + escapeHtml(formatDate(sub.created_at)) + '</td>' +
                '<td class="text-end">' +
                '<button class="btn btn-sm btn-outline-primary btn-view-details" ' +
                'data-id="' + escapeAttr(String(sub.id)) + '" ' +
                'data-name="' + escapeAttr(sub.name || '') + '" ' +
                'data-category="' + escapeAttr(sub.category || '') + '" ' +
                'data-service="' + escapeAttr(sub.service || '') + '" ' +
                'data-satisfaction="' + escapeAttr(sub.satisfaction) + '" ' +
                'data-comments="' + escapeAttr(sub.comments || '') + '" ' +
                'data-date="' + escapeAttr(formatDate(sub.created_at)) + '" ' +
                'title="View Details">' +
                '<i class="fas fa-eye me-1"></i> View' +
                '</button>' +
                '</td>' +
                '</tr>';
        }

        html += '</tbody></table></div>';
        tableContent.innerHTML = html;

        // Update pagination info
        paginationInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + submissions.length + ' entries';

        // Build pagination controls
        var paginationHtml = '';

        // Previous button
        paginationHtml += '<button class="page-btn" data-page="prev"' + (currentPage === 1 ? ' disabled' : '') + '>';
        paginationHtml += '<i class="fas fa-chevron-left"></i>';
        paginationHtml += '</button>';

        // Page numbers (show max 5 pages around current)
        var startPage = Math.max(1, currentPage - 2);
        var endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationHtml += '<button class="page-btn" data-page="1">1</button>';
            if (startPage > 2) paginationHtml += '<span style="padding: 0 4px; color: #999;">...</span>';
        }

        for (var p = startPage; p <= endPage; p++) {
            paginationHtml += '<button class="page-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) paginationHtml += '<span style="padding: 0 4px; color: #999;">...</span>';
            paginationHtml += '<button class="page-btn" data-page="' + totalPages + '">' + totalPages + '</button>';
        }

        // Next button
        paginationHtml += '<button class="page-btn" data-page="next"' + (currentPage === totalPages ? ' disabled' : '') + '>';
        paginationHtml += '<i class="fas fa-chevron-right"></i>';
        paginationHtml += '</button>';

        paginationControls.innerHTML = paginationHtml;
        tableFooter.style.display = 'flex';

        // Attach modal listener to new tbody
        attachModalListeners();
    }

    // --- Pagination click handler ---
    paginationControls.addEventListener('click', function (e) {
        var btn = e.target.closest('.page-btn');
        if (!btn || btn.disabled) return;

        var page = btn.dataset.page;
        var totalPages = Math.ceil(submissions.length / entriesPerPage);

        if (page === 'prev') {
            currentPage = Math.max(1, currentPage - 1);
        } else if (page === 'next') {
            currentPage = Math.min(totalPages, currentPage + 1);
        } else {
            currentPage = parseInt(page, 10);
        }

        renderTable();
    });

    // --- Modal: event delegation ---
    var detailsModal = new bootstrap.Modal(document.getElementById('submissionModal'));

    function attachModalListeners() {
        var tbody = document.getElementById('submissions-tbody');
        if (!tbody) return;

        tbody.addEventListener('click', function (e) {
            var button = e.target.closest('.btn-view-details');
            if (!button) return;

            e.preventDefault();

            document.getElementById('modal-id').textContent = button.dataset.id;
            document.getElementById('modal-name').textContent = button.dataset.name || 'Anonymous';
            document.getElementById('modal-category').textContent = button.dataset.category || '—';
            document.getElementById('modal-service').textContent = button.dataset.service || '—';
            document.getElementById('modal-comments').textContent = button.dataset.comments || 'No comments provided.';
            document.getElementById('modal-date').textContent = button.dataset.date;

            var satisfactionEl = document.getElementById('modal-satisfaction');
            satisfactionEl.textContent = button.dataset.satisfaction;
            satisfactionEl.className = 'badge rounded-pill';
            satisfactionEl.classList.add(
                button.dataset.satisfaction === 'Satisfied' ? 'text-bg-success' : 'text-bg-danger'
            );

            detailsModal.show();
        });
    }

    // --- Initial render ---
    renderTable();
});

/**
 * Format an ISO date string to a readable format.
 */
function formatDate(isoString) {
    if (!isoString) return '';
    var d = new Date(isoString);
    return d.toLocaleString();
}

/**
 * Escape HTML entities for safe text insertion.
 */
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape a string for use in an HTML attribute value.
 */
function escapeAttr(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
