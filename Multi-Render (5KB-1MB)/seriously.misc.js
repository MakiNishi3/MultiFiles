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

function shader(vs, fs, inputs) {
return {
shader: function (inputs, shaderSource) {
shaderSource.vertex = vs;
shaderSource.fragment = fs;
},
inPlace: true,
inputs: inputs
};
}

Seriously.plugin('rgbSplit', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform float amount;varying vec2 vTex;void main(){float r=texture2D(source,vTex+vec2(amount,0.0)).r;float g=texture2D(source,vTex).g;float b=texture2D(source,vTex-vec2(amount,0.0)).b;gl_FragColor=vec4(r,g,b,1.0);}',
{amount:{type:'number',defaultValue:0.005,min:0,max:0.05}}
));

Seriously.plugin('chromaticAberration', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform float offset;varying vec2 vTex;void main(){vec2 o=vec2(offset);float r=texture2D(source,vTex+o).r;float g=texture2D(source,vTex).g;float b=texture2D(source,vTex-o).b;gl_FragColor=vec4(r,g,b,1.0);}',
{offset:{type:'number',defaultValue:0.003,min:0,max:0.02}}
));

Seriously.plugin('vignette', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform float amount;varying vec2 vTex;void main(){vec2 pos=vTex-0.5;float len=length(pos);float vig=smoothstep(0.8,amount,len);vec4 col=texture2D(source,vTex);gl_FragColor=vec4(col.rgb*(1.0-vig),col.a);}',
{amount:{type:'number',defaultValue:1.2,min:0.5,max:2}}
));

Seriously.plugin('edgeDetect', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform vec2 resolution;varying vec2 vTex;void main(){vec2 t=1.0/resolution;float gx=0.0;float gy=0.0;float tl=texture2D(source,vTex+t*vec2(-1.0,1.0)).r;float tc=texture2D(source,vTex+t*vec2(0.0,1.0)).r;float tr=texture2D(source,vTex+t*vec2(1.0,1.0)).r;float ml=texture2D(source,vTex+t*vec2(-1.0,0.0)).r;float mr=texture2D(source,vTex+t*vec2(1.0,0.0)).r;float bl=texture2D(source,vTex+t*vec2(-1.0,-1.0)).r;float bc=texture2D(source,vTex+t*vec2(0.0,-1.0)).r;float br=texture2D(source,vTex+t*vec2(1.0,-1.0)).r;gx=-tl-2.0*ml-bl+tr+2.0*mr+br;gy=-bl-2.0*bc-br+tl+2.0*tc+tr;float g=sqrt(gx*gx+gy*gy);gl_FragColor=vec4(vec3(g),1.0);}',
{resolution:{type:'vector',dimensions:2}}
));

Seriously.plugin('sharpen', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform vec2 resolution;uniform float amount;varying vec2 vTex;void main(){vec2 t=1.0/resolution;vec4 col=texture2D(source,vTex)* (1.0+4.0*amount);col-=texture2D(source,vTex+t*vec2(1.0,0.0))*amount;col-=texture2D(source,vTex+t*vec2(-1.0,0.0))*amount;col-=texture2D(source,vTex+t*vec2(0.0,1.0))*amount;col-=texture2D(source,vTex+t*vec2(0.0,-1.0))*amount;gl_FragColor=col;}',
{amount:{type:'number',defaultValue:0.3,min:0,max:2},resolution:{type:'vector',dimensions:2}}
));

Seriously.plugin('kaleidoscope', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform float sides;varying vec2 vTex;void main(){vec2 p=vTex-0.5;float r=length(p);float a=atan(p.y,p.x);float tau=6.2831853;a=mod(a,tau/sides);a=abs(a-tau/(2.0*sides));vec2 uv=r*vec2(cos(a),sin(a))+0.5;gl_FragColor=texture2D(source,uv);}',
{sides:{type:'number',defaultValue:6,min:2,max:20}}
));

Seriously.plugin('motionBlur', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform vec2 direction;varying vec2 vTex;void main(){vec4 sum=vec4(0.0);for(int i=-8;i<=8;i++){sum+=texture2D(source,vTex+direction*float(i)/8.0);}gl_FragColor=sum/17.0;}',
{direction:{type:'vector',dimensions:2,defaultValue:[0.01,0]}}
));

Seriously.plugin('checkerboard', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;varying vec2 vTex;uniform float scale;void main(){vec2 p=floor(vTex*scale);float c=mod(p.x+p.y,2.0);gl_FragColor=vec4(vec3(c),1.0);}',
{scale:{type:'number',defaultValue:10,min:2,max:100}}
));

Seriously.plugin('ramp', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;varying vec2 vTex;uniform vec3 color1;uniform vec3 color2;void main(){gl_FragColor=vec4(mix(color1,color2,vTex.y),1.0);}',
{color1:{type:'color',defaultValue:[0,0,0,1]},color2:{type:'color',defaultValue:[1,1,1,1]}}
));

Seriously.plugin('transform2d', {
shader: function (inputs, shaderSource) {
shaderSource.vertex = 'precision mediump float;attribute vec3 position;attribute vec2 texCoord;uniform mat3 matrix;varying vec2 vTex;void main(){vec3 p=matrix*vec3(texCoord,1.0);vTex=p.xy;gl_Position=vec4(position,1.0);}';
shaderSource.fragment = 'precision mediump float;uniform sampler2D source;varying vec2 vTex;void main(){gl_FragColor=texture2D(source,vTex);}';
},
inputs:{
matrix:{type:'matrix',dimensions:3}
}
});

Seriously.plugin('channelBlend', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D sourceA;uniform sampler2D sourceB;varying vec2 vTex;void main(){vec4 a=texture2D(sourceA,vTex);vec4 b=texture2D(sourceB,vTex);gl_FragColor=vec4(a.r,b.g,a.b,1.0);}',
{}
));

Seriously.plugin('timeSlice', shader(
'precision mediump float;attribute vec3 position;attribute vec2 texCoord;varying vec2 vTex;void main(){vTex=texCoord;gl_Position=vec4(position,1.0);}',
'precision mediump float;uniform sampler2D source;uniform float time;varying vec2 vTex;void main(){float slice=step(fract(vTex.y*10.0),time);gl_FragColor=texture2D(source,vec2(vTex.x, vTex.y*slice));}',
{time:{type:'number',defaultValue:0.5,min:0,max:1}}
));

}));
