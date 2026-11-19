export const runtime='nodejs';

const contactRecipient=()=>process.env.CONTACT_TO_EMAIL||'ray@sparrowdigitalmarketing.com';
const failure=()=>`Your message could not be sent. Please try again later or email ${contactRecipient()}.`;
const emailPattern=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin){
  try{
   const host=request.headers.get('host')||new URL(request.url).host;
   if(new URL(origin).host!==host)throw Error('Origin mismatch');
  }catch{return Response.json({error:'Invalid request origin.'},{status:403})}
 }
 let raw:string;
 try{raw=await request.text()}catch{return Response.json({error:'Invalid form submission.'},{status:400})}
 if(new TextEncoder().encode(raw).length>12000)return Response.json({error:'Please shorten your message.'},{status:413});
 let data:Record<string,unknown>;
 try{
  data=request.headers.get('content-type')?.includes('application/json')?JSON.parse(raw):Object.fromEntries(new URLSearchParams(raw));
  if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid data');
 }catch{return Response.json({error:'Invalid form submission.'},{status:400})}
 const field=(name:string)=>typeof data[name]==='string'?(data[name] as string).trim():'';
 if(field('website'))return Response.json({ok:true});
 const first=field('firstName'),last=field('lastName'),email=field('email'),phone=field('phone'),message=field('message');
 if(!first||!last||!emailPattern.test(email)||!message||first.length>100||last.length>100||email.length>254||phone.length>60||message.length>8000){
  return Response.json({error:'Please enter your first and last name, a valid email address, and your message.'},{status:400});
 }
 const key=process.env.RESEND_API_KEY;
 const from=process.env.CONTACT_FROM_EMAIL;
 const recipient=contactRecipient();
 if(!key||!from)return Response.json({error:failure()},{status:503});
 try{
  const response=await fetch('https://api.resend.com/emails',{
   method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({from,to:[recipient],reply_to:email,subject:'Venezia website inquiry',
    text:`Name: ${first} ${last}\nEmail: ${email}\nPhone: ${phone||'Not provided'}\n\n${message}`}),
   signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)return Response.json({error:failure()},{status:502});
  const result=await response.json();
  if(typeof result.id!=='string')return Response.json({error:failure()},{status:502});
  return Response.json({ok:true});
 }catch{return Response.json({error:failure()},{status:502})}
}
