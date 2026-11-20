import { extensions } from '../../extensions/Extensions';
import { detectCompressed } from '../shared/detectCompressed';
import { resolveCompressedTextureUrl } from '../shared/resolveCompressedTextureUrl';
import { loadASTC } from './loadASTC';

extensions.add(loadASTC, detectCompressed, resolveCompressedTextureUrl);
