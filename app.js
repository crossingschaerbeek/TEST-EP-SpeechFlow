import {groupLogos,affiliationImage,identityImage} from './identity.mjs';
import {elapsed,remaining,phase,format,clockValue} from './timer.mjs';
const $=id=>document.getElementById(id), key='speechflow.v1', publicMode=new URLSearchParams(location.search).has('display');
let s;try{s=JSON.parse(localStorage.getItem(key));}catch{}s ||= {meeting:{},queue:[],history:[],run:null,members:[],queueEnabled:true,showName:true};
const englishGroups={'PPE':'EPP','CRE':'ECR','Patriotes pour l’Europe':'Patriots for Europe','Europe des nations souveraines':'Europe of Sovereign Nations','Non-inscrits':'Non-attached','Verts/ALE':'Greens/EFA'};
function normalizeGroups(){for(const collection of [s.members,s.queue,s.history,s.run?[s.run]:[]])for(const item of collection)item.group=englishGroups[item.group]||item.group;if(englishGroups[s.meeting.meetingGroup])s.meeting.meetingGroup=englishGroups[s.meeting.meetingGroup];}normalizeGroups();
const escape=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){localStorage.setItem(key,JSON.stringify(s));render();}function metadata(){for(const id of ['meeting','meetingGroup','place','date'])$(id).value=s.meeting[id]||'';$('queueEnabled').checked=s.queueEnabled;$('showName').checked=s.showName;}
metadata();if(publicMode)document.body.classList.add('public');
for(const id of ['meeting','meetingGroup','place','date'])$(id).onchange=()=>{s.meeting[id]=$(id).value;save();};
for(const id of ['queueEnabled','showName'])$(id).onchange=()=>{s[id]=$(id).checked;save();};
[0.5,1,2,5,10].forEach(n=>{let b=document.createElement('button');b.textContent=n===0.5?'30 s':n+' min';b.dataset.minutes=String(n);b.classList.toggle('selected',n===Number($('minutes').value));b.onclick=()=>{$('timerMode').value='countdown';$('durationOptions').hidden=false;$('minutes').value=n;highlightDuration();};$('presets').append(b);});
$('timerMode').onchange=()=>{$('durationOptions').hidden=$('timerMode').value==='countup';};
function highlightDuration(){document.querySelectorAll('#presets button').forEach(b=>b.classList.toggle('selected',Number(b.dataset.minutes)===Number($('minutes').value)));}$('minutes').oninput=highlightDuration;
let guestPhoto='', photoRevision=0, photoName='';
function resetPhoto(message=''){
  photoRevision++;guestPhoto='';photoName='';$('guestPhoto').value='';
  $('guestPreview').hidden=true;$('guestPreview').removeAttribute('src');
  $('removeGuestPhoto').hidden=true;$('photoStatus').textContent=message;
}
$('removeGuestPhoto').onclick=()=>resetPhoto();
$('name').addEventListener('input',()=>{if(photoName && $('name').value.trim()!==photoName)resetPhoto();});
$('guestPhoto').onchange=async()=>{
  const file=$('guestPhoto').files[0];
  resetPhoto();if(!file)return;
  const revision=photoRevision;photoName=$('name').value.trim();
  $('removeGuestPhoto').hidden=false;$('photoStatus').textContent='Preparing photo…';
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.src=url;await image.decode();
    if(revision!==photoRevision)return;
    const canvas=document.createElement('canvas');
    const scale=Math.min(1,480/Math.max(image.naturalWidth,image.naturalHeight));
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    guestPhoto=canvas.toDataURL('image/jpeg',0.8);
    $('guestPreview').src=guestPhoto;$('guestPreview').hidden=false;
    $('photoStatus').textContent='Photo ready';
  }catch{if(revision===photoRevision)resetPhoto('This image could not be opened. Try a JPG or PNG.');}
  finally{URL.revokeObjectURL(url);}
};
function saveNewSpeaker(speaker){
  try{save();}
  catch(error){
    if(error.name!=='QuotaExceededError'||!speaker.photo?.startsWith('data:image/jpeg;'))throw error;
    speaker.photo='';save();$('photoStatus').textContent='Browser storage is full. Continued without the photo.';
  }
}
function directoryEntry(name){
  const key=name.normalize('NFC').toLocaleLowerCase();
  if(!key)return null;
  const matches=[...s.members,...(s.staff||[])].filter(m=>m.name.normalize('NFC').toLocaleLowerCase()===key);
  return matches.length===1?matches[0]:null;
}
let lastMembers,lastStaff;
function renderDirectory(){
  if(lastMembers===s.members && lastStaff===s.staff)return;
  lastMembers=s.members;lastStaff=s.staff;
  $('members').innerHTML=[...s.members,...(s.staff||[])].map(p=>`<option value="${escape(p.name||'Unnamed speaker')}">${escape(p.kind==='staff'?['Staff',p.department].filter(Boolean).join(' · '):p.group)}</option>`).join('');
  $('staffStatus').textContent=`${(s.staff||[]).length} staff entries`;
}
$('staffImport').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  const previous=s.staff;
  try{
    if(file.size>3000000)throw Error('Choose a staff file under 3 MB.');
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data))throw Error('Expected a JSON array of staff entries.');
    const staff=data.map(item=>{
      if(!item||typeof item.name!=='string'||!item.name.trim()||
         (item.department!=null&&typeof item.department!=='string')||
         (item.photo!=null&&(typeof item.photo!=='string'||(item.photo&&!/^https:\/\//i.test(item.photo)))))
        throw Error('Each entry needs a name. Department and HTTPS photo URL are optional.');
      return {name:item.name.trim(),department:item.department?.trim()||'',photo:item.photo||'',kind:'staff'};
    });
    s.staff=staff;try{localStorage.setItem(key,JSON.stringify(s));}catch{s.staff=previous;throw Error('Not enough browser storage. Try a smaller list.');}
    render();
  }catch(error){$('staffStatus').textContent=error.message;}
  finally{e.target.value='';}
};
$('clearStaff').onclick=()=>{s.staff=[];save();};
function candidate(requireName=false){let name=$('name').value.trim(),minutes=Number($('minutes').value);const mode=$('timerMode').value;if((requireName&&!name)||(mode!=='countup'&&(!Number.isFinite(minutes)||minutes<1/60||minutes>1440))){alert(requireName?'Enter a name and a valid duration.':'Enter a duration between 1 second and 1440 minutes.');return null;}const member=directoryEntry(name);return {id:crypto.randomUUID(),name,group:$('group').value.trim()||member?.group||member?.department||'',kind:member?.kind||'',photo:guestPhoto||member?.photo||'',mode,allowedMs:mode==='countup'?null:Math.round(minutes*60000)};}
$('add').onclick=()=>{const p=candidate(true);if(p){s.queue.push(p);$('name').value='';$('group').value='';resetPhoto();saveNewSpeaker(p);}};
let autoGroup='';
$('name').onchange=()=>{const m=directoryEntry($('name').value.trim());if(m||$('group').value===autoGroup){autoGroup=m?.group||m?.department||'';$('group').value=autoGroup;}};
$('start').onclick=()=>{if(s.run){if(s.run.startedAt===null){s.run.startedAt=Date.now();save();}return;}const fromQueue=s.queueEnabled&&s.queue.length;const p=fromQueue?s.queue.shift():candidate();if(!p)return;s.run={...p,elapsedMs:0,startedAt:Date.now(),beganAt:new Date().toISOString()};if(!fromQueue)resetPhoto();saveNewSpeaker(s.run);};
$('pause').onclick=()=>{if(s.run&&s.run.startedAt!==null){s.run.elapsedMs=elapsed(s.run);s.run.startedAt=null;save();}};
$('finish').onclick=()=>{if(!s.run)return;const usedMs=elapsed(s.run);s.history.push({...s.run,usedMs,overMs:s.run.mode==='countup'?0:Math.max(0,usedMs-s.run.allowedMs),endedAt:new Date().toISOString()});s.run=null;save();};
$('queue').onclick=e=>{const b=e.target.closest('[data-remove]');if(b){s.queue=s.queue.filter(p=>p.id!==b.dataset.remove);save();}};
$('display').onclick=()=>window.open(location.pathname+'?display=1','speechflow-display');$('full').onclick=()=>window.open(location.pathname+'?display=1','speechflow-display');$('publicFull').onclick=()=>document.documentElement.requestFullscreen().catch(()=>alert('Le plein écran n’est pas disponible.'));
function render(){ $('add').disabled=!s.queueEnabled;$('pause').disabled=!s.run||s.run.startedAt===null;$('finish').disabled=!s.run;$('start').textContent=s.run?(s.run.startedAt===null?'▶ Resume':'Running'):'▶ Start';$('start').disabled=!!s.run&&s.run.startedAt!==null;
$('queue').innerHTML=s.queue.length?s.queue.map((p,i)=>`<p>${i+1}. <b>${escape(p.name||'Unnamed speaker')}</b> · ${escape(p.group)} · ${p.mode==='countup'?'Count up':format(p.allowedMs)} <button data-remove="${p.id}">Remove</button></p>`).join(''):'No speakers waiting';
renderDirectory();$('history').innerHTML=s.history.map(p=>`<tr><td>${escape(p.name||'Unnamed speaker')}<br><small>${escape(p.group)}</small></td><td>${p.mode==='countup'?'Count up':format(p.allowedMs)}</td><td>${format(p.usedMs)}</td><td>+${format(p.overMs)}</td></tr>`).join('');$('total').textContent=`${s.history.length} completed intervention(s) · Total speaking time : ${format(s.history.reduce((a,p)=>a+p.usedMs,0))}`;tick();}
const failedImages=new Set();let displayedPerson=null;
function updatePortrait(person){
 displayedPerson=person;
 const selected=s.showName?identityImage(person,failedImages):null;
 const img=$('portrait');img.style.display=selected?'block':'none';
 img.className=selected?.logo?'affiliation-image'+(selected.dark?' dark-logo':''):'';
 img.alt=selected?.alt||'';
 if(selected&&img.getAttribute('src')!==selected.src){img.style.visibility='hidden';img.src=selected.src;}
}
function tick(){const active=s.run||(s.queueEnabled?s.queue[0]:null);updatePortrait(active);const r=remaining(s.run),p=phase(s.run);$('clock').textContent=clockValue(s.run);$('speakerGroup').textContent=s.showName?(active?.group||''):'';$('stage').className='stage'+(['red','pulse','over'].includes(p)?' red':'')+(p==='pulse'?' pulse':'')+(p==='orange'?' orange':'');$('speaker').textContent=s.showName?((s.run?s.run.name:(s.queueEnabled?s.queue[0]?.name:null))||'Speaking time'):'Speaking time';$('status').textContent=s.run?(s.run.startedAt===null?'PAUSED':s.run.mode==='countup'?'COUNT UP':r<0?'TIME EXCEEDED':'SPEAKING'):'READY TO START';$('next').textContent=s.queueEnabled?(s.queue[0]?'Next speaker: '+s.queue[0].name:'No speakers waiting'):'';}
$('portrait').onerror=()=>{failedImages.add($('portrait').getAttribute('src'));updatePortrait(displayedPerson);};$('portrait').onload=()=>{$('portrait').style.visibility='visible';};
setInterval(tick,100);window.addEventListener('storage',e=>{if(e.key===key&&e.newValue){s=JSON.parse(e.newValue);normalizeGroups();metadata();render();}});
$('import').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!Array.isArray(data)||data.some(m=>typeof m.name!=='string'||typeof m.group!=='string'||(m.photo&&!/^https:\/\//.test(m.photo))))throw Error();s.members=data;normalizeGroups();$('importStatus').textContent=data.length+' MEPs imported';save();}catch{alert('Expected format: JSON array of {name, group, photo: HTTPS URL}.');}};
$('json').onclick=()=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}));a.href=url;a.download='speechflow-reunion.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function reportIdentity(p){
 const selected=identityImage(p), fallback=affiliationImage(p);
 const logo=p.kind==='staff'?null:groupLogos[p.group];
 const image=selected?`<img class="${selected.logo?'report-fallback'+(selected.dark?' dark-logo':''):'report-photo'}" src="${escape(selected.src)}" alt="${escape(selected.alt)}"${!selected.logo&&fallback?` data-fallback="${escape(fallback.src)}" data-fallback-alt="${escape(fallback.alt)}" data-fallback-dark="${fallback.dark}"`:''}>`:'';
 return `<div class="report-person">${image}<div><strong>${escape(p.name||'Unnamed speaker')}</strong><div class="report-group">${logo&&!selected?.logo?`<img class="report-logo" src="assets/groups/${logo}" alt="Logo ${escape(p.group)}">`:''}<span>${escape(p.group)}</span></div></div></div>`;
}
$('pdf').onclick=async()=>{const button=$('pdf');button.disabled=true;button.textContent='Loading images…';try{
 const totals=new Map();for(const p of s.history){const item=totals.get(p.name)||{...p,usedMs:0};item.usedMs+=p.usedMs;totals.set(p.name,item);}
 const rows=s.history.map(p=>`<tr><td>${reportIdentity(p)}</td><td>${p.mode==='countup'?'Count up':format(p.allowedMs)}</td><td>${format(p.usedMs)}</td><td>${p.mode==='countup'?'—':'+'+format(p.overMs)}</td></tr>`).join('');
 $('report').innerHTML=`<h1>${escape(s.meeting.meeting||'Meeting report')}</h1><p>${escape(s.meeting.meetingGroup)} · ${escape(s.meeting.place)} · ${escape(s.meeting.date)}</p><h2>Completed interventions</h2><table><thead><tr><th>Speaker</th><th>Allocated</th><th>Used</th><th>Overrun</th></tr></thead><tbody>${rows}</tbody></table><h2>Totals by speaker</h2><table><tbody>${[...totals.values()].map(p=>`<tr><td>${reportIdentity(p)}</td><td>${format(p.usedMs)}</td></tr>`).join('')}</tbody></table><p>${escape($('total').textContent)}</p>${s.run?'<p>An intervention is still running and is not included in this report.</p>':''}`;
 const loaded=await Promise.all([...$('report').querySelectorAll('img')].map(img=>new Promise(resolve=>{let timeout;const done=ok=>{clearTimeout(timeout);img.onload=null;img.onerror=null;if(!ok)img.style.display='none';resolve(ok);};const failed=()=>{if(img.dataset.fallback){const src=img.dataset.fallback;img.alt=img.dataset.fallbackAlt;img.className='report-fallback'+(img.dataset.fallbackDark==='true'?' dark-logo':'');delete img.dataset.fallback;clearTimeout(timeout);timeout=setTimeout(()=>done(false),4000);img.src=src;}else done(false);};img.onload=()=>done(true);img.onerror=failed;timeout=setTimeout(failed,12000);if(img.complete){if(img.naturalWidth>0)done(true);else failed();}})));if(loaded.some(ok=>!ok))$('report').insertAdjacentHTML('beforeend','<p class="report-note">Some images could not be loaded. Names, groups and times remain complete.</p>');
 await document.fonts.ready;window.print();
 }finally{button.disabled=false;button.textContent='Print / PDF';}};
$('clear').onclick=()=>{if(confirm('Export your data before continuing. Clear this meeting and its interventions?')){s={...s,meeting:{},queue:[],history:[],run:null};metadata();resetPhoto();save();}};render();
