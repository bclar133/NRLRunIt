const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path'),{performance}=require('perf_hooks');
const project=path.resolve(__dirname,'..'),assets=fs.existsSync(path.join(project,'dist','game.js'))?path.join(project,'dist'):project;
const els={},events={},buffers=new Map();let bound=null,draws=0,instanceDraws=0,lastUpload=0;let coarse=false;
const gl=new Proxy({
 createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({}),createTexture:()=>({}),
 getShaderParameter:()=>true,getProgramParameter:()=>true,
 getUniformLocation:(_,n)=>n,getAttribLocation:(_,n)=>({p:0,n:1,c:2,pos:0,instancePose:3,instanceColor:4}[n]),
 bindBuffer:(_,b)=>{bound=b;},bufferData:(_,d)=>{assert(d instanceof Float32Array);assert(d.length>0);buffers.set(bound,d);lastUpload=d.length;},
 drawArrays:(_,start,count)=>{assert(Number.isInteger(count));assert(count>=0);draws++;},
 getExtension:()=>process.env.NO_INSTANCING?null:({vertexAttribDivisorANGLE(){},drawArraysInstancedANGLE(type,first,count,instances){assert(instances>1000);assert(count>100);instanceDraws++;}})
},{get:(o,k)=>k in o?o[k]:(()=>{})});
function el(id){return els[id]??={style:{},hidden:false,value:'auto',setAttribute(k,v){this[k]=v},addEventListener(k,f){this[k]=f},replaceWith(image){els['player-photo']=image},removeAttribute(){},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:138,height:138}}};}
els.pitch={getContext:()=>gl};
const ctx={console,Float32Array,Uint8Array,Math,Set,Map,Object,Array,Number,performance,assert,Image:class{constructor(){this.style={};}decode(){return Promise.resolve(this)}replaceWith(image){els['player-photo']=image;}},
 document:{getElementById:el,createElement:()=>({getContext:()=>({drawImage(){},fillText(){}})}),documentElement:{},addEventListener:(k,f)=>events[k]=f},
 window:{devicePixelRatio:1,screen:{},matchMedia:()=>({matches:coarse}),addEventListener:(k,f)=>events[k]=f},requestAnimationFrame:()=>{},innerWidth:1280,innerHeight:800,AudioContext:class{}};
vm.createContext(ctx);const source=fs.readFileSync(path.join(assets,'graphics.js'),'utf8').replaceAll('export const','const').replaceAll('export function','function')+'\n'+fs.readFileSync(path.join(assets,'game.js'),'utf8').replace(/^import .*?;\n/,'');
const start=performance.now();vm.runInContext(source,ctx);console.log('Scene initialization ms:',Math.round(performance.now()-start));
vm.runInContext(`
assert(crowdInstances.length/7>7000);console.log("GPU geometry MB",(staticData.byteLength+crowdData.byteLength+crowdInstances.length*4)/1048576);assert(staticData.length<6000000);assert(crowdData.length<10000);
assert(staticData.every(Number.isFinite));assert(crowdData.every(Number.isFinite));
for(const preset of weatherPresets){weatherChoice=preset.id;frame(100);assert.equal($('weather-label').textContent,preset.label);assert(verts.array().every(Number.isFinite));}
for(let second=0;second<420;second+=.5){const w=sampleWeather(second);for(const key of ['ambient','power','cloud','storm','night','fog'])assert(Number.isFinite(w[key])&&w[key]>=0);assert(w.cloud<=1);}
for(let boundary=40;boundary<=200;boundary+=40){const a=sampleWeather(boundary-.0001),b=sampleWeather(boundary);assert(Math.abs(a.ambient-b.ambient)<1e-5);assert(Math.abs(a.horizon[0]-b.horizon[0])<1e-5);}
weatherChoice='clear';tries=0;setupRun();defenders=[];keys.add('w');tick(.04);assert(player.z>0);keys.clear();keys.add('a');tick(.04);assert(player.x>0);keys.clear();
const burstCount=burstsLeft;performSkill('shift');assert.equal(burstsLeft,burstCount-1);performSkill('shift');assert.equal(burstsLeft,burstCount-1);
for(let i=0;i<10;i++){tries=i;setupRun();assert.equal(defenders.length,teams[i].count);if(i===9){assert.equal(defenders.filter(d=>!d.fullback).length,12);assert(defenders.filter(d=>!d.fullback).every(d=>d.z===43));}}
for(let i=0;i<4;i++){selectAttacker(i);tries=0;setupRun();defenders=[];frame(200+i*16);assert(verts.array().every(Number.isFinite));}
faceAtlasReady=true;frame(300);assert(verts.array().some((v,i)=>i%9===6&&v<0));
setupRun();const d=defenders[0];d.x=.8;d.z=0;beginTackle(d);tick(.7);assert(player.fall>0);frame(350);assert(verts.array().every(Number.isFinite));tick(1);assert.equal(mode,'over');assert.equal(tries,0);
setupRun();defenders=[];player.z=100.1;performSkill('q');assert.equal(mode,'scored');assert.equal(tries,1);tries=9;score();assert.equal(mode,'won');
tries=0;setupRun();defenders=[];player.x=34.1;tick(.01);assert.equal(mode,'over');
`,ctx);
coarse=true;vm.runInContext(`tries=0;setupRun();defenders=[];$('thumbstick').pointerdown({pointerId:1,clientX:25,clientY:25,preventDefault(){}});tick(.04);assert(player.x>0&&player.z>0);const before=burstsLeft;$('touch-burst').pointerdown({pointerId:2,preventDefault(){}});assert.equal(burstsLeft,before-1);assert.equal(touchInput.pointer,1);innerWidth=390;innerHeight=844;orientationChanged();assert.equal(mode,'paused');assert(!$('rotate-screen').hidden);innerWidth=844;innerHeight=390;orientationChanged();pause();assert.equal(mode,'play');frame(400);`,ctx);
console.log('PASS: geometry, all skies and smooth weather transitions, four player render paths, shadows, instanced crowd, rain pass, input, burst limits, team formations, tackles, scoring, and mobile orientation.');
console.log({draws,instanceDraws,lastUpload});

coarse=false;vm.runInContext(`
innerWidth=1280;innerHeight=800;detailChoice='high';tries=9;setupRun();const start=performance.now();for(let i=0;i<10;i++)frame(1000+i*16);console.log('CPU frame generation, 13 defenders (ms):',((performance.now()-start)/10).toFixed(1));
`,ctx);
