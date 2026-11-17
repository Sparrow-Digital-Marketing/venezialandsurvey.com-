import type {Metadata} from 'next';
import styles from '@/source/replica/styles.json';
import home from '@/source/replica/home.json';
import './replica.css';
export const metadata:Metadata={title:{default:'Venezia & Associates – Land Surveyors and Civil Engineers',template:'%s – Venezia & Associates'},description:'Venezia & Associates land surveyors and civil engineers in Canandaigua, New York. Serving Ontario, Yates, Livingston, Steuben, Seneca, and Monroe counties.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-US"><head>{styles.map(href=><link key={href} rel="stylesheet" href={href}/>)}</head><body className={home.bodyClass} suppressHydrationWarning>{children}</body></html>}
