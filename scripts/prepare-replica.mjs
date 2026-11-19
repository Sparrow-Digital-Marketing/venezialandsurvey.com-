import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
const dir='source/replica';const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.json')&&!['assets.json','styles.json','hero.json'].includes(f));
let imports='',records=[];
for(const [i,file] of files.entries()){
 const p=dir+'/'+file;const page=JSON.parse(await fs.readFile(p));const $=cheerio.load(page.html,{xmlMode:false},false);
 $('.fusion-footer').addClass('fusion-footer-parallax');
 $('.fusion-mobile-nav-holder a').each((_,el)=>{if($(el).attr('href')===page.route)$(el).parent('li').addClass('fusion-mobile-current-nav-item')});
 const hero=JSON.parse(await fs.readFile(dir+'/hero.json'));$('.replica-hero').attr('style',`background-image:url('${hero.image}')`);
 for(const el of $('link[rel="stylesheet"]').toArray()){
  const url=$(el).attr('href');if(url?.startsWith('http')){const name='extra-'+path.basename(new URL(url).pathname)+(new URL(url).hostname==='fonts.googleapis.com'?'.css':'');const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36'}});if(response.ok){let css=await response.text();const assets=JSON.parse(await fs.readFile(dir+'/assets.json'));for(const a of assets)css=css.replaceAll(a.url,a.local);await fs.writeFile('public/source-assets/'+name,css);$(el).attr('href','/source-assets/'+name)}}
 }
 if(!$('#toTop').length)$.root().append('<div class="to-top-container to-top-right"><a href="#" id="toTop" style="display:none"><span id="toTopHover"></span><span class="screen-reader-text">Go to Top</span></a></div>');
 page.html=$.html();await fs.writeFile(p,JSON.stringify(page));imports+=`import p${i} from '@/source/replica/${file}';\n`;records.push(`'${file.slice(0,-5)}':p${i}`);
}
await fs.writeFile('lib/source-pages.ts',imports+`export const pages:Record<string,{route:string;bodyClass:string;html:string}>={${records.join(',')}};\n`);
