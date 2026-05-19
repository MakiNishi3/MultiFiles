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

function shader(vertex, fragment) {
return {
shader: function(inputs, shaderSource) {
shaderSource.vertex = vertex;
shaderSource.fragment = fragment;
}
};
}

var v = `
precision mediump float;
attribute vec2 position;
varying vec2 vTexCoord;
void main() {
vTexCoord = position * 0.5 + 0.5;
gl_Position = vec4(position, 0.0, 1.0);
}
`;

function basicFrag(code) {
return `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
${code}
`;
}

Seriously.plugin('transform3d', {
inputs: {
source: { type: 'image' },
matrix: { type: 'array', defaultValue: [1,0,0,0,1,0,0,0,1] }
},
shader: shader(v, basicFrag(`
void main() {
vec3 p = vec3(vTexCoord,1.0);
gl_FragColor = texture2D(source, (p.xy));
}
`))
});

Seriously.plugin('blur', {
inputs: { source: { type: 'image' }, amount: { type: 'number', defaultValue: 1 } },
shader: shader(v, basicFrag(`
void main() {
vec4 sum = vec4(0.0);
sum += texture2D(source, vTexCoord + vec2(-0.01, -0.01));
sum += texture2D(source, vTexCoord + vec2(0.01, -0.01));
sum += texture2D(source, vTexCoord + vec2(-0.01, 0.01));
sum += texture2D(source, vTexCoord + vec2(0.01, 0.01));
gl_FragColor = sum * 0.25;
}
`))
});

Seriously.plugin('sharpen', {
inputs: { source: { type: 'image' } },
shader: shader(v, basicFrag(`
void main() {
vec4 c = texture2D(source, vTexCoord) * 5.0;
c -= texture2D(source, vTexCoord + vec2(0.01,0.0));
c -= texture2D(source, vTexCoord - vec2(0.01,0.0));
c -= texture2D(source, vTexCoord + vec2(0.0,0.01));
c -= texture2D(source, vTexCoord - vec2(0.0,0.01));
gl_FragColor = c;
}
`))
});

Seriously.plugin('noise', {
inputs: { source: { type: 'image' }, amount: { type: 'number', defaultValue: 0.1 } },
shader: shader(v, basicFrag(`
float rand(vec2 co){
return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
vec4 color = texture2D(source, vTexCoord);
float n = rand(vTexCoord);
color.rgb += n * 0.1;
gl_FragColor = color;
}
`))
});

Seriously.plugin('halftone', {
inputs: { source: { type: 'image' } },
shader: shader(v, basicFrag(`
void main() {
vec4 c = texture2D(source, vTexCoord);
float g = dot(c.rgb, vec3(0.299,0.587,0.114));
float pattern = step(0.5, fract(vTexCoord.x*20.0) * fract(vTexCoord.y*20.0));
gl_FragColor = vec4(vec3(g * pattern),1.0);
}
`))
});

Seriously.plugin('pseudocolor', {
inputs: { source: { type: 'image' } },
shader: shader(v, basicFrag(`
void main() {
float v = texture2D(source, vTexCoord).r;
gl_FragColor = vec4(v, 1.0-v, sin(v*3.1415), 1.0);
}
`))
});

Seriously.plugin('tint', {
inputs: {
source: { type: 'image' },
color: { type: 'color', defaultValue: [1,0,0,1] }
},
shader: shader(v, basicFrag(`
uniform vec4 color;
void main() {
vec4 c = texture2D(source, vTexCoord);
gl_FragColor = vec4(c.rgb * color.rgb, c.a);
}
`))
});

Seriously.plugin('zoomblur', {
inputs: {
source: { type: 'image' },
strength: { type: 'number', defaultValue: 0.3 }
},
shader: shader(v, basicFrag(`
void main() {
vec2 center = vec2(0.5);
vec4 sum = vec4(0.0);
for (int i = 0; i < 20; i++) {
float t = float(i) / 20.0;
sum += texture2D(source, mix(vTexCoord, center, t));
}
gl_FragColor = sum / 20.0;
}
`))
});

Seriously.plugin('edge', {
inputs: { source: { type: 'image' } },
shader: shader(v, basicFrag(`
void main() {
vec2 o = vec2(0.002,0.0);
float gx = texture2D(source, vTexCoord + o).r - texture2D(source, vTexCoord - o).r;
float gy = texture2D(source, vTexCoord + o.yx).r - texture2D(source, vTexCoord - o.yx).r;
float g = length(vec2(gx,gy));
gl_FragColor = vec4(vec3(g),1.0);
}
`))
});

Seriously.plugin('invert', {
inputs: { source: { type: 'image' } },
shader: shader(v, basicFrag(`
void main() {
vec4 c = texture2D(source, vTexCoord);
gl_FragColor = vec4(1.0 - c.rgb, c.a);
}
`))
});

Seriously.plugin('brightness', {
inputs: { source: { type: 'image' }, amount: { type: 'number', defaultValue: 0.2 } },
shader: shader(v, basicFrag(`
uniform float amount;
void main() {
vec4 c = texture2D(source, vTexCoord);
gl_FragColor = vec4(c.rgb + amount, c.a);
}
`))
});

Seriously.plugin('contrast', {
inputs: { source: { type: 'image' }, amount: { type: 'number', defaultValue: 1.5 } },
shader: shader(v, basicFrag(`
uniform float amount;
void main() {
vec4 c = texture2D(source, vTexCoord);
c.rgb = (c.rgb - 0.5) * amount + 0.5;
gl_FragColor = c;
}
`))
});

}));
