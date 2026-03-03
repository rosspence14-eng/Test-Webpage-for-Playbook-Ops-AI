function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function linkify(text) {
    const withUrls = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return withUrls.replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '<a href="mailto:$1">$1</a>');
}

function renderLegalMarkdown(rawText) {
    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let inList = false;
    let titleRendered = false;

    const closeListIfOpen = () => {
        if (inList) {
            html.push('</ul>');
            inList = false;
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            closeListIfOpen();
            continue;
        }

        if (!titleRendered) {
            html.push(`<h2>${escapeHtml(trimmed)}</h2>`);
            titleRendered = true;
            continue;
        }

        if (trimmed.startsWith('- ')) {
            if (!inList) {
                html.push('<ul class="legal-list">');
                inList = true;
            }
            html.push(`<li>${linkify(escapeHtml(trimmed.slice(2)))}</li>`);
            continue;
        }

        closeListIfOpen();

        if (/^Last Updated:/i.test(trimmed)) {
            html.push(`<p class="legal-updated"><strong>${escapeHtml(trimmed)}</strong></p>`);
        } else if (/^\d+\.\s+/.test(trimmed)) {
            html.push(`<h3>${escapeHtml(trimmed)}</h3>`);
        } else if (/^[a-z]\.\s+/i.test(trimmed)) {
            html.push(`<h4>${escapeHtml(trimmed)}</h4>`);
        } else {
            html.push(`<p>${linkify(escapeHtml(trimmed))}</p>`);
        }
    }

    closeListIfOpen();
    return html.join('\n');
}

async function loadLegalDocument() {
    const mount = document.getElementById('legal-content');
    if (!mount) return;

    const sourcePath = mount.dataset.legalSource;
    if (!sourcePath) {
        mount.innerHTML = '<p>No legal source configured.</p>';
        return;
    }

    try {
        const response = await fetch(sourcePath);
        if (!response.ok) {
            throw new Error(`Failed to load legal document: ${response.status}`);
        }

        const rawText = await response.text();
        mount.innerHTML = renderLegalMarkdown(rawText);
    } catch (error) {
        // silently handle errors rather than logging to console
        mount.innerHTML = '<p>Unable to load this document right now. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadLegalDocument);
