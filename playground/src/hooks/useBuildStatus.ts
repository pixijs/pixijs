import { useEffect, useState } from 'preact/hooks';

export type BuildStatus = 'compiling' | 'ready' | 'error';

export function useBuildStatus(): BuildStatus
{
    const [status, setStatus] = useState<BuildStatus>('ready');

    useEffect(() =>
    {
        let lastStatus = '';

        const check = async () =>
        {
            try
            {
                const res = await fetch(`/.build-status.json?${Date.now()}`);

                if (res.ok)
                {
                    const data = await res.json();
                    const newStatus = data.status as string;

                    if (newStatus !== lastStatus)
                    {
                        const wasCompiling = lastStatus === 'compiling';

                        lastStatus = newStatus;

                        if (newStatus === 'compiling' || newStatus === 'ready' || newStatus === 'error')
                        {
                            setStatus(newStatus);
                        }

                        if (newStatus === 'ready' && wasCompiling)
                        {
                            setTimeout(() => window.location.reload(), 500);
                        }
                    }
                }
            }
            catch
            {
                if (lastStatus !== 'ready')
                {
                    lastStatus = 'ready';
                    setStatus('ready');
                }
            }
        };

        void check();
        const id = setInterval(check, 2000);

        return () => clearInterval(id);
    }, []);

    return status;
}
