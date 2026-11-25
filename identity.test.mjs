import assert from 'node:assert/strict';
import {identityImage,affiliationImage,groupLogos} from './identity.mjs';
import {existsSync} from 'node:fs';
for(const group of Object.keys(groupLogos)){
 const result=identityImage({group});assert(result.logo);assert(existsSync(new URL(result.src,import.meta.url)));
}
for(const code of 'PRES BUDG IUST CASP ECTI EXPO EPRS COMM PART PERS INLO TRAD LINC FINS ITEC SAFE'.split(' '))assert.equal(identityImage({group:'DG '+code}).src,'assets/groups/parliament.svg');
const person={name:'Test',photo:'https://example.invalid/photo.jpg',group:'DG LINC'};
assert.equal(identityImage(person).logo,false);
assert.equal(identityImage(person,new Set([person.photo])).src,'assets/groups/parliament.svg');
assert.equal(identityImage(person,new Set([person.photo,'assets/groups/parliament.svg'])),null);
assert.equal(identityImage({name:'Anonymous'}),null);
assert.equal(identityImage({group:'Non-attached'}),null);
assert.equal(identityImage({group:'DG UNKNOWN'}),null);
assert.equal(identityImage({department:'dg linc — Conferences',kind:'staff'}).logo,true);
assert.equal(affiliationImage({group:'ppe'}).src,'assets/groups/ppe.svg');
console.log('Photo priority, 8 groups, 16 DGs, failed images and unknown affiliations passed');
