const tg=Telegram.WebApp;tg.ready();tg.expand();const $=i=>document.getElementById(i);
const DEV=new URLSearchParams(location.search).get('dev');
const ST={present:'✅ На уроці',late:'⏰ Спізнююсь',absent:'❌ Не буду',excused:'🤒 Поважна',silent:'… мовчить'};
const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=()=>new Date().toLocaleDateString('sv');
const sh=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return x.toLocaleDateString('sv')};
let me,tab='home',date=iso(),J;
async function A(m,b={}){let r;try{r=await fetch('/api/'+m,{method:'POST',headers:{'X-Init-Data':DEV?'dev:'+DEV:tg.initData},body:JSON.stringify(b)})}catch(x){fail('Немає звʼязку із сервером.');throw 0}
if(r.status==401){fail('Відкрий застосунок із Telegram: кнопка меню біля поля вводу в чаті з ботом.');throw 0}
const j=await r.json();if(j.error){tg.showAlert(j.error);throw 0}return j}
function fail(t){$('v').innerHTML=`<div class=card><b>Не вдалося завантажити</b><br><span class=m>${t}</span></div>`}
function ask(t,f){return new Promise(ok=>{const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:#000b;display:flex;align-items:flex-end;z-index:9';
o.innerHTML=`<div class=card style="width:100%;margin:0"><b>${t}</b>${f.map((x,i)=>`<input id=f${i} placeholder="${x[0]}" type="${x[1]||'text'}">`).join('')}<button id=ok>OK</button><button class=s id=no>Скасувати</button></div>`;
document.body.append(o);o.querySelector('#ok').onclick=()=>{ok(f.map((_,i)=>o.querySelector('#f'+i).value));o.remove()};o.querySelector('#no').onclick=()=>{o.remove();ok(null)}})}
const yes=t=>new Promise(r=>tg.showConfirm(t,r));
async function go(t){try{await go0(t)}catch(x){if(x!==0){console.error(x);fail('Помилка: '+x)}}}
async function go0(t){tab=t||tab;me=await A('me');$('hd').innerHTML=`<b>🎓 Староста</b><span class=m>${e(me.group||'')} · ${e(me.name)}</span>`;
$('n').innerHTML=[['home','🏠 Головна'],['sch','📅 Розклад'],['cls','👥 Клас']].map(x=>`<b class="${tab==x[0]?'on':''}" onclick="go('${x[0]}')">${x[1]}</b>`).join('');
if(!me.group){$('v').innerHTML=`<div class=card><b>Ти ще не в класі</b><br><span class=m>Щоб потрапити в клас, відкрий посилання-запрошення від старости.${me.canCreate?'<br>Якщо ти староста, напиши боту /start і натисни «Створити клас».':''}</span></div>`;return}
await({home,sch,cls}[tab])()}
function mv(n){date=sh(date,n);go()}
async function home(){const d=await A('day',{date}),a=await A('ann');
let h=me.pend?`<div class=card><b>Тебе обрано старостою</b><br><button onclick="acc()">🎓 Прийняти старосту</button></div>`:'';
h+=`<div class=row><button class=s onclick="mv(-1)">‹</button><b>${new Date(date+'T12:00').toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'})}${d.week?' · '+d.week+' тиждень':''}</b><button class=s onclick="mv(1)">›</button></div>`;
if(!d.lessons.length)h+='<div class="card m">Уроків немає</div>';
for(const l of d.lessons){const c=l.c;h+=`<div class=card><div class=row><b>${l.num?l.num+'. ':''}${l.st} ${e(l.subj)}${l.state=='moved'?' 🔁':''}</b><span class=m>${e(l.room)}</span></div>`+
(l.state=='cancel'?'<div class=rr>Урок скасовано</div>':`<div class=m>✅${c.present} ⏰${c.late} ❌${c.absent} 🤒${c.excused} · мовчать ${c.silent}</div>`)+
l.hw.map(x=>`<div class=y>📝 ${e(x)}</div>`).join('')+
(l.state!='cancel'?['present','late','absent'].map(s=>`<button class="${l.my==s?'':'s'}" onclick="my(${l.id},'${s}')">${ST[s]}</button>`).join(''):'')+
(me.staff?`<div><button class=s onclick="jr(${l.id})">📋 Журнал</button><button class=s onclick="ov(${l.id},'move')">🔁 Перенести</button><button class=s onclick="ov(${l.id},'cancel')">🚫 Скасувати</button>${l.state!='ok'?`<button class=s onclick="ov(${l.id},'reset')">↩︎</button>`:''}<button class=s onclick="hwa(${l.id})">📝 ДЗ</button></div>`:'')+`</div>`}
h+='<h3>Оголошення</h3>'+(me.staff?'<button onclick="ana()">+ Оголошення</button>':'')+a.a.map(x=>`<div class=card><b>${e(x.title)}</b><br>${e(x.text)}</div>`).join('');$('v').innerHTML=h}
const my=async(lid,status)=>{await A('mine',{lid,date,status});go()};
async function acc(){await A('accept');go()}
async function ov(lid,kind){let b={lid,date,kind};if(kind=='move'){const r=await ask('Новий час',[['Початок','time'],['Кінець','time']]);if(!r||!r[0])return;b.ns=r[0];b.ne=r[1]||null}await A('ovr',b);go()}
async function hwa(lid){const r=await ask('Домашнє завдання',[['Що задали']]);if(r&&r[0]){await A('hw',{lid,date,text:r[0]});go()}}
async function ana(){const r=await ask('Нове оголошення',[['Заголовок'],['Текст']]);if(r&&r[0]){await A('ann_add',{title:r[0],text:r[1]});go()}}
async function jr(lid){J=lid;const r=await A('journal',{lid,date});$('v').innerHTML=`<button class=s onclick="go()">‹ Назад</button><div class=m>Тапни учня, щоб змінити статус</div>`+r.s.map(s=>`<div class="card row" onclick="cyc(${s.id},'${s.st}')"><span>${e(s.name)}</span><span>${ST[s.st]}</span></div>`).join('')}
async function cyc(uid,s){const O=['present','late','absent','excused'];await A('setmark',{lid:J,date,uid,status:O[(O.indexOf(s)+1)%4]});jr(J)}
const WD=['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
let LS;
const WDF=['Понеділок','Вівторок','Середа','Четвер','Пʼятниця','Субота','Неділя'];
async function sch(){LS=await A('lessons');const r=LS;let h='';
if(me.staff)h+=`<div class=card><b>Налаштування</b><div class=m>${r.two?'Двотижневий розклад. Зараз '+r.week+' тиждень':'Однотижневий розклад'}</div><button class=s onclick="wkset()">🔁 Тижні</button><button class=s onclick="bl()">⏰ Дзвінки</button></div><div>${WD.map((x,i)=>`<button class=s onclick="de(${i})">✏️ ${x}</button>`).join('')}</div>`;
for(let i=0;i<7;i++){const L=r.l.filter(x=>x.wd==i);if(!L.length)continue;h+=`<h3>${WDF[i]}</h3>`;
const ns=[...new Set(L.map(x=>x.num))].sort((a,b)=>a-b);
h+=ns.map(n=>{const o=L.filter(x=>x.num==n),t=r.bells[n-1]?r.bells[n-1].join('–'):'',f=x=>e(x.subj)+(x.room?` <span class=m>(каб. ${e(x.room)})</span>`:'');
return `<div class=card><span class=m>${n} урок · ${t}</span><br>${o.length==1&&o[0].wk==0?f(o[0]):o.map(x=>x.wk+' тиж.: '+f(x)).join('<br>')}</div>`}).join('')}
$('v').innerHTML=h||'<div class="card m">Розклад порожній</div>'}
function de(wd){const r=LS,n=r.bells.length;let h=`<button class=s onclick="go()">‹ Назад</button><h3>${WDF[wd]}</h3><div class=m>Впиши предмет і кабінет для кожного уроку. Порожньо — уроку немає.${r.two?' Зніми галочку «однаково», щоб вписати окремо 1 і 2 тиждень.':''}</div>`;
for(let i=1;i<=n;i++){const o=r.l.filter(x=>x.wd==wd&&x.num==i),a=o.find(x=>x.wk==0)||o.find(x=>x.wk==1)||{},b=o.find(x=>x.wk==2)||{},same=!o.some(x=>x.wk>0);
h+=`<div class=card><b>${i} урок</b> <span class=m>${r.bells[i-1].join('–')}</span><input id=s1_${i} placeholder="${r.two?'Предмет (1 тиждень)':'Предмет'}" value="${e(a.subj)}"><input id=r1_${i} placeholder="Кабінет" value="${e(a.room)}">`+
(r.two?`<label class=m><input type=checkbox id=sm_${i} ${same?'checked':''} onchange="$('w2_${i}').style.display=this.checked?'none':'block'" style="width:auto"> однаково на обох тижнях</label><div id=w2_${i} style="display:${same?'none':'block'}"><input id=s2_${i} placeholder="Предмет (2 тиждень)" value="${e(b.subj)}"><input id=r2_${i} placeholder="Кабінет (2 тиждень)" value="${e(b.room)}"></div>`:'')+`</div>`}
$('v').innerHTML=h+`<button onclick="dsv(${wd},${n})">Зберегти</button>`}
async function dsv(wd,n){const v=i=>$(i)?$(i).value:'';const rows=[];for(let i=1;i<=n;i++)rows.push({n:i,s1:v('s1_'+i),r1:v('r1_'+i),same:$('sm_'+i)?$('sm_'+i).checked:true,s2:v('s2_'+i),r2:v('r2_'+i)});await A('day_save',{wd,rows});tg.showAlert('Збережено ✅');go()}
const rd=()=>LS.bells.map((_,i)=>[$('bs'+i).value,$('be'+i).value]);
function bl(){$('v').innerHTML=`<button class=s onclick="go()">‹ Назад</button><h3>Дзвінки</h3>`+LS.bells.map((x,i)=>`<div class="card row"><b>${i+1}</b><input type=time id=bs${i} value="${x[0]}"><input type=time id=be${i} value="${x[1]}"></div>`).join('')+`<button class=s onclick="LS.bells=rd();LS.bells.push(['','']);bl()">+ урок</button><button onclick="bsv()">Зберегти</button>`}
async function bsv(){await A('bells_set',{bells:rd()});tg.showAlert('Збережено ✅');go()}
async function wkset(){if(!await yes('Увімкнути розклад на 2 тижні? «Скасувати» — вимкне і лишить один тиждень.')){await A('weeks_set',{two:0});return go()}
const r=await ask('Який тиждень зараз? (1 або 2)',[['1 або 2','number']]);await A('weeks_set',{two:1,cur:r&&r[0]==2?2:1});go()}
async function cls(){const r=await A('students');let h='';
if(me.st){h+=`<div class=card><b>Керування</b><div class=m>Запрошення: ${e(me.link)}</div>
<button class=s onclick="navigator.clipboard.writeText('${me.link}')">Копіювати посилання</button>
<button class=s onclick="rl('st_ill',${!me.st_ill})">${me.st_ill?'💪 Я одужав':'🤒 Я захворів'}</button>
${me.hasdep?`<button class=s onclick="rl('dep_ill',${!me.dep_ill})">${me.dep_ill?'💪 Заступник одужав':'🤒 Заступник захворів'}</button>`:''}
${me.vote?'<button class=s onclick="A(\'vote_end\').then(()=>go())">⏹ Завершити голосування</button>':'<button class=r onclick="fin()">🏁 Закінчити бути старостою</button>'}</div>`}
h+=r.s.map(s=>`<div class="card row" ${me.st&&s.role!='starosta'?`onclick="act(${s.id},'${s.role}','${e(s.name).replace(/'/g,'')}')"`:''}><span>${e(s.name)} <span class=m>${{starosta:'🎓 староста',deputy:'⭐ заступник',temp:'⭐ тимч. заступник',student:''}[s.role]}</span></span><span class="${s.risk==2?'rr':'y'}">${s.risk?'⚠️ ':''}${s.abs!=null?s.abs+' пр.':''}</span></div>`).join('');$('v').innerHTML=h}
async function rl(a,on,uid){await A('roles',{a,on,uid});go()}
async function fin(){if(await yes('Закінчити бути старостою? Усім учням прийде голосування за нового старосту.')){await A('finish');go()}}
function act(uid,r,name){const b=[];if(r=='temp')b.push({id:'tmp_clear',type:'default',text:'Зняти тимчасового'});else{b.push({id:'dep',type:'default',text:'Зробити заступником'});if(me.dep_ill||!me.hasdep)b.push({id:'tmp',type:'default',text:'Тимчасовий заступник'})}
b.push({type:'cancel'});tg.showPopup({message:name,buttons:b},async id=>{if(id){await A('roles',{a:id,uid});go()}})}
go();
