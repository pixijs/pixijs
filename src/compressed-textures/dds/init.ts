import { extensions } from '../../extensions/Extensions';
import { detectCompressed } from '../shared/detectCompressed';
import { resolveCompressedTextureUrl } from '../shared/resolveCompressedTextureUrl';
import { loadDDS } from './loadDDS';

extensions.add(loadDDS, detectCompressed, resolveCompressedTextureUrl);
