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

/* Distortion/Warp - wavewarp */
Seriously.plugin('Distortion/Warp - wavewarp', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amplitude;',
'uniform float frequency;',
'uniform float phase;',
'void main() {',
'vec2 uv = vTexCoord;',
'uv.y += sin((uv.x + phase) * frequency) * amplitude;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
amplitude: { type: 'number', min: 0, max: 0.5, defaultValue: 0.05 },
frequency: { type: 'number', min: 0, max: 50, defaultValue: 10 },
phase: { type: 'number', min: 0, max: 10, defaultValue: 0 }
}
});

/* Distortion/Warp - kaleidoscope */
Seriously.plugin('Distortion/Warp - kaleidoscope', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float sides;',
'uniform float angle;',
'void main(){',
'vec2 p = vTexCoord - 0.5;',
'float r = length(p);',
'float a = atan(p.y, p.x) + angle;',
'float tau = 6.283185;',
'a = mod(a, tau / sides);',
'a = abs(a - tau / sides / 2.0);',
'vec2 uv = r * vec2(cos(a), sin(a)) + 0.5;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
sides: { type: 'number', min: 1, max: 32, defaultValue: 6 },
angle: { type: 'number', min: 0, max: 6.28, defaultValue: 0 }
}
});

/* Distortion/Warp - mirror */
Seriously.plugin('Distortion/Warp - mirror', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float horizontal;',
'uniform float vertical;',
'void main(){',
'vec2 uv = vTexCoord;',
'if(horizontal > 0.5 && uv.x > 0.5) uv.x = 1.0 - uv.x;',
'if(vertical > 0.5 && uv.y > 0.5) uv.y = 1.0 - uv.y;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
horizontal: { type: 'number', min: 0, max: 1, defaultValue: 1 },
vertical: { type: 'number', min: 0, max: 1, defaultValue: 0 }
}
});

/* Distortion/Warp - swirl */
Seriously.plugin('Distortion/Warp - swirl', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float strength;',
'uniform float radius;',
'void main(){',
'vec2 p = vTexCoord - 0.5;',
'float r = length(p);',
'float a = atan(p.y, p.x);',
'float t = smoothstep(radius, 0.0, r) * strength;',
'a += t;',
'vec2 uv = vec2(cos(a), sin(a)) * r + 0.5;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: -10, max: 10, defaultValue: 2 },
radius: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
}
});

/* Distortion/Warp - pinch/bulge */
Seriously.plugin('Distortion/Warp - pinchbulge', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float strength;',
'void main(){',
'vec2 p = vTexCoord - 0.5;',
'float r = length(p);',
'float factor = pow(r, strength);',
'vec2 uv = p * factor + 0.5;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: -2, max: 2, defaultValue: 0.5 }
}
});

/* Distortion/Warp - tile */
Seriously.plugin('Distortion/Warp - tile', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float scale;',
'void main(){',
'vec2 uv = fract(vTexCoord * scale);',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
scale: { type: 'number', min: 1, max: 50, defaultValue: 5 }
}
});

/* Distortion/Warp - tileshift */
Seriously.plugin('Distortion/Warp - tileshift', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float shift;',
'uniform float scale;',
'void main(){',
'vec2 uv = vTexCoord * scale;',
'uv.x += floor(uv.y) * shift;',
'uv = fract(uv);',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
shift: { type: 'number', min: -1, max: 1, defaultValue: 0.5 },
scale: { type: 'number', min: 1, max: 50, defaultValue: 10 }
}
});

/* Distortion/Warp - squeeze */
Seriously.plugin('Distortion/Warp - squeeze', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amount;',
'void main(){',
'vec2 uv = vTexCoord;',
'uv.x = (uv.x - 0.5) * amount + 0.5;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
amount: { type: 'number', min: 0.1, max: 5, defaultValue: 1 }
}
});

/* Distortion/Warp - split */
Seriously.plugin('Distortion/Warp - split', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float offset;',
'void main(){',
'vec2 uv = vTexCoord;',
'if(uv.x > 0.5) uv.x += offset;',
'else uv.x -= offset;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
offset: { type: 'number', min: -0.5, max: 0.5, defaultValue: 0.05 }
}
});

/* Distortion/Warp - bend */
Seriously.plugin('Distortion/Warp - bend', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float strength;',
'void main(){',
'vec2 uv = vTexCoord;',
'uv.y += sin(uv.x * 3.1415) * strength;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: -1, max: 1, defaultValue: 0.2 }
}
});

/* Distortion/Warp - curl */
Seriously.plugin('Distortion/Warp - curl', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float radius;',
'uniform float angle;',
'void main(){',
'vec2 p = vTexCoord - 0.5;',
'float r = length(p);',
'if(r < radius){',
'float a = atan(p.y, p.x) + angle * (radius - r);',
'p = vec2(cos(a), sin(a)) * r;',
'}',
'gl_FragColor = texture2D(source, p + 0.5);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
radius: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
angle: { type: 'number', min: -5, max: 5, defaultValue: 1 }
}
});

/* Distortion/Warp - pixelate */
Seriously.plugin('Distortion/Warp - pixelate', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float size;',
'void main(){',
'vec2 uv = floor(vTexCoord * size) / size;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
size: { type: 'number', min: 1, max: 512, defaultValue: 64 }
}
});

/* Distortion/Warp - turbulentdisplace */
Seriously.plugin('Distortion/Warp - turbulentdisplace', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amount;',
'float rand(vec2 co){',
'return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
'}',
'void main(){',
'vec2 uv = vTexCoord;',
'uv += (rand(uv) - 0.5) * amount;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inputs: {
source: { type: 'image' },
amount: { type: 'number', min: 0, max: 0.2, defaultValue: 0.02 }
}
});

}));
