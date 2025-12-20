
// toast.js

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Create container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Choose icon based on type
    let icon = '';
    switch (type) {
        case 'success': icon = '✅'; break;
        case 'error': icon = '❌'; break;
        case 'warning': icon = '⚠️'; break;
        default: icon = 'ℹ️';
    }

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    // Base Styles
    toast.style.cssText = `
        background: white;
        color: #333;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 250px;
        max-width: 350px;
        transform: translateX(100%);
        transition: transform 0.3s ease, opacity 0.3s ease;
        border-left: 5px solid #ccc;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
    `;

    // Type specific styles
    if (type === 'success') toast.style.borderLeftColor = '#28a745';
    if (type === 'error') toast.style.borderLeftColor = '#dc3545';
    if (type === 'warning') toast.style.borderLeftColor = '#ffc107';
    if (type === 'info') toast.style.borderLeftColor = '#17a2b8';

    // Append to container
    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    // Close logic
    const close = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').onclick = close;
    toast.querySelector('.toast-close').style.cssText = `
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
        color: #999;
    `;

    // Auto remove
    setTimeout(close, duration);
}
