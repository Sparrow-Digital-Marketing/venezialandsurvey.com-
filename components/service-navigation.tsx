'use client';
import {useEffect} from 'react';

export function ServiceNavigation(){
 useEffect(()=>{
  const item=document.querySelector<HTMLElement>('.replica-services-menu');
  const button=item?.querySelector<HTMLButtonElement>('.replica-services-toggle');
  const overview=item?.querySelector<HTMLAnchorElement>(':scope > a');
  const links=[...item?.querySelectorAll<HTMLAnchorElement>('.sub-menu a')||[]];
  if(!item||!button||!overview)return;
  const events=new AbortController();
  const options={signal:events.signal};
  function open(expanded:boolean){
   item!.dataset.servicesOpen=String(expanded);
   button!.setAttribute('aria-expanded',String(expanded));
  }
  open(false);
  item.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')open(true)},options);
  item.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch'&&!item.contains(document.activeElement))open(false)},options);
  overview.addEventListener('focus',()=>open(true),options);
  button.addEventListener('click',()=>open(button.getAttribute('aria-expanded')!=='true'),options);
  item.addEventListener('focusout',event=>{if(!(event.relatedTarget instanceof Node&&item.contains(event.relatedTarget)))open(false)},options);
  item.addEventListener('keydown',event=>{
   if(event.key==='Escape'){
    event.preventDefault();open(false);button.focus();
   }else if((event.key==='ArrowDown'||event.key==='ArrowUp')&&(event.target===button||event.target===overview)){
    event.preventDefault();open(true);(event.key==='ArrowDown'?links[0]:links.at(-1))?.focus();
   }
  },options);
  document.addEventListener('pointerdown',event=>{if(event.target instanceof Node&&!item.contains(event.target))open(false)},options);
  return()=>{events.abort();delete item.dataset.servicesOpen};
 },[]);
 return null;
}
