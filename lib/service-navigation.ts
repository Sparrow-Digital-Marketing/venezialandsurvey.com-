/** Apply shared navigation fixes to each retained source page. */
export function withServiceNavigation(html:string){
 return html
  .replaceAll('href="/projects/dock-permitting/"','href="/projects/facility-lines/"')
  .replace(/(<li\b[^>]*\bfusion-dropdown-menu\b[^>]*data-item-id="23">)(<a\b[^>]*>[\s\S]*?<\/a>)(<ul class="sub-menu">)/,
   (_,item:string,link:string)=>`${item.replace('fusion-dropdown-menu','fusion-dropdown-menu replica-services-menu')}${link}<button type="button" class="replica-services-toggle" aria-label="Toggle service pages" aria-expanded="false" aria-controls="replica-desktop-services"></button><ul class="sub-menu" id="replica-desktop-services">`);
}
