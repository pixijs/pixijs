// Build status indicator
const statusIndicator = document.createElement('div');

statusIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
`;
document.body.appendChild(statusIndicator);

const STATUS_CONFIG = {
    compiling: { bg: '#fef3c7', color: '#92400e', icon: '&#x21bb;', text: 'Compiling PixiJS...', spin: true },
    ready: { bg: '#d1fae5', color: '#065f46', icon: '&#x2714;', text: 'PixiJS Ready', spin: false },
    error: { bg: '#fee2e2', color: '#991b1b', icon: '&#x26A0;', text: 'Build Error', spin: false },
};

function updateStatusIndicator(status: 'compiling' | 'ready' | 'error')
{
    const config = STATUS_CONFIG[status];

    statusIndicator.style.background = config.bg;
    statusIndicator.style.color = config.color;
    const spinStyle = config.spin ? 'display: inline-block; animation: spin 1s linear infinite;' : '';

    statusIndicator.innerHTML = `<span style="${spinStyle}">${config.icon}</span> ${config.text}`;
}

// Add spin animation
const style = document.createElement('style');

style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Poll build status
let lastStatus = '';

async function checkBuildStatus()
{
    try
    {
        const response = await fetch(`/.build-status.json?${Date.now()}`);

        if (response.ok)
        {
            const data = await response.json();
            const newStatus = data.status;

            if (newStatus !== lastStatus)
            {
                const wasCompiling = lastStatus === 'compiling';

                lastStatus = newStatus;
                updateStatusIndicator(newStatus);

                // If just finished compiling, reload to pick up changes
                if (newStatus === 'ready' && wasCompiling)
                {
                    setTimeout(() => window.location.reload(), 500);
                }
            }
        }
    }
    catch
    {
        // Status file not available yet, show ready state
        if (lastStatus !== 'ready')
        {
            lastStatus = 'ready';
            updateStatusIndicator('ready');
        }
    }
}

// Check immediately and then poll every second
void checkBuildStatus();
setInterval(checkBuildStatus, 1000);

// Use Vite's glob import to find all playground files
const playgrounds = import.meta.glob('./*.playground.ts');

// Build dropdown from discovered files
const select = document.createElement('select');

select.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 1000; padding: 5px;';

for (const path of Object.keys(playgrounds))
{
    const name = path.replace('./', '').replace('.playground.ts', '');
    const option = document.createElement('option');

    option.value = path;
    option.textContent = name;
    select.appendChild(option);
}
document.body.appendChild(select);

// Load selected playground
async function loadPlayground(path: string)
{
    await playgrounds[path]();
}

// Get selected playground from URL or default
const DEFAULT_PLAYGROUND = './default.playground.ts';
const params = new URLSearchParams(window.location.search);
const selected = params.get('playground') || DEFAULT_PLAYGROUND;
const toLoad = playgrounds[selected] ? selected : DEFAULT_PLAYGROUND;

if (playgrounds[toLoad])
{
    select.value = toLoad;
    void loadPlayground(toLoad);
}

// Handle selection change - update URL then reload
select.onchange = () =>
{
    params.set('playground', select.value);
    window.location.search = params.toString();
};
