const { Renderer, Container } = require('@pixi/node');

const stage = new Container();
const renderer = new Renderer();
renderer.render(stage);