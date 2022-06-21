import { extensions } from '@pixi/core';
import { BasisLoader } from './BasisLoader';

export * from './Basis';
export * from './BasisLoader';

extensions.add(BasisLoader);
