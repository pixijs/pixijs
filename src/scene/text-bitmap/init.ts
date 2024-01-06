import { extensions } from '../../extensions/Extensions';
import { bitmapFontCachePlugin, loadBitmapFont } from './asset/loadBitmapFont';
import { BitmapTextPipe } from './BitmapTextPipe';

extensions.add(BitmapTextPipe, loadBitmapFont, bitmapFontCachePlugin);
