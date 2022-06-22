export * from './AppLoaderPlugin';
export * from './LoaderResource';
export * from './Loader';
export * from './TextureLoader';

import { ParsingLoader } from './ParsingLoader';
import { TextureLoader } from './TextureLoader';
import { extensions } from '@pixi/core';

extensions.add(
    TextureLoader,
    ParsingLoader
);
