/* eslint-disable max-len */
window.onload = () =>
{
    /*
     * To ensure that users notice the advanced settings, we will automatically open the accordion for the settings panel
     * if it has not been opened by the user yet.
     */

    // get local storage value
    const hasToggle = localStorage.getItem('tsd-accordion-settings');

    // if it does not exist, create it
    if (hasToggle === null)
    {
        localStorage.setItem('tsd-accordion-settings', 'true');
    }

    // set the data attribute for the accordion
    const panel = document.querySelector('.tsd-navigation.settings');
    const accordion = panel ? panel.querySelector('.tsd-accordion') : null;

    if (accordion)
    {
        accordion.open = localStorage.getItem('tsd-accordion-settings') === 'true';
    }

    initCopyPageDropdown();
    initStackBlitzEmbeds();
};

function initCopyPageDropdown()
{
    const toolbar = document.querySelector('.tsd-toolbar-contents');

    if (!toolbar) return;

    const dropdown = document.createElement('div');

    dropdown.className = 'copy-page-dropdown';
    dropdown.innerHTML = `
        <button class="copy-page-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
            </svg>
            <span>Copy page</span>
        </button>
        <button class="copy-page-toggle" aria-haspopup="true" aria-expanded="false">
            <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8.5L2 4.5h8L6 8.5z"/>
            </svg>
        </button>
        <div class="copy-page-menu" role="menu">
            <button class="copy-page-item" data-action="chatgpt" role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                </svg>
                <div class="copy-page-item-text">
                    <span class="copy-page-item-label">Open in ChatGPT</span>
                    <span class="copy-page-item-desc">Ask questions about this page</span>
                </div>
                <svg class="external-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                </svg>
            </button>
            <button class="copy-page-item" data-action="claude" role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.709 15.955l4.72-2.647.08-.08-.08-.14-2.727-4.16-.06-.06h-.1l-4.42 2.487c-.04.02-.06.06-.06.1s.02.08.06.1l2.487 4.36c.02.04.06.06.1.06zm6.327-1.867l4.78 2.667.08.04.08-.04 4.78-2.667c.04-.02.06-.06.06-.1v-5.38c0-.04-.02-.08-.06-.1l-4.78-2.667-.08-.04-.08.04-4.78 2.667a.116.116 0 0 0-.06.1v5.38c0 .04.02.08.06.1zm-2.92 5.08l4.66-2.62.08-.08v-.16l-2.7-4.14-.06-.06h-.16l-4.46 2.5-.08.08v.16l2.54 4.26c.02.04.06.08.1.08h.08zm7.767 0h.1c.04 0 .08-.02.1-.06l2.54-4.28v-.16l-.08-.08-4.46-2.5h-.16l-.06.06-2.7 4.16v.16l.08.08 4.64 2.6zm-3.873 3.88c.04.02.08.02.12 0l4.84-2.72c.04-.02.06-.06.06-.1l-.02-5.44-.04-.08-.08-.04-4.78 2.68-.08.08v5.52c0 .04.02.08.06.1h-.06zm-2.08-.14c.02.04.06.08.1.08h.08l4.86-2.72.08-.08-.04-5.52-.08-.08-4.78-2.68-.08.04-.04.08-.02 5.44c0 .04.02.08.06.1l-.14 5.34z"/>
                </svg>
                <div class="copy-page-item-text">
                    <span class="copy-page-item-label">Open in Claude</span>
                    <span class="copy-page-item-desc">Ask questions about this page</span>
                </div>
                <svg class="external-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                </svg>
            </button>
        </div>
    `;

    toolbar.appendChild(dropdown);

    const btn = dropdown.querySelector('.copy-page-btn');
    const toggle = dropdown.querySelector('.copy-page-toggle');
    const menu = dropdown.querySelector('.copy-page-menu');

    btn.addEventListener('click', async (e) =>
    {
        e.stopPropagation();

        const markdown = await fetchMarkdown();

        if (!markdown)
        {
            showToast('Failed to fetch markdown', true);

            return;
        }

        const success = await copyToClipboard(markdown);

        showToast(success ? 'Copied to clipboard' : 'Failed to copy');
    });

    toggle.addEventListener('click', (e) =>
    {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');

        toggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) =>
    {
        if (!dropdown.contains(e.target))
        {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) =>
    {
        if (e.key === 'Escape' && menu.classList.contains('open'))
        {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    dropdown.querySelectorAll('.copy-page-item').forEach((item) =>
    {
        item.addEventListener('click', () =>
        {
            const action = item.dataset.action;

            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');

            if (action === 'chatgpt')
            {
                openInLLM('chatgpt');
            }
            else if (action === 'claude')
            {
                openInLLM('claude');
            }
        });
    });
}

async function fetchMarkdown()
{
    const url = window.location.origin + window.location.pathname;

    let mdUrl;

    if (url.endsWith('/'))
    {
        mdUrl = `${url}index.md`;
    }
    else
    {
        mdUrl = `${url}.md`;
    }

    try
    {
        const response = await fetch(mdUrl);

        if (!response.ok)
        {
            console.warn(`Failed to fetch markdown: ${mdUrl} (${response.status})`);

            return null;
        }

        return await response.text();
    }
    catch (err)
    {
        console.warn(`Error fetching markdown: ${mdUrl}`, err);

        return null;
    }
}

async function copyToClipboard(text)
{
    // Try modern clipboard API first
    if (navigator.clipboard?.writeText)
    {
        try
        {
            await navigator.clipboard.writeText(text);

            return true;
        }
        catch (err)
        {
            console.warn('Clipboard API failed, trying fallback:', err);
        }
    }

    // Fallback for HTTP or older browsers
    try
    {
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        return true;
    }
    catch (err)
    {
        console.error('Fallback copy failed:', err);

        return false;
    }
}

function openInLLM(llm)
{
    const baseUrls = {
        chatgpt: 'https://chat.openai.com/?q=',
        claude: 'https://claude.ai/new?q='
    };

    let url = window.location.origin + window.location.pathname;

    if (url.endsWith('/'))
    {
        url = url.slice(0, -1);
    }

    const prompt = `Read from ${url}.md so I can ask questions about it.`;
    const fullUrl = baseUrls[llm] + encodeURIComponent(prompt);

    window.open(fullUrl, '_blank');
}

function showToast(message, isError = false)
{
    const existing = document.querySelector('.copy-page-toast');

    if (existing) existing.remove();

    const toast = document.createElement('div');

    toast.className = `copy-page-toast${isError ? ' error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() =>
    {
        toast.classList.add('show');
    });

    setTimeout(() =>
    {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    }, 2000);
}

function initStackBlitzEmbeds()
{
    document.querySelectorAll('.stackblitz-embed').forEach((container) =>
    {
        const tabs = container.querySelectorAll('.stackblitz-tab');
        const panels = container.querySelectorAll('.stackblitz-panel');

        tabs.forEach((tab) =>
        {
            tab.addEventListener('click', () =>
            {
                const file = tab.dataset.file;

                tabs.forEach((t) => t.classList.toggle('active', t === tab));
                panels.forEach((p) => p.classList.toggle('active', p.dataset.file === file));
            });
        });

        const openBtn = container.querySelector('.stackblitz-open-btn');

        if (!openBtn) return;

        openBtn.addEventListener('click', () =>
        {
            const jsonEl = container.querySelector('script[type="application/json"]');

            if (!jsonEl) return;

            const project = JSON.parse(jsonEl.textContent);
            const form = document.createElement('form');

            form.method = 'POST';
            form.action = `https://stackblitz.com/run?file=${encodeURIComponent(project.openFile || 'index.ts')}`;
            form.target = '_blank';
            form.style.display = 'none';

            addHiddenInput(form, 'project[template]', project.template);
            addHiddenInput(form, 'project[title]', project.title);

            for (const [filename, content] of Object.entries(project.files))
            {
                addHiddenInput(form, `project[files][${filename}]`, content);
            }

            document.body.appendChild(form);
            form.submit();
            form.remove();
        });
    });
}

function addHiddenInput(form, name, value)
{
    const input = document.createElement('input');

    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
}

