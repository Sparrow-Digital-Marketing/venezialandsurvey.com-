import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
const origins={
 'extra-font-awesome.css':'https://venezialandsurvey.com/wp-content/plugins/revslider/public/assets/fonts/font-awesome/css/font-awesome.css',
 'extra-pe-icon-7-stroke.css':'https://venezialandsurvey.com/wp-content/plugins/revslider/public/assets/fonts/pe-icon-7-stroke/css/pe-icon-7-stroke.css',
 'extra-css.css':'https://fonts.googleapis.com/css?family=Work+Sans:600%2C400%2C300%2C500%7CRoboto:400%7COpen+Sans:400',
};
for(const [file,origin] of Object.entries(origins)){
 const target='public/source-assets/'+file;let css=await fs.readFile(target,'utf8');
 for(const m of [...css.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g)]){
  if(m[2].startsWith('/source-assets/')||m[2].startsWith('data:'))continue;
  const url=new URL(m[2],origin);url.hash='';const name=crypto.createHash('sha256').update(url.href).digest('hex').slice(0,14)+path.extname(url.pathname);const r=await fetch(url);if(!r.ok)throw new Error(`${url} ${r.status}`);await fs.writeFile('public/source-assets/'+name,Buffer.from(await r.arrayBuffer()));css=css.replaceAll(m[0],`url('/source-assets/${name}')`);
 }
 await fs.writeFile(target,css);
}
