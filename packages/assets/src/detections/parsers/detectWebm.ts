import { extensions, ExtensionType } from '@pixi/core';
import { testVideoFormat } from '../utils/testVideoFormat';

import type { FormatDetectionParser } from '..';

export const detectWebm = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> =>
    {
        // eslint-disable-next-line max-len
        const webmData = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAG9EU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggGn7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBAbqBAZqBAlWwiFWxgQBVuYECElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dbHngQCjrIEAAICiSYNC4AAAAAYAOCQcGEoAACAgABG///+mlH/////TSj/////ppQAAHFO7a5G7j7OBALeK94EB8YIBcfCBAw==';

        return testVideoFormat(webmData);
    },
    add: async (formats) => [...formats, 'webm'],
    remove: async (formats) => formats.filter((f) => f !== 'webm'),
} as FormatDetectionParser;

extensions.add(detectWebm);
