const $=id=>document.getElementById(id),canvas=$('pitch'),gl=canvas.getContext('webgl',{antialias:true});
if(!gl){$('unsupported').hidden=false;throw Error('WebGL unavailable');}
const vs=`attribute vec3 p,n,c;uniform mat4 vp;varying vec3 color;varying float depth;void main(){gl_Position=vp*vec4(p,1.);float light=.5+.5*max(0.,dot(normalize(n),normalize(vec3(-.4,1.,.3))));color=c*light;depth=gl_Position.w;}`;
const fs=`precision mediump float;varying vec3 color;varying float depth;void main(){gl_FragColor=vec4(mix(color,vec3(.38,.55,.61),clamp((depth-65.)/260.,0.,.65)),1.);}`;
function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);gl.enable(gl.DEPTH_TEST);const attrs=['p','n','c'].map(s=>gl.getAttribLocation(program,s)),vp=gl.getUniformLocation(program,'vp');
const col=h=>[parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255],white=col('ecede4'),skin=col('c78f70'),maroon=col('651c38'),gold=col('edb454'),black=col('1b2329');
const norm=a=>{let l=Math.hypot(...a)||1;return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
function mult(a,b){let o=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function view(eye,target){let z=norm(eye.map((x,i)=>x-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]}
let verts=[];function vertex(p,n,c){verts.push(...p,...n,...c)}
function box(x,y,z,w,h,d,c){let q=[[x-w/2,y-h/2,z-d/2],[x+w/2,y-h/2,z-d/2],[x+w/2,y+h/2,z-d/2],[x-w/2,y+h/2,z-d/2],[x-w/2,y-h/2,z+d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]];for(let [ids,n] of [[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,2,6,5],[1,0,0]],[[3,7,6,2],[0,1,0]],[[0,1,5,4],[0,-1,0]]])for(let i of [0,1,2,0,2,3])vertex(q[ids[i]],n,c)}
const sphere=[];for(let a=0;a<8;a++)for(let b=0;b<10;b++){let point=(i,j)=>{let u=i*Math.PI/8,v=j*Math.PI/5;return[Math.sin(u)*Math.cos(v),Math.cos(u),Math.sin(u)*Math.sin(v)]};let q=[point(a,b),point(a+1,b),point(a+1,b+1),point(a,b+1)];for(let i of [0,1,2,0,2,3])sphere.push(q[i])}
function ell(x,y,z,sx,sy,sz,c,basis){for(let v of sphere){let p=[v[0]*sx,v[1]*sy,v[2]*sz],n=norm([v[0]/sx,v[1]/sy,v[2]/sz]);if(basis){p=[0,1,2].map(i=>basis[0][i]*p[0]+basis[1][i]*p[1]+basis[2][i]*p[2]);n=[0,1,2].map(i=>basis[0][i]*n[0]+basis[1][i]*n[1]+basis[2][i]*n[2])}vertex([p[0]+x,p[1]+y,p[2]+z],n,c)}}
function limb(a,b,r,c){let y=norm(b.map((v,i)=>v-a[i])),x=norm(cross([0,0,1],y));ell(...a.map((v,i)=>(v+b[i])/2),r,Math.hypot(...b.map((v,i)=>v-a[i]))/2+r*.35,r,c,[x,y,cross(x,y)])}
let seed=12345;function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
// Field and a packed, four-sided stadium are persistent geometry.
box(0,-.2,50,180,.3,220,col('365049'));for(let z=-10;z<110;z+=5)box(0,0,z+2.5,68,.06,5,col(z%10===0?'387d49':'327443'));
for(let z=0;z<=100;z+=10){box(0,.045,z,68,.025,z===0||z===100?.22:.12,white);if(z>0&&z<100)for(let x of [-25,-10,10,25])box(x,.055,z,.12,.025,1.5,white)}for(let x of [-34,34])box(x,.045,50,.18,.025,120,white);
for(let z of [-10,110])box(0,.045,z,68,.025,.15,white);
for(let z of [0,100]){for(let x of [-2.8,2.8]){box(x,5,z,.13,10,.13,white);box(x,1,z,.45,2,.45,maroon)}box(0,3,z,5.8,.15,.15,white)}
for(let side of [-1,1]){box(side*39,1,50,.6,2,136,col('172b29'));for(let row=0;row<13;row++){let x=side*(43+row*1.7),y=1+row*.8;box(x,y,50,1.8,.5,148,col('38494c'));for(let z=-22;z<123;z+=1.55){let c=col(['da8e41','dfd7c7','23373b','562637','75938c'][Math.floor(rand()*5)]);box(x,y+.65,z,.57,.85,.5,c);box(x,y+1.2,z,.36,.42,.36,col(['c88f6c','8b5e46','e1b494'][Math.floor(rand()*3)]))}}box(side*56,13,50,31,.4,160,col('273839'));for(let z=-25;z<130;z+=25)box(side*70,6,z,.5,12,.5,col('899596'))}
for(let side of [-1,1])for(let row=0;row<10;row++){let z=50+side*(66+row*1.8),y=1+row*.8;box(0,y,z,85,.5,1.8,col('38494c'));for(let x=-41;x<42;x+=1.6){box(x,y+.6,z,.55,.8,.5,col(['c07936','d2cfbf','243b36','6e303d'][Math.floor(rand()*4)]));box(x,y+1.1,z,.34,.4,.34,skin)}}
for(let x of [-38,38])for(let z of [-6,106]){box(x,10,z,.3,20,.3,col('758b89'));box(x,20,z,5,1.6,.4,white)}
const staticData=new Float32Array(verts),staticBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,staticData,gl.STATIC_DRAW);const dynamicBuffer=gl.createBuffer();verts=[];
const keys=new Set();let mode='menu',tries=0,player={x:0,z:0},defenders=[],time=0,previous=0,runTime=0,burstUntil=0,burstCD=0,fendUntil=0,fendCD=0,stepUntil=0,stepCD=0,stepDir=1,diveUntil=0,diveCD=0,noticeUntil=0,heading=0,cam=[-14,10,-16],audio;

// Fictional gameplay attributes, tuned to the requested playing styles.
const attackers=[
 {id:'walsh',jerseyNumber:1,burstsPerRun:2,name:'Reece Walsh',club:'BRISBANE BRONCOS',role:'Fullback',style:'Speed + skill',description:'Electric pace and a sharp step. A long burst creates space.',speed:8.5,burstSpeed:12.5,burstDuration:3,burstRecovery:4.5,stepDuration:.32,stepRecovery:2,stepSpeed:17,stepSuccess:.9,fendSuccess:.65,fendRecovery:2.6,breakChance:.34,build:1,skin:'c78f70',hair:'36291f',kit:'651c38',trim:'edb454',beard:0,ratings:[96,95,58,48]},
 {id:'fonua-blake',jerseyNumber:8,burstsPerRun:2,name:'Addin Fonua-Blake',club:'CRONULLA SHARKS',role:'Forward',style:'Power runner',description:'Slower feet, a brutal fend and the strongest natural tackle break.',speed:7.1,burstSpeed:9,burstDuration:2,burstRecovery:4.5,stepDuration:.26,stepRecovery:3.3,stepSpeed:10,stepSuccess:.62,fendSuccess:.96,fendRecovery:2.1,breakChance:.86,build:1.35,skin:'ad7956',hair:'171719',kit:'8ccdeb',trim:'172128',beard:.13,ratings:[65,58,97,96]},
 {id:'mitchell',jerseyNumber:3,burstsPerRun:1,name:'Latrell Mitchell',club:'SOUTH SYDNEY RABBITOHS',role:'Centre',style:'Pace + power',description:'Fast and powerful through contact. His burst lasts just one second.',speed:8.2,burstSpeed:9.7,burstDuration:1,burstRecovery:3.5,stepDuration:.30,stepRecovery:2.5,stepSpeed:14,stepSuccess:.8,fendSuccess:.9,fendRecovery:2.3,breakChance:.70,build:1.2,skin:'ae7852',hair:'1b1b1b',kit:'167044',trim:'db332c',beard:.055,ratings:[89,80,90,85]},
 {id:'faalogo',jerseyNumber:1,burstsPerRun:3,name:'Sua Faalogo',club:'MELBOURNE STORM',role:'Fullback',style:'Footwork specialist',description:'Blistering pace and the biggest, quickest-recharging step. Avoid contact.',speed:8.7,burstSpeed:12.2,burstDuration:2.6,burstRecovery:3.5,stepDuration:.38,stepRecovery:1.35,stepSpeed:20,stepSuccess:.98,fendSuccess:.48,fendRecovery:2.8,breakChance:.13,build:.94,skin:'ba8163',hair:'202023',kit:'57318b',trim:'dfc457',beard:0,ratings:[98,99,43,24]}
];
const teams=[
 {name:'Wests Tigers',kit:'1b2329',trim:'f49236',count:6},
 {name:'Gold Coast Titans',kit:'5ab7db',trim:'e5ba55',count:7},
 {name:'St George Illawarra Dragons',kit:'eeeeea',trim:'d82b36',count:8},
 {name:'Canterbury Bulldogs',kit:'ededec',trim:'245db3',count:9},
 {name:'Canberra Raiders',kit:'83b742',trim:'edf0e2',count:10},
 {name:'South Sydney Rabbitohs',kit:'167044',trim:'db332c',count:11},
 {name:'Melbourne Storm',kit:'57318b',trim:'dfc457',count:12},
 {name:'Brisbane Broncos',kit:'651c38',trim:'edb454',count:13},
 {name:'Sydney Roosters',kit:'182c52',trim:'d53737',count:13},
 {name:'Penrith Panthers',kit:'202126',trim:'db667e',count:13}
];
let tackle=null,resumeMode='play';
let burstsLeft=0,portraitRequest=0;
let selected=attackers[0],activeTeam=teams[0],lineZ=43,contactUntil=0;
// Begin fetching and decoding every portrait before the first selection change.
const portraits=attackers.map(a=>{
 const image=new Image();image.src=a.id+'.webp';image.alt=a.name+' in club colours';
 const ready=image.decode().then(()=>image);
 ready.catch(()=>{});
 return {image,ready};
});
function showPortrait(index){
 const request=++portraitRequest,previous=$('player-photo');
 previous.style.visibility='hidden';
 portraits[index].ready.then(image=>{
  if(request!==portraitRequest)return;
  image.id='player-photo';image.style.visibility='visible';
  $('player-photo').replaceWith(image);
 }).catch(()=>{
  if(request!==portraitRequest)return;
  const image=$('player-photo');image.removeAttribute('src');image.alt='Portrait unavailable';image.style.visibility='visible';
 });
}
function tackleBreakChance(runner,level,bursting){
 const base=Math.max(.06,runner.breakChance-level*.012);
 // Momentum removes 45% of the remaining tackle risk, while preserving player differences.
 return Math.min(.97,base+(bursting?(1-base)*.45:0));
}
function updateBurstHUD(){
 const state=time<burstUntil?'ACTIVE':burstsLeft===0?'Used up':time<burstCD?`${(burstCD-time).toFixed(1)}s`:'Ready';
 $('burst').textContent=state+' · '+burstsLeft+' left';
}
function selectAttacker(index){
 selected=attackers[index];
 showPortrait(index);
 $('player-name').textContent=selected.name;$('player-club').textContent=selected.club+' · '+selected.role.toUpperCase();
 $('player-style').textContent=selected.style;$('player-description').textContent=selected.description;
 $('selection-count').textContent=String(index+1).padStart(2,'0')+' / 04';
 $('player-number').textContent=String(index+1).padStart(2,'0');
 for(let i=0;i<4;i++){$('rating-'+i).value=selected.ratings[i];$('value-'+i).textContent=selected.ratings[i];$('pick-'+i).setAttribute('aria-pressed',String(i===index));}
 $('burst-info').textContent=selected.burstsPerRun+' burst'+(selected.burstsPerRun===1?'':'s')+' per run · '+selected.burstDuration+'s each';
}
attackers.forEach((a,i)=>{$('pick-'+i).onclick=()=>{if(mode==='menu')selectAttacker(i)}});

function sound(freq,duration=.1){try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
function notice(s){$('message').textContent=s;noticeUntil=time+1.6}
function setupRun(){
 player={x:0,z:0,gait:0,runBlend:0};tackle=null;heading=0;runTime=0;keys.clear();
 burstUntil=burstCD=fendUntil=fendCD=stepUntil=stepCD=diveUntil=diveCD=0;contactUntil=0;burstsLeft=selected.burstsPerRun;
 activeTeam=teams[tries];lineZ=43;defenders=[];
 const count=activeTeam.count, hasFullback=tries>=3, lineCount=count-(hasFullback?1:0);
 for(let i=0;i<count;i++){
  const fullback=hasFullback&&i===count-1;
  let x,z;
  if(fullback){x=0;z=72;}
  else if(tries<3){x=-27+i*54/(lineCount-1)+(rand()-.5)*5;z=22+rand()*58;}
  else {x=-30+i*60/(lineCount-1);z=lineZ+(tries===9?0:(rand()-.5)*(9-tries)*2.5);}
  defenders.push({x,z,homeX:x,offsetZ:z-lineZ,fullback,stun:0,phase:rand()*6,
   skin:col(['bc8661','8b5b40','deb092','684b3c'][i%4]),hair:col(['30251f','a7824f','181819','574332'][i%4]),
   build:.9+rand()*.22,engaged:false,cool:0,angle:Math.PI,moving:false});
 }
 mode='play';$('menu').hidden=true;$('overlay').hidden=true;$('hud').hidden=false;$('tries').textContent=tries;
 $('team-name').textContent=activeTeam.name.toUpperCase();
 $('level').textContent=`LEVEL ${String(tries+1).padStart(2,'0')} · ${count} DEFENDERS`;
 $('runner-hud').textContent=selected.name;
 updateBurstHUD();$('fend').textContent=$('step').textContent='Ready';
 $('metres').textContent='100';$('progress').style.width='0%';
 cam=[0,5.2,-9];notice(tries===9?'12 in the line. One fullback. Find your gap.':activeTeam.name+' · Find the open space');sound(440);
}
function overlay(label,title,body,button){$('overlay').hidden=false;$('result-label').textContent=label;$('result-title').textContent=title;$('result-body').textContent=body;$('again').textContent=button}
function lose(reason){mode='over';let scored=tries;tries=0;$('tries').textContent='0';overlay('RUN OVER',reason,`${scored} of 10 consecutive tries. Your streak has reset. Find a gap and have another run.`,'TRY AGAIN');sound(110,.35)}
function score(){tries++;$('tries').textContent=tries;mode=tries===10?'won':'scored';overlay(tries===10?'CHALLENGE COMPLETE':'TRY CONFIRMED',tries===10?'Ten from ten.':'TRY!',tries===10?'The full field. Ten times. Untackled.':`${tries} / 10 tries. Next up: ${teams[tries]?.name}. Sharper, faster defending.`,tries===10?'PLAY AGAIN':'NEXT RUN');sound(740,.35)}
function pause(){if(mode==='play'||mode==='tackling'){resumeMode=mode;mode='paused';keys.clear();overlay('TIME OUT','Paused','Your run is safe. Press Escape or resume when you’re ready.','RESUME')}else if(mode==='paused'){mode=resumeMode;$('overlay').hidden=true}}
$('start').onclick=()=>{tries=0;setupRun()};$('again').onclick=()=>{if(mode==='paused')pause();else{if(mode==='won')tries=0;setupRun()}};$('choose').onclick=()=>{mode='menu';tackle=null;tries=0;$('overlay').hidden=true;$('hud').hidden=true;$('menu').hidden=false};$('pause').onclick=pause;
window.addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(['w','a','s','d','q','e','f','shift','escape',' '].includes(k))e.preventDefault();keys.add(k);if(e.repeat)return;if(k==='escape')pause();if(mode!=='play')return;if(k==='shift'&&time>=burstCD&&burstsLeft>0){burstsLeft--;burstUntil=time+selected.burstDuration;burstCD=time+selected.burstRecovery;updateBurstHUD();notice('BURST · '+burstsLeft+' LEFT');sound(500)}if(k==='f'&&time>=fendCD){fendUntil=time+.65;fendCD=time+selected.fendRecovery;notice('FEND');sound(220)}if(k==='e'&&time>=stepCD){stepDir=keys.has('a')?1:keys.has('d')?-1:-stepDir;stepUntil=time+selected.stepDuration;stepCD=time+selected.stepRecovery;notice('STEP');sound(360)}if(k==='q'&&time>=diveCD){if(player.z>=100){score();return}diveUntil=time+.65;diveCD=time+1.5;notice(player.z>=95?'REACH FOR THE LINE':'DIVE')}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();if(mode==='play'||mode==='tackling')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause()});
const clamp01=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp01(v);return v*v*(3-2*v)};
function beginTackle(defender){
 const others=defenders.filter(d=>d!==defender&&d.stun<=time&&Math.hypot(d.x-player.x,d.z-player.z)<1.65).slice(0,1);
 const involved=[defender,...others];
 tackle={elapsed:0,heading,origin:{x:player.x,z:player.z},involved,starts:involved.map(d=>({x:d.x,z:d.z,angle:d.angle||0})),impactPlayed:false};
 mode='tackling';keys.clear();burstUntil=fendUntil=stepUntil=diveUntil=0;
 player.fall=0;player.fallHeading=heading;player.runBlend=0;
 involved.forEach(d=>{d.wrapping=true;d.fall=0;d.fallHeading=heading;d.runBlend=0;});
 $('message').textContent='TACKLE';sound(150,.13);
}
function tickTackle(dt){
 tackle.elapsed+=dt;
 const t=tackle.elapsed,wrap=smooth(t/.3),fall=smooth((t-.3)/.7),slide=smooth((t-.15)/1.0);
 const forward=[Math.sin(tackle.heading),Math.cos(tackle.heading)],side=[forward[1],-forward[0]];
 player.x=tackle.origin.x+forward[0]*slide*.85;player.z=tackle.origin.z+forward[1]*slide*.85;
 player.fall=fall;player.wrap=wrap;
 tackle.involved.forEach((d,i)=>{
  const sign=i===0?1:-1,start=tackle.starts[i];
  const tx=player.x+side[0]*sign*.60-forward[0]*.08,tz=player.z+side[1]*sign*.60-forward[1]*.08;
  d.x=start.x+(tx-start.x)*wrap;d.z=start.z+(tz-start.z)*wrap;
  const target=tackle.heading-sign*Math.PI/2;
  d.angle=start.angle+Math.atan2(Math.sin(target-start.angle),Math.cos(target-start.angle))*wrap;
  d.fall=fall;d.wrap=wrap;d.moving=false;
 });
 if(fall>.96&&!tackle.impactPlayed){tackle.impactPlayed=true;sound(85,.2);}
 // Give the grounded pose a moment before showing the result.
 if(t>=1.65)lose('Tackled.');
}
function bodyPoint(p,attacker,a,b,c,bob=0){
 const angle=attacker?heading:(p.angle??Math.PI),cs=Math.cos(angle),sn=Math.sin(angle);
 let wx=a*cs+c*sn,wz=-a*sn+c*cs;
 if(p.fall!==undefined){
  const f=p.fall*Math.PI/2,forward=[Math.sin(p.fallHeading),Math.cos(p.fallHeading)],right=[forward[1],-forward[0]];
  const along=wx*forward[0]+wz*forward[1],across=wx*right[0]+wz*right[1],yy=b-.9;
  const tilted=along*Math.cos(f)+yy*Math.sin(f);
  const y=.9+((attacker?.38:.53)-.9)*p.fall+yy*Math.cos(f)-along*Math.sin(f);
  return[p.x+right[0]*across+forward[0]*tilted,y,p.z+right[1]*across+forward[1]*tilted];
 }
 if(attacker&&time<diveUntil){const yy=b-1;return[p.x+a,.62+yy*.22-c*.96,p.z+yy*.96+c*.22];}
 return[p.x+wx,b+bob,p.z+wz];
}
// Stance: foot travels front to back on the turf. Recovery: heel lifts and swings forward.
function footPath(phase,speed,side,bob=0){
 const u=((phase/(Math.PI*2)+(side===1?0:.5))%1+1)%1,stance=.24;
 let z,lift=0;
 if(u<stance){z=.27-.54*u/stance;}
 else{const q=(u-stance)/(1-stance);z=-.27+.54*smooth(q);lift=Math.sin(Math.PI*q)*.29;}
 return[side*.16,.12+lift*speed-bob,z*speed];
}
// Two-bone leg solver: the knee always stays forward of the hip-to-ankle line.
function legPose(phase,speed,side,bob=0){
  const hip=[side*.16,.87,0];
  const ankle=footPath(phase,speed,side,bob);
  const upper=.39,lower=.40;
  let dy=ankle[1]-hip[1],dz=ankle[2],distance=Math.hypot(dy,dz);
  const reach=Math.min(distance,upper+lower-.005), uy=dy/distance,uz=dz/distance;
  ankle[1]=hip[1]+uy*reach;ankle[2]=uz*reach;
  const along=(upper*upper-lower*lower+reach*reach)/(2*reach);
  const bend=Math.sqrt(Math.max(0,upper*upper-along*along));
  const knee=[side*.16,hip[1]+uy*along+uz*bend,uz*along-uy*bend];
  return {hip,knee,ankle};
}
// Centred block numerals conform to the curved back rather than disappearing into it.
const jerseyGlyphs={1:['00100','01100','00100','00100','00100','00100','11111'],
 8:['01110','11011','11011','01110','11011','11011','01110'],
 3:['11110','00011','00011','01110','00011','00011','11110']};
