/* big.js v5.1.2 https://github.com/MikeMcl/big.js/LICENCE */
!function(e){"use strict";function r(){function e(n){var i=this;return i instanceof e?(n instanceof e?(i.s=n.s,i.e=n.e,i.c=n.c.slice()):t(i,n),void(i.constructor=e)):n===m?r():new e(n)}return e.prototype=v,e.DP=s,e.RM=f,e.NE=h,e.PE=l,e.version="5.0.2",e}function t(e,r){var t,n,i;if(0===r&&0>1/r)r="-0";else if(!E.test(r+=""))throw Error(g+"number");for(e.s="-"==r.charAt(0)?(r=r.slice(1),-1):1,(t=r.indexOf("."))>-1&&(r=r.replace(".","")),(n=r.search(/e/i))>0?(0>t&&(t=n),t+=+r.slice(n+1),r=r.substring(0,n)):0>t&&(t=r.length),i=r.length,n=0;i>n&&"0"==r.charAt(n);)++n;if(n==i)e.c=[e.e=0];else{for(;i>0&&"0"==r.charAt(--i););for(e.e=t-n-1,e.c=[],t=0;i>=n;)e.c[t++]=+r.charAt(n++)}return e}function n(e,r,t,n){var i=e.c,o=e.e+r+1;if(o<i.length){if(1===t)n=i[o]>=5;else if(2===t)n=i[o]>5||5==i[o]&&(n||0>o||i[o+1]!==m||1&i[o-1]);else if(3===t)n=n||i[o]!==m||0>o;else if(n=!1,0!==t)throw Error(w);if(1>o)i.length=1,n?(e.e=-r,i[0]=1):i[0]=e.e=0;else{if(i.length=o--,n)for(;++i[o]>9;)i[o]=0,o--||(++e.e,i.unshift(1));for(o=i.length;!i[--o];)i.pop()}}else if(0>t||t>3||t!==~~t)throw Error(w);return e}function i(e,r,t,i){var o,s,f=e.constructor,u=!e.c[0];if(t!==m){if(t!==~~t||(3==r)>t||t>c)throw Error(3==r?g+"precision":p);for(e=new f(e),t=i-e.e,e.c.length>++i&&n(e,t,f.RM),2==r&&(i=e.e+t+1);e.c.length<i;)e.c.push(0)}if(o=e.e,s=e.c.join(""),t=s.length,2!=r&&(1==r||3==r&&o>=i||o<=f.NE||o>=f.PE))s=s.charAt(0)+(t>1?"."+s.slice(1):"")+(0>o?"e":"e+")+o;else if(0>o){for(;++o;)s="0"+s;s="0."+s}else if(o>0)if(++o>t)for(o-=t;o--;)s+="0";else t>o&&(s=s.slice(0,o)+"."+s.slice(o));else t>1&&(s=s.charAt(0)+"."+s.slice(1));return e.s<0&&(!u||4==r)?"-"+s:s}var o,s=20,f=1,c=1e6,u=1e6,h=-7,l=21,a="[big.js] ",g=a+"Invalid ",p=g+"decimal places",w=g+"rounding mode",d=a+"Division by zero",v={},m=void 0,E=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;v.abs=function(){var e=new this.constructor(this);return e.s=1,e},v.cmp=function(e){var r,t=this,n=t.c,i=(e=new t.constructor(e)).c,o=t.s,s=e.s,f=t.e,c=e.e;if(!n[0]||!i[0])return n[0]?o:i[0]?-s:0;if(o!=s)return o;if(r=0>o,f!=c)return f>c^r?1:-1;for(s=(f=n.length)<(c=i.length)?f:c,o=-1;++o<s;)if(n[o]!=i[o])return n[o]>i[o]^r?1:-1;return f==c?0:f>c^r?1:-1},v.div=function(e){var r=this,t=r.constructor,i=r.c,o=(e=new t(e)).c,s=r.s==e.s?1:-1,f=t.DP;if(f!==~~f||0>f||f>c)throw Error(p);if(!o[0])throw Error(d);if(!i[0])return new t(0*s);var u,h,l,a,g,w=o.slice(),v=u=o.length,E=i.length,M=i.slice(0,u),P=M.length,b=e,D=b.c=[],R=0,A=f+(b.e=r.e-e.e)+1;for(b.s=s,s=0>A?0:A,w.unshift(0);P++<u;)M.push(0);do{for(l=0;10>l;l++){if(u!=(P=M.length))a=u>P?1:-1;else for(g=-1,a=0;++g<u;)if(o[g]!=M[g]){a=o[g]>M[g]?1:-1;break}if(!(0>a))break;for(h=P==u?o:w;P;){if(M[--P]<h[P]){for(g=P;g&&!M[--g];)M[g]=9;--M[g],M[P]+=10}M[P]-=h[P]}for(;!M[0];)M.shift()}D[R++]=a?l:++l,M[0]&&a?M[P]=i[v]||0:M=[i[v]]}while((v++<E||M[0]!==m)&&s--);return D[0]||1==R||(D.shift(),b.e--),R>A&&n(b,f,t.RM,M[0]!==m),b},v.eq=function(e){return!this.cmp(e)},v.gt=function(e){return this.cmp(e)>0},v.gte=function(e){return this.cmp(e)>-1},v.lt=function(e){return this.cmp(e)<0},v.lte=function(e){return this.cmp(e)<1},v.minus=v.sub=function(e){var r,t,n,i,o=this,s=o.constructor,f=o.s,c=(e=new s(e)).s;if(f!=c)return e.s=-c,o.plus(e);var u=o.c.slice(),h=o.e,l=e.c,a=e.e;if(!u[0]||!l[0])return l[0]?(e.s=-c,e):new s(u[0]?o:0);if(f=h-a){for((i=0>f)?(f=-f,n=u):(a=h,n=l),n.reverse(),c=f;c--;)n.push(0);n.reverse()}else for(t=((i=u.length<l.length)?u:l).length,f=c=0;t>c;c++)if(u[c]!=l[c]){i=u[c]<l[c];break}if(i&&(n=u,u=l,l=n,e.s=-e.s),(c=(t=l.length)-(r=u.length))>0)for(;c--;)u[r++]=0;for(c=r;t>f;){if(u[--t]<l[t]){for(r=t;r&&!u[--r];)u[r]=9;--u[r],u[t]+=10}u[t]-=l[t]}for(;0===u[--c];)u.pop();for(;0===u[0];)u.shift(),--a;return u[0]||(e.s=1,u=[a=0]),e.c=u,e.e=a,e},v.mod=function(e){var r,t=this,n=t.constructor,i=t.s,o=(e=new n(e)).s;if(!e.c[0])throw Error(d);return t.s=e.s=1,r=1==e.cmp(t),t.s=i,e.s=o,r?new n(t):(i=n.DP,o=n.RM,n.DP=n.RM=0,t=t.div(e),n.DP=i,n.RM=o,this.minus(t.times(e)))},v.plus=v.add=function(e){var r,t=this,n=t.constructor,i=t.s,o=(e=new n(e)).s;if(i!=o)return e.s=-o,t.minus(e);var s=t.e,f=t.c,c=e.e,u=e.c;if(!f[0]||!u[0])return u[0]?e:new n(f[0]?t:0*i);if(f=f.slice(),i=s-c){for(i>0?(c=s,r=u):(i=-i,r=f),r.reverse();i--;)r.push(0);r.reverse()}for(f.length-u.length<0&&(r=u,u=f,f=r),i=u.length,o=0;i;f[i]%=10)o=(f[--i]=f[i]+u[i]+o)/10|0;for(o&&(f.unshift(o),++c),i=f.length;0===f[--i];)f.pop();return e.c=f,e.e=c,e},v.pow=function(e){var r=this,t=new r.constructor(1),n=t,i=0>e;if(e!==~~e||-u>e||e>u)throw Error(g+"exponent");for(i&&(e=-e);1&e&&(n=n.times(r)),e>>=1,e;)r=r.times(r);return i?t.div(n):n},v.round=function(e,r){var t=this.constructor;if(e===m)e=0;else if(e!==~~e||0>e||e>c)throw Error(p);return n(new t(this),e,r===m?t.RM:r)},v.sqrt=function(){var e,r,t,i=this,o=i.constructor,s=i.s,f=i.e,c=new o(.5);if(!i.c[0])return new o(i);if(0>s)throw Error(a+"No square root");s=Math.sqrt(i.toString()),0===s||s===1/0?(r=i.c.join(""),r.length+f&1||(r+="0"),e=new o(Math.sqrt(r).toString()),e.e=((f+1)/2|0)-(0>f||1&f)):e=new o(s.toString()),f=e.e+(o.DP+=4);do t=e,e=c.times(t.plus(i.div(t)));while(t.c.slice(0,f).join("")!==e.c.slice(0,f).join(""));return n(e,o.DP-=4,o.RM)},v.times=v.mul=function(e){var r,t=this,n=t.constructor,i=t.c,o=(e=new n(e)).c,s=i.length,f=o.length,c=t.e,u=e.e;if(e.s=t.s==e.s?1:-1,!i[0]||!o[0])return new n(0*e.s);for(e.e=c+u,f>s&&(r=i,i=o,o=r,u=s,s=f,f=u),r=new Array(u=s+f);u--;)r[u]=0;for(c=f;c--;){for(f=0,u=s+c;u>c;)f=r[u]+o[c]*i[u-c-1]+f,r[u--]=f%10,f=f/10|0;r[u]=(r[u]+f)%10}for(f?++e.e:r.shift(),c=r.length;!r[--c];)r.pop();return e.c=r,e},v.toExponential=function(e){return i(this,1,e,e)},v.toFixed=function(e){return i(this,2,e,this.e+e)},v.toPrecision=function(e){return i(this,3,e,e-1)},v.toString=function(){return i(this)},v.valueOf=v.toJSON=function(){return i(this,4)},o=r(),o["default"]=o.Big=o,"function"==typeof define&&define.amd?define(function(){return o}):"undefined"!=typeof module&&module.exports?module.exports=o:e.Big=o}(this);
//# sourceMappingURL=doc/big.js.map
Big.DP = Big.PE = 1e6;
Big.NE = -1e6
Big.RM = 0;