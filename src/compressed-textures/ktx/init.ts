import { extensions } from '../../extensions/Extensions';
import { detectCompressed } from '../shared/detectCompressed';
import { resolveCompressedTextureUrl } from '../shared/resolveCompressedTextureUrl';
import { loadKTX } from './loadKTX';

extensions.add(loadKTX);
extensions.add(resolveCompressedTextureUrl);
extensions.add(detectCompressed);

