import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../app/api/contact/route.ts';

const originalFetch=globalThis.fetch;
const originalEnv={...process.env};
afterEach(()=>{
 globalThis.fetch=originalFetch;
 for(const key of ['RESEND_API_KEY','CONTACT_FROM_EMAIL','CONTACT_TO_EMAIL']){
  if(originalEnv[key]===undefined)delete process.env[key];else process.env[key]=originalEnv[key];
 }
});
const valid={firstName:'Test',lastName:'Visitor',email:'visitor@example.com',phone:'585-555-0100',message:'Example form test message.',website:''};
const request=data=>new Request('https://venezialandsurvey.vercel.app/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://venezialandsurvey.vercel.app'},body:JSON.stringify(data)});

test('invalid submissions never call an email provider',async()=>{
 globalThis.fetch=()=>{throw Error('Unexpected outbound request')};
 for(const data of [{...valid,email:'invalid'},{...valid,message:''},{...valid,firstName:''}])assert.equal((await POST(request(data))).status,400);
 assert.equal((await POST(request({...valid,message:'x'.repeat(13000)}))).status,413);
});
test('spam trap submissions do not send email',async()=>{
 globalThis.fetch=()=>{throw Error('Unexpected outbound request')};
 assert.deepEqual(await (await POST(request({...valid,website:'spam'}))).json(),{ok:true});
});
test('unconfigured delivery reports failure instead of success',async()=>{
 delete process.env.RESEND_API_KEY;delete process.env.CONTACT_FROM_EMAIL;
 const r=await POST(request(valid));assert.equal(r.status,503);assert.match((await r.json()).error,/ray@sparrowdigitalmarketing.com/);
});
test('configured delivery uses Ray and visitor reply-to without accepting a client recipient',async()=>{
 process.env.RESEND_API_KEY='example-test-key';process.env.CONTACT_FROM_EMAIL='Website <forms@example.com>';delete process.env.CONTACT_TO_EMAIL;
 let captured;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');captured=JSON.parse(options.body);return Response.json({id:'example-message-id'})};
 const r=await POST(request({...valid,to:'unapproved@example.com'}));
 assert.equal(r.status,200);assert.deepEqual(captured.to,['ray@sparrowdigitalmarketing.com']);assert.equal(captured.reply_to,valid.email);assert.match(captured.text,/Test Visitor/);assert.match(captured.text,/585-555-0100/);
});
test('provider rejection preserves failure and does not expose provider details',async()=>{
 process.env.RESEND_API_KEY='example-test-key';process.env.CONTACT_FROM_EMAIL='Website <forms@example.com>';
 globalThis.fetch=async()=>Response.json({message:'Private provider diagnostic'},{status:403});
 const r=await POST(request(valid));assert.equal(r.status,502);assert.doesNotMatch(JSON.stringify(await r.json()),/Private provider/);
});
test('cross-site submissions are rejected',async()=>{
 const r=new Request('https://venezialandsurvey.vercel.app/api/contact',{method:'POST',headers:{Origin:'https://other.example'},body:JSON.stringify(valid)});
 assert.equal((await POST(r)).status,403);
});
test('same-site submissions work behind the hosting proxy',async()=>{
 delete process.env.RESEND_API_KEY;
 const r=new Request('http://0.0.0.0:3092/api/contact',{method:'POST',headers:{Host:'localhost:3092',Origin:'http://localhost:3092','Content-Type':'application/json'},body:JSON.stringify(valid)});
 assert.equal((await POST(r)).status,503);
});
