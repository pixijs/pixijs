import { Application } from '../../src/app/Application';
import '../../src/environment-browser/browserAll';

import type { ApplicationOptions } from '../../src/app/Application';

export async function getApp(options?: Partial<ApplicationOptions>)
{
    const app = new Application();

    await app.init(options);

    return app;
}
