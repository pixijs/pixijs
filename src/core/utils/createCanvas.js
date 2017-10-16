export default function createCanvas(width = 300, height = 150)
{
  let canvas;
  if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
  } else {
    try {
      const { Canvas } = require('canvas');
      canvas = new Canvas(width, height);
    } catch (e) {
      console.log(e)
    }
  }
  return canvas;
}
