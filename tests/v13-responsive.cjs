const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const URL = process.env.TEST_URL || 'https://estoque-infraspeak-pwa.vercel.app/';
const cases = [
  ['android-320',320,700,'Android'],['android-360',360,780,'Android'],
  ['android-393',393,852,'Android'],['iphone-se',375,667,'iPhone'],
  ['iphone-390',390,844,'iPhone'],['iphone-pro-max',430,932,'iPhone'],
  ['tablet-768',768,1024,'iPad'],['desktop-1366',1366,768,'Desktop'],
  ['desktop-1920',1920,1080,'Desktop']
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let failures=[];
 for(const [name,width,height,device] of cases){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:device!=='Desktop',hasTouch:device!=='Desktop',userAgent:device==='iPhone'?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1':undefined});
  const page=await context.newPage();
  try{
   await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.title').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   const geometry=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length && getComputedStyle(e).position!=='fixed' && !e.closest('dialog:not([open])'));
    const offenders=els.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left < -2 || r.right > innerWidth+2)}).slice(0,8).map(e=>({tag:e.tagName,cls:e.className?.baseVal||e.className,left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right)}));
    return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,offenders};
   });
   assert.ok(geometry.scroll<=width+2,JSON.stringify(geometry));
   assert.equal(geometry.offenders.length,0,JSON.stringify(geometry));
   const access=await page.locator('.actions a.button').getAttribute('href');
   assert.equal(access,'https://new.infraspeak.com/stock/warehouses');
   const headerAccess=await page.locator('.quick-nav a').getAttribute('href');
   assert.equal(headerAccess,access);
   const qrTrigger=width<=767?page.locator('#mobileQrButton'):page.locator('#openQrDialog');
   await qrTrigger.click();
   const dialog=page.locator('#qrDialog');
   await dialog.waitFor({state:'visible'});
   assert.equal(await dialog.evaluate(e=>e.open),true);
   assert.equal(await dialog.locator('img').evaluate(e=>e.complete && e.naturalWidth>0),true);
   const qrBounds=await dialog.locator('img').boundingBox();
   assert.ok(qrBounds.width>100 && qrBounds.x>=0 && qrBounds.x+qrBounds.width<=width+2,JSON.stringify(qrBounds));
   await page.keyboard.press('Escape');
   assert.equal(await dialog.evaluate(e=>e.open),false);
   assert.equal(await qrTrigger.evaluate(e=>e===document.activeElement),true);
   await page.locator('#headerInstallButton').click();
   const helpVisible=await page.locator('#installHelp').getAttribute('data-visible');
   const iosVisible=await page.locator('#iosGuide').getAttribute('data-visible');
   assert.ok(helpVisible==='true'||iosVisible==='true'||await page.locator('#installButton').isDisabled(),'Install button did not trigger shared flow');
   if(width<=767)assert.equal(await page.locator('.qr-access__image-frame').isVisible(),false);
   await page.screenshot({path:'test-results/'+name+'.png',fullPage:true});
   console.log('PASS',name,JSON.stringify(geometry));
  }catch(e){failures.push(name+': '+e.message);console.error('FAIL',name,e.message);await page.screenshot({path:'test-results/'+name+'-failed.png',fullPage:true}).catch(()=>{});}
  await context.close();
 }
 await browser.close();
 if(failures.length){console.error(failures.join('\n'));process.exit(1)}
})();