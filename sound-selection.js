const events=[
 {key:'footstep',name:'Footsteps',description:'Repeats quietly while running',options:['Soft turf','Firm studs','Sprint tap']},
 {key:'tackle',name:'Tackle',description:'Impact plus an “oof”',options:['Short oof','Deep grunt','Heavy contact']},
 {key:'score',name:'Score',description:'Crowd response after a try',options:['Warm cheer','Big roar','Finals eruption']},
 {key:'burst',name:'Burst',description:'Level-up style boost',options:['Arcade rise','Power surge','Elite boost']},
 {key:'step',name:'Step',description:'One louder planted foot',options:['Sharp plant','Heavy cut','Stud snap']},
 {key:'fend',name:'Fend',description:'“Booyah!” voice treatment',options:['Confident','Big call','Quick shout']},
 {key:'button',name:'Buttons',description:'Short tech interface sound',options:['Soft blip','Digital tick','Neon click']},
 {key:'tackleBreak',name:'Tackle break',description:'“Oh yeah!” voice treatment',options:['Cool win','Power call','Fast hype']}
];
const defaults={footstep:0,tackle:0,score:1,burst:0,step:0,fend:0,button:0,tackleBreak:0};
let selected={...defaults},audio;
try{const saved=JSON.parse(localStorage.getItem('nrl-run-it-audition')||'{}');for(const event of events)if(Number.isInteger(saved[event.key])&&saved[event.key]>=0&&saved[event.key]<3)selected[event.key]=saved[event.key]}catch{}

function save(){try{localStorage.setItem('nrl-run-it-audition',JSON.stringify(selected))}catch{}}
function audioEngine(){
 const AudioEngine=window.AudioContext||window.webkitAudioContext;
 audio??=new AudioEngine();if(audio.state==='suspended')audio.resume();return audio;
}
function tone(ctx,freq,start,duration,gain=.04,type='sine',endFreq=freq){
 const oscillator=ctx.createOscillator(),volume=ctx.createGain();oscillator.type=type;
 oscillator.frequency.setValueAtTime(Math.max(20,freq),start);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),start+duration);
 volume.gain.setValueAtTime(.0001,start);volume.gain.linearRampToValueAtTime(gain,start+.008);volume.gain.exponentialRampToValueAtTime(.0001,start+duration);
 oscillator.connect(volume);volume.connect(ctx.destination);oscillator.start(start);oscillator.stop(start+duration+.02);
}
function noise(ctx,start,duration,frequency=220,gain=.025,filterType='lowpass'){
 const frames=Math.max(1,Math.floor(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,frames,ctx.sampleRate),data=buffer.getChannelData(0);
 for(let i=0;i<frames;i++)data[i]=(Math.random()*2-1)*(1-i/frames*.35);
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),volume=ctx.createGain();source.buffer=buffer;filter.type=filterType;filter.frequency.value=frequency;
 volume.gain.setValueAtTime(.0001,start);volume.gain.linearRampToValueAtTime(gain,start+.012);volume.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(filter);filter.connect(volume);volume.connect(ctx.destination);source.start(start);source.stop(start+duration+.02);
}
function say(word,variant=0){
 try{
  const synth=window.speechSynthesis;if(!synth||typeof SpeechSynthesisUtterance==='undefined')return;
  const utterance=new SpeechSynthesisUtterance(word),voices=synth.getVoices?.()||[];
  utterance.voice=voices.find(v=>/^en-AU/i.test(v.lang))||voices.find(v=>/^en-(GB|US)/i.test(v.lang))||null;
  const styles=[{rate:1.02,pitch:.82,volume:.72},{rate:.82,pitch:.62,volume:.82},{rate:1.20,pitch:1.05,volume:.74}][variant]||{};
  Object.assign(utterance,styles);synth.speak(utterance);
 }catch{}
}
function playSound(kind,choice){
 if(kind==='tackle')say('Oof!',choice);else if(kind==='fend')say('Booyah!',choice);else if(kind==='tackleBreak')say('Oh yeah!',choice);
 try{
  const ctx=audioEngine(),now=ctx.currentTime+.005;
  if(kind==='footstep'){
   const profiles=[[105,.018,.038],[150,.014,.034],[205,.012,.029]],p=profiles[choice];
   for(let i=0;i<3;i++){const at=now+i*.25;noise(ctx,at,.07,p[0],p[2]);tone(ctx,p[0],at,.075,p[1],'sine',p[0]*.7)}
  }else if(kind==='step'){
   const profiles=[[150,.075,.08],[100,.09,.11],[240,.065,.065]],p=profiles[choice];noise(ctx,now,.12,p[0]*2,p[2],'bandpass');tone(ctx,p[0],now,.13,p[1],'triangle',p[0]*.55);
  }else if(kind==='tackle'){
   const profiles=[[75,.11,.12],[58,.14,.16],[46,.16,.20]],p=profiles[choice];noise(ctx,now,.22,150,p[2]);tone(ctx,p[0],now,.24,p[1],'sine',32);
  }else if(kind==='score'){
   const profiles=[[1.15,.045,720],[1.55,.065,950],[2,.085,1250]],p=profiles[choice];noise(ctx,now,p[0],p[2],p[1],'bandpass');
   for(let i=0;i<7+choice*4;i++)noise(ctx,now+.05+i*.095,.05,1800,.018+choice*.004,'highpass');
   tone(ctx,392,now+.04,.55,.022,'sawtooth',523);tone(ctx,523,now+.18,.65,.018,'sawtooth',784);
  }else if(kind==='burst'){
   const notes=[[220,330,494],[130,260,520],[330,554,880]][choice];notes.forEach((freq,i)=>tone(ctx,freq,now+i*.085,.24,.04,'sawtooth',freq*1.08));noise(ctx,now,.35,900,.018,'highpass');
  }else if(kind==='fend')tone(ctx,[180,120,260][choice],now,.16,.035,'square',[260,170,390][choice]);
  else if(kind==='tackleBreak')tone(ctx,[330,220,440][choice],now,.18,.04,'triangle',[495,330,660][choice]);
  else if(kind==='button'){const p=[[620,860,.065],[980,710,.045],[440,1320,.08]][choice];tone(ctx,p[0],now,p[2],.022,'square',p[1])}
 }catch{}
}

