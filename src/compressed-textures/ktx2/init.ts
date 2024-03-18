import { extensions } from '../../extensions/Extensions';
import { detectCompressed } from '../shared/detectCompressed';
import { resolveCompressedTextureUrl } from '../shared/resolveCompressedTextureUrl';
import { loadKTX2 } from './loadKTX2';

extensions.add(loadKTX2);
extensions.add(resolveCompressedTextureUrl);
extensions.add(detectCompressed);

