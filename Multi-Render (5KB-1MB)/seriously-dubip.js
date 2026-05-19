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

function simpleShader(fragment) {
return {
shader: function (inputs, shaderSource) {
shaderSource.fragment = fragment;
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' }
}
};
}

Seriously.plugin('invert', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(1.0-c.rgb,c.a); }'
));

Seriously.plugin('grayscale', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); float g=dot(c.rgb,vec3(0.299,0.587,0.114)); gl_FragColor=vec4(vec3(g),c.a); }'
));

Seriously.plugin('sepia', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); vec3 r=vec3(dot(c.rgb,vec3(0.393,0.769,0.189)),dot(c.rgb,vec3(0.349,0.686,0.168)),dot(c.rgb,vec3(0.272,0.534,0.131))); gl_FragColor=vec4(r,c.a); }'
));

Seriously.plugin('brightness', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float amount; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(c.rgb+amount,c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
amount: { type: 'number', uniform: 'amount', defaultValue: 0.1 }
}
});

Seriously.plugin('contrast', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float amount; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4((c.rgb-0.5)*amount+0.5,c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
amount: { type: 'number', uniform: 'amount', defaultValue: 1.2 }
}
});

Seriously.plugin('threshold', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float level; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); float g=dot(c.rgb,vec3(0.299,0.587,0.114)); float t=step(level,g); gl_FragColor=vec4(vec3(t),1.0);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
level: { type: 'number', uniform: 'level', defaultValue: 0.5 }
}
});

Seriously.plugin('gamma', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float gamma; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(pow(c.rgb,vec3(gamma)),c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
gamma: { type: 'number', uniform: 'gamma', defaultValue: 1.0 }
}
});

Seriously.plugin('colorize', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform vec3 color; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(c.rgb*color,c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
color: { type: 'color', uniform: 'color', defaultValue: [1,1,1] }
}
});

Seriously.plugin('vignette', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ vec2 pos=vTexCoord-0.5; float len=length(pos); float vig=smoothstep(0.8,0.5,len); vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(c.rgb*vig,c.a);}';
return shaderSource;
},
inputs: { source: { type: 'image', uniform: 'source' } }
});

Seriously.plugin('posterize', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float steps; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(floor(c.rgb*steps)/steps,c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
steps: { type: 'number', uniform: 'steps', defaultValue: 4 }
}
});

Seriously.plugin('pixelate', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float size; varying vec2 vTexCoord; void main(){ vec2 uv=floor(vTexCoord*size)/size; gl_FragColor=texture2D(source,uv);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
size: { type: 'number', uniform: 'size', defaultValue: 64 }
}
});

Seriously.plugin('edge', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ float dx=1.0/512.0; float dy=1.0/512.0; vec4 c=texture2D(source,vTexCoord); vec4 cx=texture2D(source,vTexCoord+vec2(dx,0.0)); vec4 cy=texture2D(source,vTexCoord+vec2(0.0,dy)); float diff=length(c.rgb-cx.rgb)+length(c.rgb-cy.rgb); gl_FragColor=vec4(vec3(diff),1.0);}'));

Seriously.plugin('emboss', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ float dx=1.0/512.0; float dy=1.0/512.0; vec3 c=texture2D(source,vTexCoord).rgb; vec3 c2=texture2D(source,vTexCoord+vec2(dx,dy)).rgb; float diff=dot(c-c2,vec3(0.333)); gl_FragColor=vec4(vec3(diff+0.5),1.0);}'));

Seriously.plugin('blur', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ vec4 sum=vec4(0.0); float dx=1.0/512.0; float dy=1.0/512.0; for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){sum+=texture2D(source,vTexCoord+vec2(float(x)*dx,float(y)*dy));}} gl_FragColor=sum/25.0;}';
return shaderSource;
},
inputs: { source: { type: 'image', uniform: 'source' } }
});

Seriously.plugin('sharpen', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ float dx=1.0/512.0; float dy=1.0/512.0; vec4 c=texture2D(source,vTexCoord)*5.0; c-=texture2D(source,vTexCoord+vec2(dx,0.0)); c-=texture2D(source,vTexCoord-vec2(dx,0.0)); c-=texture2D(source,vTexCoord+vec2(0.0,dy)); c-=texture2D(source,vTexCoord-vec2(0.0,dy)); gl_FragColor=c;}'));

Seriously.plugin('rgbShift', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float amount; varying vec2 vTexCoord; void main(){ float dx=amount/512.0; vec4 r=texture2D(source,vTexCoord+vec2(dx,0.0)); vec4 g=texture2D(source,vTexCoord); vec4 b=texture2D(source,vTexCoord-vec2(dx,0.0)); gl_FragColor=vec4(r.r,g.g,b.b,1.0);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
amount: { type: 'number', uniform: 'amount', defaultValue: 5 }
}
});

Seriously.plugin('flipX', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ gl_FragColor=texture2D(source,vec2(1.0-vTexCoord.x,vTexCoord.y)); }'
));

Seriously.plugin('flipY', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ gl_FragColor=texture2D(source,vec2(vTexCoord.x,1.0-vTexCoord.y)); }'
));

Seriously.plugin('alpha', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float alpha; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(c.rgb,alpha);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
alpha: { type: 'number', uniform: 'alpha', defaultValue: 1.0 }
}
});

Seriously.plugin('tint', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform vec3 tint; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); gl_FragColor=vec4(mix(c.rgb,tint,0.5),c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
tint: { type: 'color', uniform: 'tint', defaultValue: [1,0,0] }
}
});

Seriously.plugin('solarize', simpleShader(
'precision mediump float; uniform sampler2D source; varying vec2 vTexCoord; void main(){ vec4 c=texture2D(source,vTexCoord); vec3 r=mix(c.rgb,1.0-c.rgb,step(0.5,c.rgb)); gl_FragColor=vec4(r,c.a);}'));

Seriously.plugin('noise', {
shader: function (inputs, shaderSource) {
shaderSource.fragment =
'precision mediump float; uniform sampler2D source; uniform float amount; varying vec2 vTexCoord; float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);} void main(){ vec4 c=texture2D(source,vTexCoord); float n=rand(vTexCoord)*amount; gl_FragColor=vec4(c.rgb+n,c.a);}';
return shaderSource;
},
inputs: {
source: { type: 'image', uniform: 'source' },
amount: { type: 'number', uniform: 'amount', defaultValue: 0.1 }
}
});

}));