function render(){
 document.getElementById('sound-grid').innerHTML=events.map((event,index)=>`<article class="sound-event"><div class="event-head"><div><h3>${event.name}</h3><p>${event.description}</p></div><span class="event-number">${String(index+1).padStart(2,'0')}</span></div><div class="sound-options">${event.options.map((option,choice)=>`<label class="sound-option"><input type="radio" name="${event.key}" value="${choice}" ${selected[event.key]===choice?'checked':''}><span class="sound-name">${option}</span><button class="play" type="button" data-kind="${event.key}" data-choice="${choice}" aria-label="Play ${option} for ${event.name}">▶ PLAY</button></label>`).join('')}</div></article>`).join('');
 document.querySelectorAll('input[type=radio]').forEach(input=>input.addEventListener('change',()=>{selected[input.name]=Number(input.value);save();updateSummary()}));
 document.querySelectorAll('.play').forEach(button=>button.addEventListener('click',event=>{
  event.preventDefault();const kind=button.dataset.kind,choice=Number(button.dataset.choice);selected[kind]=choice;save();
  document.querySelector(`input[name="${kind}"][value="${choice}"]`).checked=true;updateSummary();
  button.classList.add('playing');window.setTimeout(()=>button.classList.remove('playing'),500);playSound(kind,choice);
 }));
 updateSummary();
}
function choiceText(){return events.map(event=>`${event.name}: ${event.options[selected[event.key]]}`).join('\n')}
function updateSummary(){document.getElementById('choice-summary').innerHTML=events.map(event=>`<li><b>${event.name}:</b> ${event.options[selected[event.key]]}</li>`).join('')}
document.getElementById('copy-choices').addEventListener('click',async()=>{
 const status=document.getElementById('copy-status');
 try{await navigator.clipboard.writeText(choiceText());status.textContent='Copied — paste the list into our chat.'}
 catch{status.textContent='Could not copy automatically. Please copy the list above.'}
});
render();
