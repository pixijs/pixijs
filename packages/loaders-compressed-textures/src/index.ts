import { CompressedTextureLoader } from './CompressedTextureLoader';
import { DDSLoader } from './DDSLoader';
import { KTXLoader } from './KTXLoader';
import { Loader } from '@pixi/loaders';

// parse any *.json compressed-textures manifest
Loader.registerPlugin(CompressedTextureLoader);

// parse any DDS container files into textures
Loader.registerPlugin(DDSLoader);

// parse any KTX container files into textures
Loader.registerPlugin(KTXLoader);

export {
    CompressedTextureLoader,
    DDSLoader,
    KTXLoader
};
