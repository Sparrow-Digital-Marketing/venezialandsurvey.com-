import {ContactForm} from '@/components/contact-form';
import {notFound} from 'next/navigation';
import {withServiceNavigation} from '@/lib/service-navigation';
import {ServiceNavigation} from '@/components/service-navigation';
import {pages} from '@/lib/source-pages';
import {ReplicaCarousel} from '@/components/replica-carousel';
import {ReplicaInteractions} from '@/components/replica-interactions';
export function generateStaticParams(){return Object.keys(pages).map(key=>({segments:key==='home'?[]:key.split('_')}))}
export async function generateMetadata({params}:{params:Promise<{segments?:string[]}>}){const {segments}=await params;const key=segments?.join('_')||'home';const titles:Record<string,string>={about:'About',services:'Services',contact:'Contact',projects_boundary:'Boundary Survey',projects_topographic:'Topographic Surveys',projects_dock_permitting:'Dock Permitting Surveys',projects_facility_lines:'Dock Permitting Surveys',projects_site_survey:'Site Survey',projects_lot_survey:'Lot Survey',projects_subdivision:'Subdivision Survey'};if(key==='home')return {};return {title:titles[key.replaceAll('-','_')]||'Venezia & Associates'}}
export default async function Page({params}:{params:Promise<{segments?:string[]}>}){const {segments}=await params;const key=segments?.join('_')||'home';const page=pages[key];if(!page)notFound();return <><div className="source-replica" dangerouslySetInnerHTML={{__html:withServiceNavigation(page.html)}}/><ReplicaInteractions/><ServiceNavigation/>{key==='contact'&&<ContactForm/>}{key==='services'&&<ReplicaCarousel/>}</>}
