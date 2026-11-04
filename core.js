/* Modelo y validación compartidos por la app y sus pruebas. Sin acceso a red. */
'use strict';
(function(root){
 const VEHICLES=[{id:'jac',name:'JAC J2',year:2015,detail:'Nafta'},{id:'xsara',name:'Citroën Xsara',year:2000,detail:'1.9 D aspirado'}];
 const TYPES=['Aceite','Filtros','Reparación','Otro gasto'];
 const STATUSES={verified:'Verificado',pending:'Pendiente de verificar',incompatible:'Incompatible'};
 // Los identificadores antiguos se conservan: nunca se reutilizan para otra pieza.
 const PERIODIC_PARTS=[['service-tyres','Cubiertas'],['service-oil','Aceite de motor'],['service-brake-fluid','Líquido de frenos'],['part-0','Filtro de aceite'],['part-1','Filtro de aire'],['part-2','Filtro de combustible'],['part-3','Filtro de habitáculo'],['service-coolant','Refrigerante'],['service-washer','Líquido lavaparabrisas'],['service-wipers','Escobillas limpiaparabrisas'],['service-bulbs','Lámparas exteriores'],['part-5','Correa de accesorios'],['part-6','Pastillas de freno delanteras'],['part-7','Discos de freno delanteros'],['part-8','Frenos traseros (identificar sistema)'],['part-12','Batería']];
 const defaultParts=(vehicles=VEHICLES)=>vehicles.flatMap(v=>PERIODIC_PARTS.map(([id,name])=>({id:`${v.id}-${id}`,vehicleId:v.id,name,photos:[]})));
 function serviceCatalog(parts,references,records,vehicles){
  const used=new Set([...references.map(r=>r.partId),...records.flatMap(r=>r.installedParts.map(p=>p.partId))]);
  const obsolete={4:['Distribución (identificar correa o cadena)','Correa de distribución / kit'],9:['Bomba de agua'],10:['Termostato'],11:['Kit de embrague'],13:['Bujías de encendido','Bujías de precalentamiento']};
  const kept=parts.filter(p=>!Object.entries(obsolete).some(([index,names])=>p.id===`${p.vehicleId}-part-${index}`&&names.includes(p.name)&&!used.has(p.id)));
  for(const part of defaultParts(vehicles))if(!kept.some(p=>p.id===part.id))kept.push(part);
  return kept;
 }
 const initial=()=>({version:3,catalogRevision:1,vehicles:VEHICLES.map(v=>({...v,km:0,engineCode:'',variant:''})),records:[],reminders:[],parts:defaultParts(),references:[]});
 const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const numeric=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e12;
 const text=(x,max=5000)=>typeof x==='string'&&x.length<=max;
 const nonempty=(x,max=5000)=>text(x,max)&&!!x.trim();
 function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !isNaN(d)&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===s;}
 function requireThat(condition,message){if(!condition)throw Error(message);}
 function validPhoto(photo){return photo===null||(typeof photo==='string'&&photo.length<=3000000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(photo));}
 function validateReference(r,vehicleId){
  requireThat(isObj(r)&&nonempty(r.id,120)&&r.vehicleId===vehicleId&&nonempty(r.partId,120)&&['user','seed'].includes(r.origin)&&['OEM','Equivalente'].includes(r.kind),'La referencia no es válida.');
  requireThat(nonempty(r.brand,120)&&nonempty(r.code,120)&&Object.hasOwn(STATUSES,r.status)&&validPhoto(r.photo),'La marca, código, estado o fotografía no es válido.');
  requireThat(text(r.specs)&&text(r.source)&&text(r.notes)&&text(r.verificationNotes)&&text(r.applicability)&&text(r.photoSource)&& (r.price===null||numeric(r.price))&&(r.verifiedAt===null||validDate(r.verifiedAt)),'Los detalles de la referencia no son válidos.');
  requireThat(r.status!=='verified'||validDate(r.verifiedAt),'Para marcar Verificado, indicá la fecha de verificación.');
  return {id:r.id,vehicleId:r.vehicleId,partId:r.partId,origin:r.origin,kind:r.kind,brand:r.brand,code:r.code,status:r.status,photo:r.photo,specs:r.specs,source:r.source,notes:r.notes,verificationNotes:r.verificationNotes,applicability:r.applicability,photoSource:r.photoSource,price:r.price,verifiedAt:r.verifiedAt};
 }
 function validate(input){
  requireThat(isObj(input)&&[1,2,3].includes(input.version)&&Array.isArray(input.vehicles)&&input.vehicles.length>0&&Array.isArray(input.records)&&Array.isArray(input.reminders),'La copia no tiene un formato compatible con Mis Autos.');
  requireThat(input.catalogRevision===undefined||input.catalogRevision===1,'La revisión del catálogo no es compatible.');
  const legacy=input.version===1;
  const ids=new Set();
  const vehicles=input.vehicles.map(x=>{
   requireThat(isObj(x)&&nonempty(x.id,80)&&!ids.has(x.id),'Los vehículos de la copia no son válidos o tienen identificadores duplicados.');ids.add(x.id);
   const original=VEHICLES.find(v=>v.id===x.id);
   requireThat(input.version===3||original,'La copia antigua contiene un vehículo desconocido.');
   requireThat(numeric(x.km)&&Number.isInteger(x.km),'El kilometraje de la copia no es válido.');
   const name=input.version===3?x.name:original.name,year=input.version===3?x.year:original.year,detail=input.version===3?x.detail:original.detail;
   requireThat(nonempty(name,120)&&(year===null||(Number.isInteger(year)&&year>=1886&&year<=2200))&&text(detail,500),'El nombre, año o detalle del vehículo no es válido.');
   requireThat(legacy||(text(x.engineCode,120)&&text(x.variant,500)),'La identificación del vehículo no es válida.');
   return {id:x.id,name,year,detail,km:x.km,engineCode:legacy?'':x.engineCode,variant:legacy?'':x.variant};
  });
  if(input.version!==3)requireThat(vehicles.length===2&&VEHICLES.every(v=>ids.has(v.id)),'Faltan vehículos de la copia antigua.');
  const vehicle=id=>vehicles.some(v=>v.id===id);
  function identities(list){const ids=new Set();requireThat(Array.isArray(list),'Falta una lista de datos.');for(const x of list){requireThat(isObj(x)&&nonempty(x.id,120)&&!ids.has(x.id)&&vehicle(x.vehicleId),'La copia contiene identificadores o vehículos no válidos o duplicados.');ids.add(x.id);}}
  identities(input.records);identities(input.reminders);
  const records=input.records.map(r=>{requireThat(TYPES.includes(r.type)&&validDate(r.date)&&numeric(r.km)&&Number.isInteger(r.km)&&numeric(r.cost)&&text(r.notes)&&r.km<=vehicles.find(v=>v.id===r.vehicleId).km,'La copia contiene un mantenimiento no válido.');requireThat(legacy||Array.isArray(r.installedParts),'Faltan los repuestos instalados del mantenimiento.');const installedParts=legacy?[]:r.installedParts.map(s=>{const ref=validateReference(s,r.vehicleId);requireThat(nonempty(s.partName,120),'Falta el nombre del repuesto instalado.');return {...ref,partName:s.partName};});return {id:r.id,vehicleId:r.vehicleId,type:r.type,date:r.date,km:r.km,cost:r.cost,notes:r.notes,installedParts};});
  const reminders=input.reminders.map(r=>{requireThat(nonempty(r.title)&&(r.km===null||(numeric(r.km)&&Number.isInteger(r.km)))&&(r.date===null||validDate(r.date))&&(r.km!==null||r.date!==null),'La copia contiene una alerta no válida.');return {id:r.id,vehicleId:r.vehicleId,title:r.title,km:r.km,date:r.date};});
  const parts=legacy?defaultParts(vehicles):input.parts;const references=legacy?[]:input.references;identities(parts);identities(references);
  const cleanParts=parts.map(p=>{requireThat(nonempty(p.name,120),'Falta el nombre del repuesto.');const photos=p.photos===undefined?[]:p.photos;requireThat(Array.isArray(photos)&&photos.length<=3&&photos.every(photo=>photo!==null&&validPhoto(photo)),'Las fotografías del componente no son válidas (máximo tres).');return {id:p.id,vehicleId:p.vehicleId,name:p.name,photos:[...photos]};});
  const cleanRefs=references.map(r=>{requireThat(cleanParts.some(p=>p.id===r.partId&&p.vehicleId===r.vehicleId),'La referencia pertenece a otro vehículo o a un repuesto inexistente.');return validateReference(r,r.vehicleId);});
  const updatedParts=input.catalogRevision===1?cleanParts:serviceCatalog(cleanParts,cleanRefs,records,vehicles);
  return {version:3,catalogRevision:1,vehicles,records,reminders,parts:updatedParts,references:cleanRefs};
 }
 function snapshot(state,referenceId,vehicleId){const r=state.references.find(r=>r.id===referenceId&&r.vehicleId===vehicleId);requireThat(r&&r.status!=='incompatible','No se puede seleccionar una referencia incompatible o de otro vehículo.');const part=state.parts.find(p=>p.id===r.partId&&p.vehicleId===vehicleId);requireThat(part,'El repuesto no existe.');return {...validateReference(r,vehicleId),partName:part.name};}
 const api={VEHICLES,TYPES,STATUSES,initial,validate,validDate,validPhoto,snapshot,defaultParts};
 root.MisAutosCore=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
