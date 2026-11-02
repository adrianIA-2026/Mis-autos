'use strict';
const KEY = 'mis-autos-v1';
const VEHICLES = [{id:'jac',name:'JAC J2',year:2015},{id:'xsara',name:'Citroën Xsara',year:2000,detail:'1.9 Diesel'}];
const TYPES = ['Aceite','Filtros','Reparación','Otro gasto'];
const $ = id => document.getElementById(id);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const number = n => new Intl.NumberFormat('es-UY').format(n);
const money = n => new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU'}).format(n);
const dateText = s => new Date(`${s}T12:00:00`).toLocaleDateString('es-UY');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial = () => ({version:1,vehicles:VEHICLES.map(v=>({id:v.id,km:0})),records:[],reminders:[]});
function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !isNaN(d)&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===s;}
function validate(data){
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x), numeric=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e12;
 const text=x=>typeof x==='string'&&x.length<=5000;
 const vehicle=x=>VEHICLES.some(v=>v.id===x);
 if(!obj(data)||data.version!==1||!Array.isArray(data.vehicles)||data.vehicles.length!==2||!Array.isArray(data.records)||!Array.isArray(data.reminders)||data.records.length>50000||data.reminders.length>10000)throw Error('La copia no tiene un formato compatible con Mis Autos.');
 if(!VEHICLES.every(v=>data.vehicles.filter(x=>obj(x)&&x.id===v.id&&numeric(x.km)&&Number.isInteger(x.km)).length===1))throw Error('El kilometraje de la copia no es válido.');
 for(const list of [data.records,data.reminders]){
  const ids=new Set();for(const x of list){if(!obj(x)||!text(x.id)||!x.id||ids.has(x.id)||!vehicle(x.vehicleId))throw Error('La copia contiene registros no válidos o duplicados.');ids.add(x.id);}
 }
 for(const r of data.records)if(!TYPES.includes(r.type)||!validDate(r.date)||!numeric(r.km)||!Number.isInteger(r.km)||!numeric(r.cost)||!text(r.notes)||r.km>data.vehicles.find(v=>v.id===r.vehicleId).km)throw Error('La copia contiene un mantenimiento no válido.');
 for(const r of data.reminders)if(!text(r.title)||!r.title.trim()||(r.km!==null&&(!numeric(r.km)||!Number.isInteger(r.km)))||(r.date!==null&&!validDate(r.date))||(r.km===null&&r.date===null))throw Error('La copia contiene una alerta no válida.');
 return {version:1,vehicles:data.vehicles.map(v=>({id:v.id,km:v.km})),records:data.records.map(r=>({id:r.id,vehicleId:r.vehicleId,type:r.type,date:r.date,km:r.km,cost:r.cost,notes:r.notes})),reminders:data.reminders.map(r=>({id:r.id,vehicleId:r.vehicleId,title:r.title,km:r.km,date:r.date}))};
}
let state=initial(), selected='jac', blocked=false;
try{const raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));}catch(e){blocked=true;}
function commit(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;blocked=false;render();return true;}catch(e){notify('No se pudo guardar. El almacenamiento está lleno o no está disponible. Exportá tus datos y habilitá el almacenamiento del navegador.');return false;}}
function notify(s){$('status').textContent=s;}
function allowed(){if(blocked){notify('Los datos guardados no se pudieron leer. Exportalos para recuperarlos e importá una copia válida antes de guardar nuevos cambios.');return false;}return true;}
const current=()=>state.vehicles.find(v=>v.id===selected);
function render(){
 $('vehicles').innerHTML=VEHICLES.map(v=>`<button class="vehicle" data-vehicle="${v.id}" aria-pressed="${v.id===selected}"><span class="car-icon" aria-hidden="true"><svg viewBox="0 0 48 40" width="36" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="m8 17 5-11h22l5 11 3 4v11H5V21zM8 17h32M10 32v5h6v-5m16 0v5h6v-5"/><path d="M10 24h7m14 0h7"/></svg></span><span><strong>${v.name}</strong><small>${v.year}${v.detail?' · '+v.detail:''}</small></span></button>`).join('');
 $('km').textContent=`${number(current().km)} km`;
 const records=state.records.filter(r=>r.vehicleId===selected),total=records.reduce((s,r)=>s+r.cost,0);
 $('total').textContent=money(total);$('expense-count').textContent=`${records.length} ${records.length===1?'registro':'registros'} · total histórico`;
 const filtered=records.filter(r=>!$('filter').value||r.type===$('filter').value).sort((a,b)=>b.date.localeCompare(a.date)||b.km-a.km);
 $('records').innerHTML=filtered.length?filtered.map(r=>`<article class="row"><div><h3>${esc(r.type)}</h3><p>${dateText(r.date)} · ${number(r.km)} km</p>${r.notes?`<p>${esc(r.notes)}</p>`:''}</div><div class="row-actions"><span class="amount">${money(r.cost)}</span><button class="delete" data-delete-record="${esc(r.id)}" aria-label="Eliminar registro de ${esc(r.type)} del ${dateText(r.date)}">Eliminar</button></div></article>`).join(''):'<p class="empty">Todavía no hay registros para mostrar.<br>Agregá un mantenimiento o un gasto para comenzar.</p>';
 const reminders=state.reminders.filter(r=>r.vehicleId===selected).map(r=>({...r,due:(r.km!==null&&r.km<=current().km)||(r.date!==null&&r.date<=today())})).sort((a,b)=>Number(b.due)-Number(a.due)||(a.date||'9999').localeCompare(b.date||'9999')||(a.km??Infinity)-(b.km??Infinity));
 $('reminders').innerHTML=reminders.length?reminders.map(r=>`<article class="row"><div><span class="pill ${r.due?'due':''}">${r.due?'Servicio pendiente':'Programado'}</span><h3>${esc(r.title)}</h3>${r.km!==null?`<p>A los ${number(r.km)} km${r.km>current().km?' · faltan '+number(r.km-current().km)+' km':''}</p>`:''}${r.date?`<p>Fecha: ${dateText(r.date)}</p>`:''}</div><button class="delete" data-delete-reminder="${esc(r.id)}" aria-label="Quitar alerta ${esc(r.title)}">Quitar</button></article>`).join(''):'<p class="empty">No hay servicios programados.<br>Creá una alerta por fecha, kilometraje o ambos.</p>';
}
const field=(label,name,type,value='',extra='')=>`<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
let mode='';
function open(modeValue){if(!allowed())return;mode=modeValue;$('form-error').textContent='';
 if(mode==='km'){$('dialog-title').textContent='Actualizar kilometraje';$('fields').innerHTML=field('Kilometraje actual (km)','km','number',current().km,'required min="'+current().km+'" max="1000000000000" step="1" inputmode="numeric"')+'<p class="hint">El kilometraje no puede ser menor al actual.</p>';}
 if(mode==='record'){$('dialog-title').textContent='Agregar registro';$('fields').innerHTML='<label class="field">Tipo de mantenimiento<select name="type">'+TYPES.map(t=>`<option>${t}</option>`).join('')+'</select></label>'+field('Fecha','date','date',today(),`required max="${today()}"`)+field('Kilometraje del servicio (km)','km','number',current().km,'required min="0" max="1000000000000" step="1" inputmode="numeric"')+field('Gasto en pesos uruguayos (UYU)','cost','number','','required min="0" max="1000000000000" step="0.01" inputmode="decimal" placeholder="Ej.: 2500"')+'<label class="field">Detalle (opcional)<textarea name="notes" rows="3" maxlength="5000" placeholder="Aceite utilizado, repuestos, taller…"></textarea></label><p class="hint">Si el servicio tiene más kilómetros que el actual, el kilometraje del vehículo se actualizará.</p>';}
 if(mode==='reminder'){$('dialog-title').textContent='Crear alerta';$('fields').innerHTML=field('Servicio','title','text','','required maxlength="120" placeholder="Ej.: Cambio de aceite y filtro"')+field('Al llegar al kilometraje (opcional)','km','number','','min="0" max="1000000000000" step="1" inputmode="numeric" placeholder="Ej.: 150000"')+field('Fecha límite (opcional)','date','date')+'<p class="hint">Indicá una fecha, un kilometraje o ambos. El aviso aparece al abrir la app cuando se alcanza cualquiera de los límites. No envía notificaciones con la app cerrada.</p>';}
 $('editor').showModal();
}
$('close-dialog').onclick=()=>$('editor').close();
$('add-record').onclick=()=>open('record');$('update-km').onclick=()=>open('km');$('add-reminder').onclick=()=>open('reminder');
$('edit-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),next=structuredClone(state),v=next.vehicles.find(v=>v.id===selected);$('form-error').textContent='';
 if(mode==='km')v.km=Number(f.get('km'));
 if(mode==='record'){next.records.push({id:crypto.randomUUID(),vehicleId:selected,type:f.get('type'),date:f.get('date'),km:Number(f.get('km')),cost:Number(f.get('cost')),notes:f.get('notes').trim()});v.km=Math.max(v.km,Number(f.get('km')));}
 if(mode==='reminder'){const title=f.get('title').trim(),km=f.get('km')===''?null:Number(f.get('km')),date=f.get('date')||null;if(!title||km===null&&date===null){$('form-error').textContent='Escribí un servicio e indicá al menos una fecha o un kilometraje.';return;}next.reminders.push({id:crypto.randomUUID(),vehicleId:selected,title,km,date});}
 try{validate(next);}catch(err){$('form-error').textContent=err.message;return;}
 if(commit(next)){$('editor').close();notify('Guardado en este dispositivo.');}else $('form-error').textContent='No se pudo guardar. Revisá el espacio y los permisos de almacenamiento del navegador.';
};
$('vehicles').onclick=e=>{const b=e.target.closest('[data-vehicle]');if(b){selected=b.dataset.vehicle;$('filter').value='';render();}};
$('filter').onchange=render;
document.addEventListener('click',e=>{const b=e.target.closest('[data-delete-record],[data-delete-reminder]');if(!b||!allowed())return;const record=!!b.dataset.deleteRecord,id=b.dataset.deleteRecord||b.dataset.deleteReminder;if(!confirm(record?'¿Eliminar este registro? Esta acción no se puede deshacer.':'¿Quitar esta alerta? Registrá el mantenimiento por separado si ya lo realizaste.'))return;const next=structuredClone(state),list=record?'records':'reminders';next[list]=next[list].filter(r=>r.id!==id);if(commit(next))notify(record?'Registro eliminado.':'Alerta eliminada.');});
$('export').onclick=()=>{let content=JSON.stringify(state,null,2);if(blocked){try{content=localStorage.getItem(KEY)||content;}catch{notify('No se puede leer el almacenamiento para exportar.');return;}}const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`mis-autos-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Copia descargada. Guardala también fuera del celular.');};
$('import').onclick=()=>$('backup-file').click();
$('backup-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10*1024*1024)throw Error('La copia supera el tamaño máximo de 10 MB.');const next=validate(JSON.parse(await file.text()));if(confirm(`Se reemplazarán los datos de ambos vehículos por esta copia (${next.records.length} registros y ${next.reminders.length} alertas). Exportá primero si querés conservar los datos actuales. ¿Continuar?`)){if(commit(next))notify('Copia importada correctamente.');}}catch(err){notify(err instanceof SyntaxError?'El archivo no es un JSON válido. No se modificaron tus datos.':err.message+' No se modificaron tus datos.');}finally{e.target.value='';}};
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('install').hidden=true;}};
function connectivity(){$('connection').textContent=navigator.onLine?'Guardado en este dispositivo':'Sin conexión · datos locales';}window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);connectivity();render();if(blocked)notify('No pudimos leer tus datos anteriores. No se sobrescribieron: exportalos para recuperarlos o importá una copia válida.');
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async registration=>{await navigator.serviceWorker.ready;$('offline-status').textContent='Disponible sin conexión en este dispositivo.';registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)notify('Hay una versión nueva. Cerrá todas las ventanas de Mis Autos y volvé a abrir la aplicación para actualizar.');});});}).catch(()=>{$('offline-status').textContent='No se pudo preparar el modo sin conexión. Abrí la app con HTTPS o localhost y recargá.';});}else $('offline-status').textContent='Para instalar y usar sin conexión, abrí esta app con Chrome mediante HTTPS.';
