require('global-jsdom/register');

globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
