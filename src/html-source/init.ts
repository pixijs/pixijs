import { extensions } from '../extensions/Extensions';
import { ElementImageSource } from './ElementImageSource';
import { glUploadHTMLResource } from './glUploadHTMLResource';
import { gpuUploadHTMLResource } from './gpuUploadHTMLResource';
import { HTMLSource } from './HTMLSource';

export * from './index';

extensions.add(
    HTMLSource,
    ElementImageSource,
    glUploadHTMLResource,
    gpuUploadHTMLResource,
);
