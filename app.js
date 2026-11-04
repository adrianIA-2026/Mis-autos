'use strict';
const {TYPES,STATUSES,initial,validate,snapshot,defaultParts}=MisAutosCore;
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const number=n=>new Intl.NumberFormat('es-UY').format(n);
const money=n=>new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU'}).format(n);
const dateText=s=>new Date(`${s}T12:00:00`).toLocaleDateString('es-UY');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=initial(),selected='jac',partId='',revision=0,blocked=true,busy=true,mode='',editingId=null,installId=null;
const current=()=>state.vehicles.find(v=>v.id===selected);
const notify=s=>{$('status').textContent=s;};
function allowed(){if(blocked){notify('No se pueden modificar los datos. Exportá una copia de recuperación o importá una copia válida; no se borró el almacenamiento anterior.');return false;}return true;}
async function commit(next){
 try{const clean=validate(next);revision=await MisAutosStore.write(clean,revision);state=clean;blocked=false;if(mode==='add-vehicle'&&$('editor').open){selected=state.vehicles[state.vehicles.length-1].id;partId='';$('filter').value='';}render();return true;}
 catch(error){notify(`No se guardaron los cambios. ${error.message} Si falta espacio, exportá una copia antes de liberar almacenamiento.`);return false;}
}
function photoHtml(r){return r.photo?`<img class="part-photo" src="${r.photo}" alt="Foto de ${esc(r.brand)} ${esc(r.code)}" loading="lazy">`:'<div class="no-photo">Fotografía pendiente</div>';}
function sourceHtml(s){try{const u=new URL(s);if(['https:','http:'].includes(u.protocol))return `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(s)}</a><span class="hint"> (abrir requiere conexión)</span>`;}catch{}return esc(s||'Fuente pendiente');}
function refDetails(r){return `<dl class="ref-details"><dt>Especificaciones</dt><dd>${esc(r.specs||'Pendientes')}</dd><dt>Aplicación exacta</dt><dd>${esc(r.applicability||'Medidas o normas de uso pendientes de confirmar')}</dd><dt>Fuente de verificación</dt><dd>${sourceHtml(r.source)}</dd><dt>Fundamento de compatibilidad</dt><dd>${esc(r.verificationNotes||'Pendiente de verificar')}${r.verifiedAt?' · '+dateText(r.verifiedAt):''}</dd><dt>Precio de referencia</dt><dd>${r.price===null?'Sin precio':money(r.price)}</dd><dt>Observaciones</dt><dd>${esc(r.notes||'Sin observaciones')}</dd><dt>Origen de la fotografía</dt><dd>${esc(r.photoSource||'No indicado')}</dd></dl>`;}
function render(){
 if(!state.vehicles.some(v=>v.id===selected)){selected=state.vehicles[0].id;partId='';}
 $('vehicles').innerHTML=state.vehicles.map(v=>`<button class="vehicle" data-vehicle="${v.id}" aria-pressed="${v.id===selected}"><span class="car-icon" aria-hidden="true"><svg viewBox="0 0 48 40" width="36" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="m8 17 5-11h22l5 11 3 4v11H5V21zM8 17h32M10 32v5h6v-5m16 0v5h6v-5"/><path d="M10 24h7m14 0h7"/></svg></span><span><strong>${esc(v.name)}</strong><small>${esc([v.year,v.detail].filter(x=>x!==null&&x!=='').join(' · '))}</small></span></button>`).join('');
 $('km').textContent=`${number(current().km)} km`;
 const records=state.records.filter(r=>r.vehicleId===selected);
 $('total').textContent=money(records.reduce((s,r)=>s+r.cost,0));$('expense-count').textContent=`${records.length} ${records.length===1?'registro':'registros'} · total histórico`;
 const filtered=records.filter(r=>!$('filter').value||r.type===$('filter').value).sort((a,b)=>b.date.localeCompare(a.date)||b.km-a.km);
 $('records').innerHTML=filtered.length?filtered.map(r=>`<article class="history-item"><div class="row"><div><h3>${esc(r.type)}</h3><p>${dateText(r.date)} · ${number(r.km)} km</p>${r.notes?`<p>${esc(r.notes)}</p>`:''}</div><div class="row-actions"><span class="amount">${money(r.cost)}</span><button class="delete" data-delete-record="${esc(r.id)}" aria-label="Eliminar registro de ${esc(r.type)} del ${dateText(r.date)}">Eliminar</button></div></div>${r.installedParts.length?`<details class="installed"><summary>Repuestos instalados (${r.installedParts.length})</summary>${r.installedParts.map(p=>`<article class="installed-snapshot"><h4>${esc(p.partName)} · ${esc(p.brand)} ${esc(p.code)}</h4><span class="pill ${p.status==='incompatible'?'bad':p.status==='pending'?'due':''}">${STATUSES[p.status]} al registrarlo</span>${photoHtml(p)}${refDetails(p)}</article>`).join('')}<p class="hint">Copia de los datos al registrar la instalación. Se conserva aunque después edites o elimines la referencia del catálogo.</p></details>`:''}<button class="secondary" data-link-record="${esc(r.id)}">Vincular repuesto instalado</button></article>`).join(''):'<p class="empty">Todavía no hay registros para mostrar.<br>Agregá un mantenimiento o un gasto para comenzar.</p>';
 const reminders=state.reminders.filter(r=>r.vehicleId===selected).map(r=>({...r,due:(r.km!==null&&r.km<=current().km)||(r.date!==null&&r.date<=today())})).sort((a,b)=>Number(b.due)-Number(a.due)||(a.date||'9999').localeCompare(b.date||'9999')||(a.km??Infinity)-(b.km??Infinity));
 $('reminders').innerHTML=reminders.length?reminders.map(r=>`<article class="row"><div><span class="pill ${r.due?'due':''}">${r.due?'Servicio pendiente':'Programado'}</span><h3>${esc(r.title)}</h3>${r.km!==null?`<p>A los ${number(r.km)} km${r.km>current().km?' · faltan '+number(r.km-current().km)+' km':''}</p>`:''}${r.date?`<p>Fecha: ${dateText(r.date)}</p>`:''}</div><button class="delete" data-delete-reminder="${esc(r.id)}" aria-label="Quitar alerta ${esc(r.title)}">Quitar</button></article>`).join(''):'<p class="empty">No hay servicios programados.<br>Creá una alerta por fecha, kilometraje o ambos.</p>';
 renderCatalog();
 renderList();
}
function renderCatalog(){
 const parts=state.parts.filter(p=>p.vehicleId===selected);if(!parts.some(p=>p.id===partId))partId=parts[0]?.id||'';
 $('part-select').innerHTML=parts.map(p=>`<option value="${esc(p.id)}" ${p.id===partId?'selected':''}>${esc(p.name)}</option>`).join('');$('add-reference').disabled=!partId||blocked;
 const refs=state.references.filter(r=>r.vehicleId===selected&&r.partId===partId),confirmed=refs.filter(r=>r.status==='verified');
 $('catalog-summary').textContent=`${refs.length} ${refs.length===1?'referencia':'referencias'} · ${refs.filter(r=>r.status==='verified').length} verificadas · ${refs.filter(r=>r.status==='pending').length} pendientes`;
 const slots=['OEM','Equivalente','Equivalente'];let equivalentIndex=0;
 $('initial-slots').innerHTML=slots.map((kind,i)=>{const ref=kind==='OEM'?confirmed.find(r=>r.kind==='OEM'):confirmed.filter(r=>r.kind==='Equivalente')[equivalentIndex++];return ref?'':`<div class="pending-slot"><strong>${i===0?'Original o producto según manual':`Alternativa ${i}`}</strong><span>Pendiente de verificar</span><small>Sin código confirmado</small></div>`;}).join('');
 $('references').innerHTML=refs.map(r=>`<article class="reference-card"><div class="reference-heading">${photoHtml(r)}<div><span class="pill ${r.status==='incompatible'?'bad':r.status==='pending'?'due':''}">${STATUSES[r.status]}</span><h3>${esc(r.brand)} <span class="code">${esc(r.code)}</span></h3><p class="hint">${r.status==='verified'?(r.kind==='OEM'?'Original OEM':`Alternativa ${confirmed.filter(x=>x.kind==='Equivalente').findIndex(x=>x.id===r.id)+1}`):r.kind} · ${r.origin==='user'?'Agregada por vos; verificación declarada por el usuario':'Precarga con fuente documentada'}</p></div></div>${refDetails(r)}<div class="actions"><button class="secondary" data-edit-ref="${esc(r.id)}">${r.origin==='user'?'Editar referencia':'Cambiar estado'}</button>${r.origin==='user'?`<button class="delete" data-delete-ref="${esc(r.id)}">Eliminar referencia</button>`:''}<button data-install-ref="${esc(r.id)}" ${r.status==='incompatible'?'disabled':''}>Registrar instalación</button></div></article>`).join('');
}
function componentPictures(part){
 const own=(part.photos||[]).map(photo=>({photo,caption:'Foto del componente'}));
 const references=state.references.filter(r=>r.vehicleId===selected&&r.partId===part.id&&r.photo&&r.status!=='incompatible').map(r=>({photo:r.photo,caption:`${r.brand} ${r.code} · ${STATUSES[r.status]}`}));
 const history=state.records.filter(r=>r.vehicleId===selected).flatMap(r=>r.installedParts.filter(p=>p.partId===part.id&&p.photo&&p.status!=='incompatible').map(p=>({photo:p.photo,caption:`Instalado · ${p.brand} ${p.code}`})));
 const seen=new Set(own.map(p=>p.photo));return [...own,...[...references,...history].filter(p=>{if(seen.has(p.photo))return false;seen.add(p.photo);return true;})].slice(0,3);
}
function componentReferences(part){
 const refs=state.references.filter(r=>r.vehicleId===selected&&r.partId===part.id&&r.status==='verified');
 const alternatives=refs.filter(r=>r.kind==='Equivalente');
 return [refs.find(r=>r.kind==='OEM'),...Array.from({length:Math.max(2,alternatives.length)},(_,i)=>alternatives[i])];
}
function renderList(){
 const opened=new Set([...document.querySelectorAll('#component-list details.component-item[open]')].map(d=>d.dataset.component));
 $('component-list').innerHTML=state.parts.filter(p=>p.vehicleId===selected).map(p=>{
  const refs=componentReferences(p);const pictures=componentPictures(p);
  return `<details class="component-item" data-component="${esc(p.id)}" ${opened.has(p.id)?'open':''}><summary>${esc(p.name)}</summary><div class="component-references">${refs.map((r,i)=>{
   const title=i===0?'Original OEM':`Alternativa ${i}`;
   if(!r)return `<article class="component-reference pending-reference"><h3>${title}</h3><p>Pendiente de verificar</p><p class="hint">Sin código confirmado</p></article>`;
   return `<article class="component-reference"><h3>${title}</h3><span class="pill ${r.status==='pending'?'due':''}">${STATUSES[r.status]}</span><p class="reference-brand">${esc(r.brand)}</p><p class="code">${esc(r.code)}</p>${r.photo?`<button class="photo-button" data-view-reference="${esc(r.id)}" aria-label="Ampliar foto de ${esc(r.brand)} ${esc(r.code)}"><img src="${r.photo}" alt="${esc(r.brand)} ${esc(r.code)}" loading="lazy"></button>`:'<div class="no-photo">Sin foto de esta referencia</div>'}</article>`;
  }).join('')}</div><p class="hint">Solo las referencias marcadas como Verificado tienen compatibilidad declarada. Una foto o una instalación no la confirman.</p><details class="component-personal-photos"><summary>Fotos propias del componente</summary><div class="component-gallery">${[0,1,2].map(i=>pictures[i]?`<figure><button class="photo-button" data-view-part="${esc(p.id)}" data-view-index="${i}" aria-label="Ampliar foto ${i+1} de ${esc(p.name)}"><img src="${pictures[i].photo}" alt="${esc(p.name)} · foto ${i+1}" loading="lazy"></button><figcaption>${esc(pictures[i].caption)}</figcaption></figure>`:`<div class="empty-photo">Foto ${i+1}<small>Sin foto todavía</small></div>`).join('')}</div><button class="secondary" data-component-photos="${esc(p.id)}">Agregar o cambiar fotos</button></details></details>`;
 }).join('')||'<p class="empty">Todavía no hay componentes catalogados para este vehículo.</p>';
}
const field=(label,name,type,value='',extra='')=>`<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const area=(label,name,value='')=>`<label class="field">${label}<textarea name="${name}" rows="3" maxlength="5000">${esc(value)}</textarea></label>`;
function installationFields(preselected=null,existing=[]){const excluded=new Set(existing.map(r=>r.id));const refs=state.references.filter(r=>r.vehicleId===selected&&r.status!=='incompatible'&&!excluded.has(r.id));return `<fieldset class="install-options"><legend>Repuestos instalados realmente (opcional)</legend><p class="hint">Seleccioná los que colocaste. Elegir una referencia no confirma su compatibilidad ni agrega automáticamente su precio al gasto.</p>${refs.length?refs.map(r=>`<label class="check-option"><input type="checkbox" name="installed" value="${esc(r.id)}" ${r.id===preselected?'checked':''}><span>${esc(state.parts.find(p=>p.id===r.partId).name)} · <strong>${esc(r.brand)} ${esc(r.code)}</strong><small>${STATUSES[r.status]}</small></span></label>`).join(''):'<p class="hint">Agregá referencias en el catálogo para seleccionarlas aquí.</p>'}</fieldset>`;}
function open(modeValue,id=null){if(!allowed()||busy)return;mode=modeValue;editingId=id;installId=mode==='record'?id:null;$('form-error').textContent='';
 if(mode==='add-vehicle'||mode==='edit-vehicle'){
  const vehicle=mode==='edit-vehicle'?current():null;$('dialog-title').textContent=vehicle?'Editar vehículo':'Agregar vehículo';
  $('fields').innerHTML=field('Nombre del vehículo','vehicleName','text',vehicle?.name||'','required maxlength="120" placeholder="Ej.: Citroën C3"')+field('Año (opcional)','vehicleYear','number',vehicle?.year??'','min="1886" max="2200" step="1" inputmode="numeric"')+field('Versión o combustible (opcional)','vehicleDetail','text',vehicle?.detail||'','maxlength="500" placeholder="Ej.: Nafta"')+(vehicle?'':field('Kilometraje inicial (km)','vehicleKm','number',0,'required min="0" max="1000000000000" step="1" inputmode="numeric"'));
 }
 if(mode==='km'){$('dialog-title').textContent='Actualizar kilometraje';$('fields').innerHTML=field('Kilometraje actual (km)','km','number',current().km,`required min="${current().km}" max="1000000000000" step="1" inputmode="numeric"`)+'<p class="hint">El kilometraje no puede ser menor al actual.</p>';}
 if(mode==='record'){$('dialog-title').textContent='Agregar registro';$('fields').innerHTML='<label class="field">Tipo de mantenimiento<select name="type">'+TYPES.map(t=>`<option>${t}</option>`).join('')+'</select></label>'+field('Fecha','date','date',today(),`required max="${today()}"`)+field('Kilometraje del servicio (km)','km','number',current().km,'required min="0" max="1000000000000" step="1" inputmode="numeric"')+field('Gasto total en pesos uruguayos (UYU)','cost','number','','required min="0" max="1000000000000" step="0.01" inputmode="decimal" placeholder="Ej.: 2500"')+area('Detalle (opcional)','notes')+installationFields(installId)+'<p class="hint">Si el servicio tiene más kilómetros que el actual, el kilometraje del vehículo se actualizará.</p>';}
 if(mode==='reminder'){$('dialog-title').textContent='Crear alerta';$('fields').innerHTML=field('Servicio','title','text','','required maxlength="120" placeholder="Ej.: Cambio de aceite y filtro"')+field('Al llegar al kilometraje (opcional)','km','number','','min="0" max="1000000000000" step="1" inputmode="numeric"')+field('Fecha límite (opcional)','date','date')+'<p class="hint">Indicá una fecha, un kilometraje o ambos. El aviso aparece al abrir la app cuando se alcanza cualquiera de los límites.</p>';}
 if(mode==='part'){$('dialog-title').textContent='Agregar repuesto';$('fields').innerHTML=field('Nombre del repuesto','name','text','','required maxlength="120" placeholder="Ej.: Amortiguador delantero"');}
 if(mode==='link') {const record=state.records.find(r=>r.id===id&&r.vehicleId===selected);if(!record)return;$('dialog-title').textContent='Vincular repuesto al historial';$('fields').innerHTML=`<p class="hint">Servicio del ${dateText(record.date)} · ${number(record.km)} km. El gasto guardado no se modifica.</p>`+installationFields(null,record.installedParts);}
 if(mode==='part-photos'){
  const part=state.parts.find(p=>p.id===id&&p.vehicleId===selected);if(!part)return;
  $('dialog-title').textContent=part.name;
  $('fields').innerHTML=[0,1,2].map(i=>`<div class="component-photo-field">${part.photos?.[i]?`<img class="part-photo" src="${part.photos[i]}" alt="Foto ${i+1} de ${esc(part.name)}"><label class="check-option"><input type="checkbox" name="removePhoto${i}">Quitar foto ${i+1}</label>`:''}<label class="field">Foto ${i+1}<input name="componentPhoto${i}" type="file" accept="image/jpeg,image/png,image/webp"></label></div>`).join('');
 }
 if(mode==='reference')referenceForm(id);
 $('editor').showModal();
}
function referenceForm(id){
 const r=state.references.find(r=>r.id===id&&r.vehicleId===selected);const locked=r?.origin==='seed';
 $('dialog-title').textContent=r?'Editar referencia':'Agregar homólogo';
 if(!r){
  $('fields').innerHTML=field('Marca','brand','text','','required maxlength="120"')+field('Código','code','text','','required maxlength="120"')+'<label class="field">Foto<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>';
  return;
 }

 $('fields').innerHTML=
 field('Marca','brand','text',r.brand,`required maxlength="120" ${locked?'readonly':''}`)+field('Código completo','code','text',r.code,`required maxlength="120" ${locked?'readonly':''}`)+
 `<label class="field">Tipo de referencia<select name="kind" aria-label="Tipo de referencia" ${locked?'disabled':''}>${['Equivalente','OEM'].map(k=>`<option ${r.kind===k?'selected':''}>${k}</option>`).join('')}</select></label><label class="field">Estado<select name="status" aria-label="Estado">${Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${r.status===k?'selected':''}>${v}</option>`).join('')}</select></label>`+
 field('Fecha de verificación','verifiedAt','date',r.verifiedAt||'',`max="${today()}"`)+field('Precio en pesos uruguayos','price','number',r.price??'','min="0" max="1000000000000" step="0.01" inputmode="decimal"')+area('Observaciones','notes',r.notes)+
 `<fieldset class="photo-fields"><legend>Fotografía</legend>${r.photo?photoHtml(r)+'<label class="check-option"><input type="checkbox" name="removePhoto">Quitar fotografía actual</label>':''}<input type="file" name="photo" aria-label="Fotografía" accept="image/jpeg,image/png,image/webp"></fieldset>`;

}
async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Elegí una foto JPEG, PNG o WebP.');
 if(file.size>25*1024*1024)throw Error('La foto supera 25 MB. Elegí una más pequeña.');
 const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();if(image.width*image.height>64000000)throw Error('La imagen es demasiado grande. Elegí una de menor resolución.');const ratio=Math.min(1,960/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',0.82);}catch(error){throw Error('No se pudo leer la fotografía. Usá una imagen JPEG, PNG o WebP de menor tamaño.');}finally{URL.revokeObjectURL(url);}
}
$('toggle-list').onclick=()=>{const expanded=$('toggle-list').getAttribute('aria-expanded')!=='true';$('toggle-list').setAttribute('aria-expanded',String(expanded));$('list-content').hidden=!expanded;$('list-indicator').textContent=expanded?'−':'＋';};
$('close-photo').onclick=()=>$('photo-viewer').close();
$('close-dialog').onclick=()=>{if(!busy)$('editor').close();};$('editor').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('add-vehicle').onclick=()=>open('add-vehicle');$('edit-vehicle-name').onclick=()=>open('edit-vehicle');
$('add-record').onclick=()=>open('record');$('update-km').onclick=()=>open('km');$('add-reminder').onclick=()=>open('reminder');$('add-part').onclick=()=>open('part');$('add-reference').onclick=()=>open('reference');
$('edit-form').onsubmit=async e=>{
 e.preventDefault();if(busy||!allowed())return;busy=true;const saveButton=e.target.querySelector('[type=submit]');saveButton.disabled=true;const f=new FormData(e.target),next=structuredClone(state),v=next.vehicles.find(v=>v.id===selected);$('form-error').textContent='';
 try{
  if(mode==='add-vehicle'||mode==='edit-vehicle'){
   const name=f.get('vehicleName').trim(),year=f.get('vehicleYear')===''?null:Number(f.get('vehicleYear')),detail=f.get('vehicleDetail').trim();
   if(mode==='add-vehicle'){const vehicle={id:crypto.randomUUID(),name,year,detail,km:Number(f.get('vehicleKm')),engineCode:'',variant:''};next.vehicles.push(vehicle);next.parts.push(...defaultParts([vehicle]));}
   else Object.assign(v,{name,year,detail});
  }
  if(mode==='km')v.km=Number(f.get('km'));
  if(mode==='part'){const name=f.get('name').trim();if(!name)throw Error('Escribí el nombre del repuesto.');partId=crypto.randomUUID();next.parts.push({id:partId,vehicleId:selected,name});}
  if(mode==='part-photos'){
   const part=next.parts.find(p=>p.id===editingId&&p.vehicleId===selected);if(!part)throw Error('El componente ya no existe.');
   const photos=[];for(let i=0;i<3;i++){const file=f.get(`componentPhoto${i}`);const photo=file?.size?await preparePhoto(file):f.has(`removePhoto${i}`)?null:part.photos?.[i]||null;if(photo)photos.push(photo);}part.photos=photos;
  }
  if(mode==='record'||mode==='link'){
   const installedParts=f.getAll('installed').map(id=>snapshot(state,id,selected));
   if(mode==='link'&&!installedParts.length)throw Error('Seleccioná al menos un repuesto instalado.');
   if(installedParts.some(r=>r.status==='pending')&&!confirm('Seleccionaste una referencia pendiente de verificar. ¿Confirmás que se instaló realmente? Su compatibilidad seguirá pendiente.'))return;
   if(mode==='record'){next.records.push({id:crypto.randomUUID(),vehicleId:selected,type:f.get('type'),date:f.get('date'),km:Number(f.get('km')),cost:Number(f.get('cost')),notes:f.get('notes').trim(),installedParts});v.km=Math.max(v.km,Number(f.get('km')));}
   else {const record=next.records.find(r=>r.id===editingId&&r.vehicleId===selected);if(!record)throw Error('El mantenimiento ya no existe.');record.installedParts.push(...installedParts);}
  }
  if(mode==='reminder'){const title=f.get('title').trim(),km=f.get('km')===''?null:Number(f.get('km')),date=f.get('date')||null;if(!title||km===null&&date===null)throw Error('Escribí un servicio e indicá al menos una fecha o un kilometraje.');next.reminders.push({id:crypto.randomUUID(),vehicleId:selected,title,km,date});}
  if(mode==='reference'){
   const previous=state.references.find(r=>r.id===editingId&&r.vehicleId===selected);const file=[f.get('photo'),f.get('camera'),f.get('gallery')].find(file=>file?.size);const photo=file?await preparePhoto(file):f.has('removePhoto')?null:previous?.photo||null;
   const ref={id:previous?.id||crypto.randomUUID(),vehicleId:selected,partId:previous?.partId||partId,origin:previous?.origin||'user',kind:previous?.origin==='seed'?previous.kind:f.get('kind')||'Equivalente',brand:f.get('brand').trim(),code:f.get('code').trim(),status:f.get('status')||'pending',photo,price:!f.has('price')||f.get('price')===''?null:Number(f.get('price')),verifiedAt:f.get('verifiedAt')||null};
   ref.notes=(f.get('notes')||'').trim();
   for(const key of ['specs','source','verificationNotes','applicability','photoSource'])ref[key]=previous?.[key]||'';
   if(!ref.brand||!ref.code)throw Error('Completá la marca y el código completo.');
   const index=next.references.findIndex(r=>r.id===ref.id);if(index===-1)next.references.push(ref);else next.references[index]=ref;
  }
  validate(next);if(await commit(next)){$('editor').close();notify('Guardado en este dispositivo.');navigator.storage?.persist?.().catch(()=>{});}else $('form-error').textContent=$('status').textContent;
 }catch(error){$('form-error').textContent=error.message;}finally{busy=false;saveButton.disabled=false;}
};
$('vehicles').onclick=e=>{const b=e.target.closest('[data-vehicle]');if(b&&!busy){selected=b.dataset.vehicle;partId='';$('filter').value='';render();}};
$('filter').onchange=render;$('part-select').onchange=e=>{partId=e.target.value;renderCatalog();};
document.addEventListener('click',async e=>{
 const gallery=e.target.closest('[data-component-photos]');if(gallery){open('part-photos',gallery.dataset.componentPhotos);return;}
 const referencePhoto=e.target.closest('[data-view-reference]');if(referencePhoto){const r=state.references.find(r=>r.id===referencePhoto.dataset.viewReference&&r.vehicleId===selected);if(!r?.photo)return;$('large-photo').src=r.photo;$('large-photo').alt=`${r.brand} ${r.code}`;$('photo-caption').textContent=`${r.brand} ${r.code} · ${STATUSES[r.status]}`;$('photo-viewer').showModal();return;}
 const view=e.target.closest('[data-view-part]');if(view){const part=state.parts.find(p=>p.id===view.dataset.viewPart&&p.vehicleId===selected);if(!part)return;const picture=componentPictures(part)[Number(view.dataset.viewIndex)];if(!picture)return;$('large-photo').src=picture.photo;$('large-photo').alt=part.name;$('photo-caption').textContent=`${part.name} · ${picture.caption}`;$('photo-viewer').showModal();return;}
 const edit=e.target.closest('[data-edit-ref],[data-install-ref],[data-link-record]');if(edit){if(edit.dataset.editRef)open('reference',edit.dataset.editRef);if(edit.dataset.installRef)open('record',edit.dataset.installRef);if(edit.dataset.linkRecord)open('link',edit.dataset.linkRecord);return;}
 const b=e.target.closest('[data-delete-record],[data-delete-reminder],[data-delete-ref]');if(!b||busy||!allowed())return;
 const list=b.hasAttribute('data-delete-record')?'records':b.hasAttribute('data-delete-ref')?'references':'reminders',id=b.dataset.deleteRecord||b.dataset.deleteReminder||b.dataset.deleteRef;
 const target=state[list].find(r=>r.id===id&&r.vehicleId===selected);if(!target||list==='references'&&target.origin!=='user')return;
 if(!confirm(list==='records'?'¿Eliminar este registro? Esta acción no se puede deshacer.':list==='references'?'¿Eliminar esta referencia del catálogo? Las instalaciones ya vinculadas conservarán sus códigos y fotos.':'¿Quitar esta alerta? Registrá el mantenimiento por separado si ya lo realizaste.'))return;
 busy=true;try{const next=structuredClone(state);next[list]=next[list].filter(r=>r.id!==id);if(await commit(next))notify('Eliminado.');}finally{busy=false;}
});
function download(content,name){const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=async()=>{if(busy)return;try{let data;if(blocked){data=await MisAutosStore.recovery();if(data===null)throw Error('No se encontraron datos para recuperar.');}else{const latest=await MisAutosStore.read();data=latest?validate(latest.data):state;}download(typeof data==='string'?data:JSON.stringify(data,null,2),`mis-autos-${today()}${blocked?'-recuperacion':''}.json`);notify('Copia descargada con registros, referencias y fotos. Guardala también fuera del celular.');}catch(error){notify(`No se pudo exportar: ${error.message}`);}};
$('import').onclick=()=>{if(!busy)$('backup-file').click();};
$('backup-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(busy){e.target.value='';return;}busy=true;try{const next=validate(JSON.parse(await file.text()));if(confirm(`Se reemplazarán los datos de todos los vehículos por esta copia (${next.vehicles.length} vehículos): ${next.records.length} registros, ${next.references.length} referencias con sus fotos y ${next.reminders.length} alertas. Exportá primero si querés conservar los datos actuales. ¿Continuar?`)){if(await commit(next))notify('Copia importada correctamente, incluidas las fotografías disponibles.');}}catch(error){notify((error instanceof SyntaxError?'El archivo no es un JSON válido.':error.message)+' No se modificaron tus datos.');}finally{e.target.value='';busy=false;}};
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('install').hidden=true;}};
function connectivity(){$('connection').textContent=navigator.onLine?'Guardado en este dispositivo':'Sin conexión · datos locales';}window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);connectivity();
async function initialize(){try{const saved=await MisAutosStore.load();state=saved.data;revision=saved.revision;blocked=false;if(saved.migrated)notify('Actualización completada: conservamos kilometrajes, registros y alertas. Exportá una copia nueva con el catálogo.');}catch(error){try{revision=(await MisAutosStore.read())?.revision??0;}catch{}notify(`No se pudieron cargar los datos: ${error.message}. No se borraron. Podés exportar una copia de recuperación o importar una copia válida.`);}busy=false;render();}
initialize();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async registration=>{await navigator.serviceWorker.ready;$('offline-status').textContent='Disponible sin conexión en este dispositivo.';if(registration.waiting)notify('Hay una versión nueva. Cerrá todas las ventanas de Mis Autos y volvé a abrir para actualizar.');registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)notify('Hay una versión nueva. Exportá una copia, cerrá todas las ventanas de Mis Autos y volvé a abrir para actualizar.');});});}).catch(()=>{$('offline-status').textContent='No se pudo preparar el modo sin conexión. Abrí la app con HTTPS o localhost y recargá.';});}else $('offline-status').textContent='Para instalar y usar sin conexión, abrí esta app con Chrome mediante HTTPS.';
