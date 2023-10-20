import { extensions } from '../../extensions/Extensions';
import { detectBasis } from './detectBasis';
import { loadBasis } from './loadBasis';

extensions.add(loadBasis, detectBasis);

