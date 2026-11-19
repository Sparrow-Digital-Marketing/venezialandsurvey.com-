'use client';

import {useLayoutEffect} from 'react';

export function ReplicaCarousel(){
 useLayoutEffect(()=>{
  const carousel=document.querySelector<HTMLElement>('.replica-services-carousel');
  const track=carousel?.querySelector<HTMLElement>('.fusion-carousel-holder');
  if(!carousel||!track)return;
  const originals=[...track.children] as HTMLElement[];
  const events=new AbortController();
  let animation:Animation|undefined;
  let finish: (()=>void)|undefined;
  let columns=5;
  function updateFocus(){
   [...track!.children].forEach((item,index)=>{(item as HTMLElement).inert=index>=columns});
  }
  function size(){
   finish?.();
   columns=Math.min(Number(carousel!.dataset.columns)||5,Math.max(1,Math.ceil(carousel!.clientWidth/180)));
   carousel!.style.setProperty('--carousel-columns',String(columns));
   updateFocus();
  }
  function move(direction:number){
   if(animation)return;
   const items=[...track!.children] as HTMLElement[];
   const selected=direction>0?items.slice(0,columns):items.slice(-columns);
   const copies=selected.map(item=>{
    const copy=item.cloneNode(true) as HTMLElement;
    copy.inert=true;
    copy.setAttribute('aria-hidden','true');
    return copy;
   });
   if(direction>0)track!.append(...copies);else track!.prepend(...copies);
   const distance=carousel!.clientWidth;
   const from=direction>0?0:-distance;
   const to=direction>0?-distance:0;
   animation=track!.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}],{
    duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:500,
    easing:'ease-in-out',fill:'forwards'
   });
   finish=()=>{
    if(direction>0)track!.append(...selected);else track!.prepend(...selected);
    copies.forEach(copy=>copy.remove());
    updateFocus();
    animation?.cancel();animation=undefined;finish=undefined;
   };
   animation.onfinish=()=>finish?.();
  }
  carousel.querySelector('.fusion-nav-prev')?.addEventListener('click',()=>move(-1),{signal:events.signal});
  carousel.querySelector('.fusion-nav-next')?.addEventListener('click',()=>move(1),{signal:events.signal});
  const observer=new ResizeObserver(size);
  observer.observe(carousel);size();
  return()=>{events.abort();observer.disconnect();finish?.();originals.forEach(item=>{item.inert=false});track.replaceChildren(...originals);carousel.style.removeProperty('--carousel-columns')};
 },[]);
 return null;
}
