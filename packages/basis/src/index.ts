import { Loader } from '@pixi/loaders';
import { BasisLoader } from './BasisLoader';

export * from './Basis';
export * from './BasisLoader';

// parse any BASIS supercompressed files into textures
Loader.registerPlugin(BasisLoader);
