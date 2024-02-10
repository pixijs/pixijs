export function disableUnsafeEval()
{
    const meta = document.createElement('meta');

    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = 'script-src \'self\'';
    document.head.appendChild(meta);
}
