import Application from './Application';
import TickerPlugin from './plugins/TickerPlugin';
import ResizePlugin from './plugins/ResizePlugin';
import InteractionPlugin from './plugins/InteractionPlugin';

Application.registerPlugin(TickerPlugin);
Application.registerPlugin(ResizePlugin);
Application.registerPlugin(InteractionPlugin);

export { Application };
