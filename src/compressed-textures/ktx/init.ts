import { detectCompressed } from '../../assets/detections/parsers/detectCompressed';
import { extensions } from '../../extensions/Extensions';
import { loadKTX } from './loadKTX';
import { resolveCompressedKTXTextureUrl } from './resolveKTXTextureUrl';

extensions.add(loadKTX);
extensions.add(resolveCompressedKTXTextureUrl);
extensions.add(detectCompressed);

