/**
 * Dashboard JS
 * Handles loading data from IndexedDB, rendering the table,
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

    // --- Load submissions from IndexedDB ---
    let submissions = [];
    try {
        submissions = await DB.getAll();
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

    // --- Render table content ---
    const tableContent = document.getElementById('table-content');

    if (submissions.length === 0) {
        tableContent.innerHTML =
            '<div class="empty-state">' +
            '<i class="fas fa-inbox"></i>' +
            '<h3>No Submissions Yet</h3>' +
            '<p>Submissions from the customer satisfaction form will appear here.</p>' +
            '</div>';
        return;
    }

    // Build table HTML
    let html =
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

    for (const sub of submissions) {
        const service = sub.service || '';
        const displayService = service.length > 100 ? service.substring(0, 60) + '...' : service;

        const badgeClass = sub.satisfaction === 'Satisfied' ? 'badge-satisfied' : 'badge-not-satisfied';
        const badgeIcon = sub.satisfaction === 'Satisfied' ? 'fa-smile' : 'fa-frown';

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

    // --- Modal: event delegation on tbody ---
    const detailsModal = new bootstrap.Modal(document.getElementById('submissionModal'));
    const tbody = document.getElementById('submissions-tbody');

    tbody.addEventListener('click', function (e) {
        const button = e.target.closest('.btn-view-details');
        if (!button) return;

        e.preventDefault();

        document.getElementById('modal-id').textContent = button.dataset.id;
        document.getElementById('modal-name').textContent = button.dataset.name || 'Anonymous';
        document.getElementById('modal-category').textContent = button.dataset.category || '—';
        document.getElementById('modal-service').textContent = button.dataset.service || '—';
        document.getElementById('modal-comments').textContent = button.dataset.comments || 'No comments provided.';
        document.getElementById('modal-date').textContent = button.dataset.date;

        const satisfactionEl = document.getElementById('modal-satisfaction');
        satisfactionEl.textContent = button.dataset.satisfaction;
        satisfactionEl.className = 'badge rounded-pill';
        satisfactionEl.classList.add(
            button.dataset.satisfaction === 'Satisfied' ? 'text-bg-success' : 'text-bg-danger'
        );

        detailsModal.show();
    });
});

/**
 * Format an ISO date string to a readable format.
 */
function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString();
}

/**
 * Escape HTML entities for safe text insertion.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
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