function jerseyNumber(number,build,local){
 const glyph=jerseyGlyphs[number],width=.035,height=.045;
 const origin=local(0,0,0),normal=norm(local(0,0,-1).map((v,i)=>v-origin[i]));
 const point=(column,row)=>{
  const x=(2.5-column)*width,y=1.3+(3.5-row)*height;
  const z=-.18*Math.sqrt(Math.max(.01,1-(x/(.29*build))**2-((y-1.25)/.4)**2))-.009;
  return local(x,y,z);
 };
 glyph.forEach((row,j)=>[...row].forEach((pixel,i)=>{
  if(pixel!=='1')return;
  const q=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];
  for(const index of [0,1,2,0,2,3])vertex(q[index],normal,white);
 }));
}
function footballer(p,attacker,phase,speed){
 ell(p.x,.075,p.z,p.fall!==undefined?.7:.42,.018,.34,col('284f37'));
 const s=attacker?selected.build:(p.build||1),sk=attacker?col(selected.skin):(p.skin||skin),c=col(attacker?selected.kit:activeTeam.kit),trim=col(attacker?selected.trim:activeTeam.trim);
 const bob=p.fall!==undefined?0:Math.cos(phase*2)*speed*.018;
 const local=(a,b,c)=>bodyPoint(p,attacker,a,b,c,bob);
 const origin=local(0,0,0),basis=[[1,0,0],[0,1,0],[0,0,1]].map(v=>norm(local(...v).map((n,i)=>n-origin[i])));
 const ball=(a,b,c,sx,sy,sz,color)=>ell(...local(a,b,c),sx,sy,sz,color,basis);
 const seg=(a,b,r,color)=>limb(local(...a),local(...b),r,color);
// Articulated athletic silhouette: upper/lower legs, shoulders, hands, neck and face.
ball(0,1.25,0,.29*s,.4,.18,c);ball(0,.88,0,.26*s,.19,.18,c);for(let side of [-1,1]){let stride=footPath(phase,speed,side)[2];const {hip,knee,ankle}=legPose(phase,speed,side,bob);seg(hip,knee,.115*s,sk);seg(knee,ankle,.085,sk);const sock=ankle.map((v,i)=>v+(knee[i]-v)*.42);seg(sock,ankle,.087,c);ball(ankle[0],ankle[1]-.035,ankle[2]+.075,.105,.07,.19,attacker?col('b4e45e'):white);ball(side*.32,1.48,0,.145,.17,.15,c);let extended=attacker&&side===-1&&time<fendUntil;let elbow=[side*(extended?.62:.38),extended?1.45:1.14,attacker&&side===1?.16:-stride*.6],hand=[side*(extended?.94:.29),extended?1.5:1.05,attacker&&side===1?(p.fall!==undefined?.20:.35):.22];if(p.wrapping&&tackle){
 const shoulder=local(side*.33,1.47,0);
 // Hands close around opposite sides of the ball carrier's waist and stay attached during the fall.
 const grip=bodyPoint(player,true,side*.25,1.14,.13);
 const rest=local(...hand),target=rest.map((v,i)=>v+(grip[i]-v)*(p.wrap||0));
 const outward=side*.16,mid=shoulder.map((v,i)=>(v+target[i])/2);
 mid[0]+=Math.cos(tackle.heading)*outward;mid[2]-=Math.sin(tackle.heading)*outward;mid[1]+=.06;
 limb(shoulder,mid,.095,sk);limb(mid,target,.078,sk);ell(...target,.075,.085,.075,sk);
 }else{seg([side*.33,1.47,0],elbow,.095,sk);seg(elbow,hand,.078,sk);ball(...hand,.075,.085,.075,sk)}}
seg([0,1.52,0],[0,1.7,0],.09,sk);ball(0,1.83,0,.145,.2,.15,sk);ball(0,1.96,-.025,.15,.115,.15,attacker?col(selected.hair):(p.hair||col('36291f')));if(attacker){if(selected.id==='walsh')for(let i=0;i<6;i++)ball(Math.sin(i*2)*.105,1.99+(i%2)*.035,Math.cos(i*2)*.09,.065,.075,.06,col('3d2b20'));if(selected.beard)ball(0,1.71,.045,.145,selected.beard,.15,col(selected.hair));ball(0,1.81,.15,.035,.045,.035,sk);for(let a of [-.054,.054])ball(a,1.86,.135,.023,.015,.018,col('628d91'));seg([-.22,1.46,.165],[0,1.32,.19],.024,trim);seg([0,1.32,.19],[.22,1.46,.165],.024,trim);ball(.28,1.13,p.fall!==undefined?.20:.32,.13,.24,.13,col('d8c2a0'));seg([-.28,1.43,-.025],[-.32,1.18,.01],.082,col('877665'));jerseyNumber(selected.jerseyNumber,s,local)}else{seg([-.23,1.45,.16],[0,1.3,.19],.043,trim);seg([0,1.3,.19],[.23,1.45,.16],.043,trim)}}
function tick(dt){if(mode==='tackling'){tickTackle(dt);return;}if(mode!=='play')return;time+=dt;runTime+=dt;let dx=(keys.has('a')?1:0)-(keys.has('d')?1:0),dz=(keys.has('w')?1:0)-(keys.has('s')?1:0),l=Math.hypot(dx,dz);if(l){dx/=l;dz/=l}let speed=time<burstUntil?selected.burstSpeed:selected.speed;if(time<stepUntil)dx=stepDir*selected.stepSpeed/speed;if(time<diveUntil){dz=1;speed=9.5;dx*=.3}const oldX=player.x,oldZ=player.z;player.x+=dx*speed*dt;player.z=Math.max(-2,player.z+dz*speed*dt);const travel=Math.hypot(player.x-oldX,player.z-oldZ);
 player.runBlend=(player.runBlend||0)+((travel>.001?1:0)-(player.runBlend||0))*Math.min(1,dt*14);
 player.gait=(player.gait||0)+travel*(Math.PI*2/2.25);
 if(travel>.001){const target=Math.atan2(player.x-oldX,player.z-oldZ);heading+=Math.atan2(Math.sin(target-heading),Math.cos(target-heading))*Math.min(1,dt*18);}if(Math.abs(player.x)>34||player.z>110){lose('Into touch.');return}if(player.z>=100&&time<diveUntil){score();return}
// Higher levels advance together, slide across, and release nearby tacklers.
const pace=4.4+tries*.32,structured=tries>=3;
if(structured&&lineZ>player.z+2)lineZ-=pace*.48*dt;
for(let d of defenders){
 d.moving=false;
 if(d.stun>time)continue;
 const vx=player.x-d.x,vz=player.z-d.z,dist=Math.hypot(vx,vz);
 let tx=player.x,tz=player.z,moveSpeed=pace;
 if(!structured){d.engaged=dist<30+tries*6||d.engaged;}
 else {
  d.engaged=true;
  const broken=player.z>lineZ+1;
  if(d.fullback){
   // Sweep behind the line until the runner breaks through or reaches tackling distance.
   if(!broken&&dist>15){tx=Math.max(-29,Math.min(29,player.x*.85));tz=Math.max(lineZ+19,player.z+22);moveSpeed=pace*.7;}
   else {tx=player.x+dx*selected.speed*.24;tz=player.z+Math.max(0,dz)*selected.speed*.25;moveSpeed=pace+.25;}
  }else if(!broken&&dist>7+tries*.25){
   tx=Math.max(-32,Math.min(32,d.homeX+player.x*.12));tz=lineZ+d.offsetZ;
  }else{
   tx=player.x+dx*selected.speed*(.12+tries*.015);tz=player.z+Math.max(0,dz)*selected.speed*.18;
  }
 }
 if(d.engaged){
  const ax=tx-d.x,az=tz-d.z,length=Math.hypot(ax,az),travel=Math.min(length,moveSpeed*dt);
  if(length>.05){d.x+=ax/length*travel;d.z+=az/length*travel;d.angle=Math.atan2(ax,az);d.moving=true;d.gait=(d.gait||d.phase||0)+travel*(Math.PI*2/2.25);}
 }
 if(Math.hypot(player.x-d.x,player.z-d.z)<1.05&&time>d.cool&&time>=contactUntil){
  const stepping=time<stepUntil,fending=time<fendUntil;
  const evade=stepping&&rand()<selected.stepSuccess;
  const fend=!evade&&fending&&rand()<selected.fendSuccess;
  if(fending)fendUntil=0;
  if(evade||fend){d.stun=time+(evade?1.5+selected.stepSuccess:2.1);d.cool=d.stun+.7;contactUntil=time+.18;d.x+=vx>0?-1:1;notice(evade?'BEATEN WITH FOOTWORK':'FENDED OFF');sound(300);}
  else if(rand()<tackleBreakChance(selected,tries,time<burstUntil)){
   d.stun=time+1.65;d.cool=time+2.5;contactUntil=time+.25;notice('TACKLE BROKEN');sound(180);
  }else{beginTackle(d);return;}
 }
}
$('metres').textContent=Math.max(0,Math.ceil(100-player.z));$('progress').style.width=Math.min(100,player.z)+'%';for(let [id,cd,active] of [['fend',fendCD,fendUntil],['step',stepCD,stepUntil]])$(id).textContent=time<active?'ACTIVE':time<cd?`${(cd-time).toFixed(1)}s`:'Ready';updateBurstHUD();if(time>noticeUntil)$('message').textContent=player.z>95?'Q · DIVE / GROUND THE BALL':''}
function drawBuffer(buffer,data,count,usage){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);if(data)gl.bufferData(gl.ARRAY_BUFFER,data,usage);attrs.forEach((a,i)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,i*12)});gl.drawArrays(gl.TRIANGLES,0,count)}
function frame(ms){let dt=Math.min(.04,(ms-previous)/1000||.016);previous=ms;tick(dt);let ratio=Math.min(window.devicePixelRatio||1,1.6),w=Math.floor(innerWidth*ratio),h=Math.floor(innerHeight*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}let menu=mode==='menu',target=menu?[0,1,35]:[player.x*.9,1.4,player.z+9],wanted=menu?[-17,9,8]:[player.x,5,player.z-9];cam=cam.map((v,i)=>v+(wanted[i]-v)*Math.min(1,dt*6));let f=1/Math.tan(Math.PI/6),near=.1,far=350,proj=[f/(w/h),0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];gl.uniformMatrix4fv(vp,false,new Float32Array(mult(proj,view(cam,target))));gl.clearColor(.38,.55,.61,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);drawBuffer(staticBuffer,null,staticData.length/9);verts=[];if(menu){footballer({x:0,z:24},true,0,0);for(let i=0;i<5;i++)footballer({x:-15+i*8,z:38+i*4},false,i,0)}else{let moving=mode==='play'&&['w','a','s','d'].some(k=>keys.has(k));footballer(player,true,player.gait||0,player.fall!==undefined?0:(player.runBlend||0));for(let d of defenders)footballer(d,false,d.gait||d.phase||0,d.moving&&mode==='play'&&d.stun<time?1:0)}drawBuffer(dynamicBuffer,new Float32Array(verts),verts.length/9,gl.DYNAMIC_DRAW);requestAnimationFrame(frame)}selectAttacker(0);requestAnimationFrame(frame);
