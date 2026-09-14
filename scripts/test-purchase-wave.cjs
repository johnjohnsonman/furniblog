const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup:render}=require('react-dom/server');
function load(file,imports={}){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)(id=>id==='react/jsx-runtime'?require(id):imports[id],m,m.exports);return m.exports}
const Link=({children,...props})=>React.createElement('a',props,children);
const {ReviewListItem}=load('components/reviews/review-list-item.tsx',{'next/link':{default:Link},'./source-badge':{SourceBadge:()=>null}});
const review={id:'sample',productSlug:'chair',productName:'Chair',summary:'Customer account',pros:[],cons:[],createdAt:'2026-06-30T12:00:00Z'};
assert.doesNotMatch(render(React.createElement(ReviewListItem,{review:{...review,source:'chairpark'}})),/Jun 30, 2026/);
assert.match(render(React.createElement(ReviewListItem,{review:{...review,source:'community'}})),/Jun 30, 2026/);
const decisions=load('lib/growth/purchase-decisions.ts');
const {PurchaseDecisionCard}=load('components/growth/PurchaseDecisionCard.tsx',{'next/link':{default:Link},'@/lib/growth/purchase-decisions':decisions,'@/components/affiliate/SmartBuyLink':{SmartBuyLink:()=>React.createElement('a',{href:'https://amazon.com'},'Buy')}});
const path=decisions.getPurchaseGuideLinks('sihoo-doro-c300')[0].href;
const html=render(React.createElement(PurchaseDecisionCard,{productId:'sihoo-doro-c300',name:'C300',amazonUrl:'https://amazon.com',placement:'test',currentPath:path}));
assert.match(html,/Match the exact Doro C300/);assert.match(html,/href="\/products\/sihoo-doro-c300"/);assert.ok(!html.includes('href="'+path+'"'));assert.match(html,/https:\/\/amazon.com/);
console.log('PASS: offline date hidden; community date retained; C300 decision and product link rendered without self-link.');

