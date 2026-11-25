export const groupLogos={'EPP':'ppe.svg','S&D':'sd.svg','Patriots for Europe':'pfe.svg','ECR':'ecr.svg','Renew Europe':'renew.svg','Greens/EFA':'greens.svg','The Left':'left.png','Europe of Sovereign Nations':'esn.png'};
const aliases={'ppe':'EPP','cre':'ECR','verts/ale':'Greens/EFA','patriotes pour l’europe':'Patriots for Europe','europe des nations souveraines':'Europe of Sovereign Nations'};
const dgs=new Set('PRES BUDG IUST CASP ECTI EXPO EPRS COMM PART PERS INLO TRAD LINC FINS ITEC SAFE'.split(' '));
export function affiliationImage(person){
 if(!person)return null;
 const value=(person.group||person.department||'').trim();
 const dg=value.match(/^DG\s+([A-Z]+)(?:$|[\s—–:-])/i);
 if(dg&&dgs.has(dg[1].toUpperCase()))return {src:'assets/groups/parliament.svg',alt:'European Parliament logo',logo:true,dark:false};
 const group=aliases[value.toLowerCase()]||Object.keys(groupLogos).find(g=>g.toLowerCase()===value.toLowerCase());
 if(group)return {src:'assets/groups/'+groupLogos[group],alt:group+' group logo',logo:true,dark:['EPP','Greens/EFA'].includes(group)};
 return null;
}
export function identityImage(person,failed=new Set()){
 if(!person)return null;
 if(person.photo&&!failed.has(person.photo))return {src:person.photo,alt:'Portrait of '+(person.name||'speaker'),logo:false,dark:false};
 const fallback=affiliationImage(person);return fallback&&!failed.has(fallback.src)?fallback:null;
}
