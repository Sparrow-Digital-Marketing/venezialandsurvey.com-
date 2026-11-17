import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
const origin='https://venezialandsurvey.com';
const routes=['/','/about/','/services/','/contact/','/projects/boundary/','/projects/dock-permitting/','/projects/facility-lines/','/projects/topographic/','/projects/site-survey/','/projects/lot-survey/','/projects/subdivision/'];
const assets=new Map(); const errors=[];
try {for(const a of JSON.parse(await fs.readFile('source/replica/assets.json')))if(a.local.startsWith('/source-assets/'))assets.set(a.url,Promise.resolve(a.local));} catch {}
async function resource(raw,base=origin){
 if(!raw||/^(data:|#|mailto:|tel:)/.test(raw))return raw;
 let url;try{url=new URL(raw,base);url.protocol='https:';url.hash='';}catch{return raw}
 const key=url.href;if(assets.has(key))return assets.get(key);
 const task=(async()=>{try{const response=await fetch(key,{headers:{'User-Agent':'Mozilla/5.0'}});if(!response.ok)throw new Error(String(response.status));const ext=path.extname(url.pathname)||'.css';const name=crypto.createHash('sha256').update(key).digest('hex').slice(0,14)+ext;const local='/source-assets/'+name;let data=Buffer.from(await response.arrayBuffer());if(ext==='.css'){let css=data.toString();css=await rewriteCss(css,key);data=Buffer.from(css)}await fs.writeFile('public'+local,data);return local}catch(e){errors.push({url:key,error:String(e)});return key}})();assets.set(key,task);return task;
}
async function rewriteCss(css,base){const matches=[...css.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g)];for(const m of matches){const local=await resource(m[2],base);css=css.replaceAll(m[0],`url("${local}")`)}return css;}
let styles=[];
for(const [index,route] of routes.entries()){
 const raw=await(await fetch(origin+route)).text();const $=cheerio.load(raw);
 if(index===0){for(const el of $('head link[rel="stylesheet"]').toArray()){styles.push(await resource($(el).attr('href')))}await fs.writeFile('source/replica/body-class.txt',$('body').attr('class')||'');}
 const headStyles=$('head style').toArray().map(e=>$(e).html()).join('\n');
 $('script,noscript,head link,iframe').remove();
 $('body [onload],body [onclick],body [onerror]').each((_,e)=>{for(const a of Object.keys(e.attribs))if(a.startsWith('on'))$(e).removeAttr(a)});
 // Revolution Slider is recreated with a small responsive component below.
 if(route==='/')$('#sliders-container').html(`<section class="replica-hero" aria-label="Professional land surveying"><div class="replica-map-icon" aria-hidden="true"><i class="pe-7s-map-2"></i></div><h1>Over 30 Years Experience</h1><div class="replica-hero-divider" aria-hidden="true"><span></span><i class="fa fa-compass"></i><span></span></div><p>From the field to the office, we use today's most advanced technology to assure quality and precision in processing data and final mapping.</p><a class="replica-hero-button" href="/contact/">CONTACT US</a></section>`);
 // Rebuild mobile menu markup that the original theme inserts with jQuery.
 const desktop=$('.fusion-main-menu > ul').first().clone();desktop.attr('id','replica-mobile-menu');desktop.find('[id]').removeAttr('id');desktop.find('li').each((_,e)=>{$(e).attr('class','fusion-mobile-nav-item'+($(e).hasClass('menu-item-has-children')?' menu-item-has-children':''))});
 desktop.find('li').each((_,e)=>{if($(e).children('ul').length)$(e).children('a').after('<button type="button" class="fusion-open-submenu" aria-label="Open services submenu" aria-expanded="false"></button>')});
 $('.fusion-mobile-nav-holder').html(desktop).attr('id','replica-mobile-nav').attr('style','display:none');$('.fusion-icon-bars').attr('aria-controls','replica-mobile-nav').attr('role','button');
 // Remove source-site form routing, anti-spam bookkeeping, and hidden third-party endpoints.
 $('form').each((_,e)=>{$(e).attr('action','#').attr('data-replica-contact','true').removeAttr('method');$(e).find('input[type="hidden"]').remove()});
 $('a[href]').each((_,e)=>{const a=$(e);const href=a.attr('href');if(href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:'))return;let url;try{url=new URL(href,origin)}catch{return}const known=routes.includes(url.pathname.endsWith('/')?url.pathname:url.pathname+'/');if(url.hostname==='venezialandsurvey.com'&&known&&!url.search)a.attr('href',url.pathname+url.hash).attr('target','_self');else if(url.searchParams.get('avada_portfolio')==='subdivision')a.attr('href','/projects/subdivision/').attr('target','_self');else if(/^https?:/.test(url.protocol))a.attr('href',url.href.replace('http:','https:')).attr('target','_blank').attr('rel','noopener noreferrer')});
 // The original footer email is an inert hash; preserve its look with the proper action.
 $('a').filter((_,e)=>$(e).text().trim()==='rocco@veneziasurvey.com').attr('href','mailto:rocco@veneziasurvey.com');
 for(const e of $('img,source').toArray()){
  const el=$(e);if(el.attr('src'))el.attr('src',await resource(el.attr('src')));
  for(const attr of ['srcset','data-srcset']){if(el.attr(attr)){const items=[];for(const item of el.attr(attr).split(',')){const [u,size]=item.trim().split(/\s+/);items.push((await resource(u))+(size?' '+size:''))}el.attr(attr,items.join(', '))}}
  for(const attr of ['data-src','data-orig-src','data-lazy-src'])if(el.attr(attr))el.attr(attr,await resource(el.attr(attr)));
 }
 for(const e of $('[style]').toArray()){const el=$(e);el.attr('style',await rewriteCss(el.attr('style'),origin+route))}
 for(const e of $('body style').toArray()){$(e).html(await rewriteCss($(e).html(),origin+route))}
 let html=$('body').html();html='<style>'+await rewriteCss(headStyles,origin+route)+'</style>'+html;
 await fs.writeFile('source/replica/'+(route==='/'?'home':route.replaceAll('/','_').replace(/^_|_$/g,''))+'.json',JSON.stringify({route,bodyClass:$('body').attr('class'),html}));
 console.log('Captured',route);
}
const hero=await resource('/wp-content/uploads/2020/02/1561455018_shutterstock_385253350.jpg');
await fs.writeFile('source/replica/styles.json',JSON.stringify(styles));await fs.writeFile('source/replica/assets.json',JSON.stringify(await Promise.all([...assets].map(async([url,p])=>({url,local:await p}))),null,2));
await fs.writeFile('source/replica/hero.json',JSON.stringify({image:hero}));
console.log('Assets',assets.size,'Errors',JSON.stringify(errors));
