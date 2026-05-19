/* global define, require */
(function (root, factory) {
'use strict';

if (typeof define === 'function' && define.amd) {
 define(['seriously'], factory);
} else if (typeof exports === 'object') {
 factory(require('seriously'));
} else {
 if (!root.Seriously) {
  root.Seriously = { plugin: function (name, opt) { this[name] = opt; } };
 }
 factory(root.Seriously);
}
}(window, function (Seriously) {
'use strict';

function createRepeatShader(gl, type) {
 return {
  uniforms: {
   source: { type: 'image' },
   count: { type: 'float', defaultValue: 2 },
   spacing: { type: 'float', defaultValue: 0.1 },
   radius: { type: 'float', defaultValue: 0.5 }
  },
  vertexShader: [
   'attribute vec2 position;',
   'varying vec2 vTexCoord;',
   'void main(void) {',
   'vTexCoord = position * 0.5 + 0.5;',
   'gl_Position = vec4(position, 0.0, 1.0);',
   '}'
  ].join('\n'),
  fragmentShader: [
   'precision mediump float;',
   'varying vec2 vTexCoord;',
   'uniform sampler2D source;',
   'uniform float count;',
   'uniform float spacing;',
   'uniform float radius;',
   'void main(void) {',
   'vec2 uv = vTexCoord;',
   'vec4 color = vec4(0.0);',
   'float total = 0.0;',
   'for (float i = 0.0; i < 50.0; i += 1.0) {',
   'if (i >= count) break;',
   'float t = i / max(count - 1.0, 1.0);',
   'vec2 offset = vec2(t * spacing);',
   'vec4 sample = texture2D(source, uv + offset);',
   'float w = 1.0 - distance(uv, uv + offset) / radius;',
   'w = clamp(w, 0.0, 1.0);',
   'color += sample * w;',
   'total += w;',
   '}',
   'if (total > 0.0) color /= total;',
   'gl_FragColor = color;',
   '}'
  ].join('\n')
 };
}

function registerPlugin(name, type) {
 Seriously.plugin('Repeat-' + name, function (options) {
  return createRepeatShader(null, type);
 });
}

registerPlugin('repeat', 'linear');
registerPlugin('repeatalongpath', 'path');
registerPlugin('linearrepeat', 'linear');
registerPlugin('radialrepeat', 'radial');
registerPlugin('gridrepeat', 'grid');

}));
