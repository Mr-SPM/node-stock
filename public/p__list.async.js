"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[675],{92486:function(A,$,r){r.d($,{C5:function(){return P},Gl:function(){return N},_V:function(){return L},gp:function(){return I}});var T=r(33950),x=T.Z.create({baseURL:"/api"});function P(C){return x.get("/getInfo",{params:C})}function I(C){return x.get("/list",{params:C})}function L(){return x.get("/getStockList")}function N(){return x.get("/temp")}},14537:function(A,$,r){r.r($),r.d($,{default:function(){return dt}});var T=r(90228),x=r.n(T),P=r(87999),I=r.n(P),L=r(48305),N=r.n(L),C=r(59501),B=r(64164),u=r(75271),z=r(66521),b=r(3258),w=r(82187),H=r.n(w),G=r(42425),U=r(77527),V=r(5633),X=e=>{const{value:n,formatter:o,precision:t,decimalSeparator:s,groupSeparator:m="",prefixCls:f}=e;let i;if(typeof o=="function")i=o(n);else{const l=String(n),v=l.match(/^(-?)(\d*)(\.(\d+))?$/);if(!v||l==="-")i=l;else{const p=v[1];let g=v[2]||"0",a=v[4]||"";g=g.replace(/\B(?=(\d{3})+(?!\d))/g,m),typeof t=="number"&&(a=a.padEnd(t,"0").slice(0,t>0?t:0)),a&&(a=`${s}${a}`),i=[u.createElement("span",{key:"int",className:`${f}-content-value-int`},p,g),a&&u.createElement("span",{key:"decimal",className:`${f}-content-value-decimal`},a)]}}return u.createElement("span",{className:`${f}-content-value`},i)},W=r(12312),K=r(63828),Y=r(84458);const J=e=>{const{componentCls:n,marginXXS:o,padding:t,colorTextDescription:s,titleFontSize:m,colorTextHeading:f,contentFontSize:i,fontFamily:l}=e;return{[n]:Object.assign(Object.assign({},(0,W.Wf)(e)),{[`${n}-title`]:{marginBottom:o,color:s,fontSize:m},[`${n}-skeleton`]:{paddingTop:t},[`${n}-content`]:{color:f,fontSize:i,fontFamily:l,[`${n}-content-value`]:{display:"inline-block",direction:"ltr"},[`${n}-content-prefix, ${n}-content-suffix`]:{display:"inline-block"},[`${n}-content-prefix`]:{marginInlineEnd:o},[`${n}-content-suffix`]:{marginInlineStart:o}}})}},Q=e=>{const{fontSizeHeading3:n,fontSize:o}=e;return{titleFontSize:o,contentFontSize:n}};var k=(0,K.I$)("Statistic",e=>{const n=(0,Y.IX)(e,{});return[J(n)]},Q),q=function(e,n){var o={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.indexOf(t)<0&&(o[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,t=Object.getOwnPropertySymbols(e);s<t.length;s++)n.indexOf(t[s])<0&&Object.prototype.propertyIsEnumerable.call(e,t[s])&&(o[t[s]]=e[t[s]]);return o},F=e=>{const{prefixCls:n,className:o,rootClassName:t,style:s,valueStyle:m,value:f=0,title:i,valueRender:l,prefix:v,suffix:p,loading:g=!1,formatter:a,precision:c,decimalSeparator:y=".",groupSeparator:O=",",onMouseEnter:d,onMouseLeave:Z}=e,h=q(e,["prefixCls","className","rootClassName","style","valueStyle","value","title","valueRender","prefix","suffix","loading","formatter","precision","decimalSeparator","groupSeparator","onMouseEnter","onMouseLeave"]),{getPrefixCls:ft,direction:mt,statistic:j}=u.useContext(U.E_),E=ft("statistic",n),[vt,pt,gt]=k(E),M=u.createElement(X,{decimalSeparator:y,groupSeparator:O,prefixCls:E,formatter:a,precision:c,value:f}),yt=H()(E,{[`${E}-rtl`]:mt==="rtl"},j==null?void 0:j.className,o,t,pt,gt),St=(0,G.Z)(h,{aria:!0,data:!0});return vt(u.createElement("div",Object.assign({},St,{className:yt,style:Object.assign(Object.assign({},j==null?void 0:j.style),s),onMouseEnter:d,onMouseLeave:Z}),i&&u.createElement("div",{className:`${E}-title`},i),u.createElement(V.Z,{paragraph:!1,loading:g,className:`${E}-skeleton`},u.createElement("div",{style:m,className:`${E}-content`},v&&u.createElement("span",{className:`${E}-content-prefix`},v),l?l(M):M,p&&u.createElement("span",{className:`${E}-content-suffix`},p)))))};const _=[["Y",1e3*60*60*24*365],["M",1e3*60*60*24*30],["D",1e3*60*60*24],["H",1e3*60*60],["m",1e3*60],["s",1e3],["S",1]];function tt(e,n){let o=e;const t=/\[[^\]]*]/g,s=(n.match(t)||[]).map(l=>l.slice(1,-1)),m=n.replace(t,"[]"),f=_.reduce((l,v)=>{let[p,g]=v;if(l.includes(p)){const a=Math.floor(o/g);return o-=a*g,l.replace(new RegExp(`${p}+`,"g"),c=>{const y=c.length;return a.toString().padStart(y,"0")})}return l},m);let i=0;return f.replace(t,()=>{const l=s[i];return i+=1,l})}function et(e,n){const{format:o=""}=n,t=new Date(e).getTime(),s=Date.now(),m=Math.max(t-s,0);return tt(m,o)}var nt=function(e,n){var o={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.indexOf(t)<0&&(o[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,t=Object.getOwnPropertySymbols(e);s<t.length;s++)n.indexOf(t[s])<0&&Object.prototype.propertyIsEnumerable.call(e,t[s])&&(o[t[s]]=e[t[s]]);return o};const rt=1e3/30;function at(e){return new Date(e).getTime()}const st=e=>{const{value:n,format:o="HH:mm:ss",onChange:t,onFinish:s}=e,m=nt(e,["value","format","onChange","onFinish"]),f=(0,z.Z)(),i=u.useRef(null),l=()=>{s==null||s(),i.current&&(clearInterval(i.current),i.current=null)},v=()=>{const a=at(n);a>=Date.now()&&(i.current=setInterval(()=>{f(),t==null||t(a-Date.now()),a<Date.now()&&l()},rt))};u.useEffect(()=>(v(),()=>{i.current&&(clearInterval(i.current),i.current=null)}),[n]);const p=(a,c)=>et(a,Object.assign(Object.assign({},c),{format:o})),g=a=>(0,b.Tm)(a,{title:void 0});return u.createElement(F,Object.assign({},m,{value:n,valueRender:g,formatter:p}))};var ot=u.memo(st);F.Countdown=ot;var it=F,lt=r(48482),R=r(71627),ct=r(41427),ut=r(12820),D=r(92486),S=r(52676);function dt(){var e,n=(0,u.useState)([]),o=N()(n,2),t=o[0],s=o[1],m=(0,u.useState)(!1),f=N()(m,2),i=f[0],l=f[1],v=[{title:"\u80A1\u7968",dataIndex:"name"},{title:"\u6210\u4EA4\u989D\uFF08\u4EBF\uFF09",dataIndex:"todayAmount",align:"right",sorter:function(c,y){return c.todayAmount-y.todayAmount},defaultSortOrder:"descend",render:function(c){return(0,S.jsx)("span",{style:{color:"red"},children:c})}},{title:"\u6628\u65E5\u6210\u4EA4\u989D\uFF08\u4EBF\uFF09",align:"right",dataIndex:"yesterdayAmount"},{title:"\u6DA8\u5E45",dataIndex:"amountIncrease",sorter:function(c,y){return c.amountIncrease-y.amountIncrease},render:function(c){return(0,S.jsx)("span",{style:{color:"red"},children:c})}},{title:"\u8BB0\u5F55\u65F6\u95F4",dataIndex:"time"}],p=function(){var a=I()(x()().mark(function c(){var y,O,d=arguments;return x()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return y=d.length>0&&d[0]!==void 0?d[0]:0,l(!0),h.prev=2,h.next=5,(0,D.gp)({isOnline:y});case 5:O=h.sent,console.log(O),s(O.data);case 8:return h.prev=8,l(!1),h.finish(8);case 11:case"end":return h.stop()}},c,null,[[2,,8,11]])}));return function(){return a.apply(this,arguments)}}(),g=function(){var a=I()(x()().mark(function c(){var y;return x()().wrap(function(d){for(;;)switch(d.prev=d.next){case 0:return d.prev=0,d.next=3,(0,D.Gl)();case 3:y=d.sent,C.ZP.success("\u64CD\u4F5C\u6210\u529F"),d.next=10;break;case 7:d.prev=7,d.t0=d.catch(0),C.ZP.error("\u8BB0\u5F55\u65E5\u5FD7\u5931\u8D25");case 10:case"end":return d.stop()}},c,null,[[0,7]])}));return function(){return a.apply(this,arguments)}}();return(0,S.jsxs)(B.Z,{title:"\u91CF\u5316\u5B9E\u65F6",style:{width:880},extra:(0,S.jsx)(it,{title:"\u4EA4\u6613\u65E5",value:(e=t[0])===null||e===void 0?void 0:e.date}),children:[(0,S.jsx)("div",{style:{marginBottom:16},children:(0,S.jsxs)(lt.Z,{align:"center",style:{width:"100%"},children:[(0,S.jsx)(R.ZP,{type:"primary",onClick:function(){return p()},style:{width:"100%"},children:"\u65E5\u5FD7\u67E5\u8BE2"}),(0,S.jsx)(R.ZP,{type:"primary",onClick:function(){return p(1)},style:{width:"100%"},children:"\u5B9E\u65F6\u67E5\u8BE2"}),(0,S.jsx)(R.ZP,{type:"primary",onClick:g,style:{width:"100%"},children:"\u8BB0\u5F55\u65E5\u5FD7"})]})}),(0,S.jsx)(ct.Z,{spinning:i,children:(0,S.jsx)(ut.Z,{columns:v,dataSource:t,pagination:!1})})]})}}}]);
