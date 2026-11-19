'use client';
import {useEffect} from 'react';
import './contact-form.css';

export function ContactForm(){
 useEffect(()=>{
  const form=document.querySelector<HTMLFormElement>('form[data-replica-contact]');
  const button=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(!form||!button)return;
  const pending=new AbortController();
  let busy=false;
  async function submit(event:Event){
   event.preventDefault();
   if(busy||!form!.reportValidity())return;
   busy=true;button!.disabled=true;button!.textContent='Sending...';
   form!.setAttribute('aria-busy','true');
   let status=form!.querySelector<HTMLElement>('.replica-form-status');
   if(!status){status=document.createElement('p');status.className='replica-form-status';status.setAttribute('role','status');status.setAttribute('tabindex','-1');form!.append(status)}
   status.textContent='';
   try{
    const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form!))),signal:pending.signal});
    const result=await response.json();
    if(!response.ok||result.ok!==true)throw Error(result.error||'Your message could not be sent. Please try again later.');
    status.textContent='Thanks! Your message has been submitted.';
    form!.reset();
   }catch(error){
    if(pending.signal.aborted)return;
    status.textContent=error instanceof Error?error.message:'Your message could not be sent. Please try again later.';
   }finally{
    if(!pending.signal.aborted){busy=false;button!.disabled=false;button!.textContent='Submit';form!.removeAttribute('aria-busy');status.focus()}
   }
  }
  form.addEventListener('submit',submit);
  return()=>{form.removeEventListener('submit',submit);pending.abort()};
 },[]);
 return null;
}
