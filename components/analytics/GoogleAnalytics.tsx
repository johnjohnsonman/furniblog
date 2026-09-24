/**
 * Google Analytics 4 (gtag.js). Env-gated by NEXT_PUBLIC_GA_ID — set it to your
 * GA4 Measurement ID ("G-XXXXXXXXXX") in .env.local and Vercel.
 *
 * Rendered as plain <script> tags (not next/script) so the gtag config runs
 * directly from the server HTML on page load — no dependency on client
 * hydration, which is the reliable way to fire GA in the App Router.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim()
  if (!id || !id.startsWith("G-") || id.includes("XXXX")) return null

  const bootstrap = `(function(w,d,id){
    var params=new URLSearchParams(w.location.search);
    var explicit=params.get('__analytics');
    if(explicit==='off'){try{w.sessionStorage.setItem('chairpedia_analytics','off')}catch(e){}}
    if(explicit==='on'){try{w.sessionStorage.removeItem('chairpedia_analytics')}catch(e){}}
    var sessionOff=false;
    try{sessionOff=w.sessionStorage.getItem('chairpedia_analytics')==='off'}catch(e){}
    var disabled=w.navigator.webdriver===true||sessionOff||w.location.pathname.startsWith("/chair-fit-report/");
    w.__chairpediaAnalyticsEnabled=!disabled;
    if(disabled)return;
    w.dataLayer=w.dataLayer||[];
    w.gtag=function(){w.dataLayer.push(arguments)};
    w.gtag('js',new Date());
    w.gtag('config',id,{send_page_view:false});
    var script=d.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
    d.head.appendChild(script);
  })(window,document,${JSON.stringify(id)});`

  return (
    <script id="ga4-init" dangerouslySetInnerHTML={{ __html: bootstrap }} />
  )
}
