
//Official Application/Extension Registry«
const ALL_EXTENSIONS=[];

//Fullly qualified name here.
let DEF_APP = "util.BinView";
const APP_ARR=[//«
	"Link",
	"Application",
    "util.TextView",
    "util.Unzip",
    "games.Arcade",
    "audio.Synth",
	"util.ImageView",
	"media.MediaPlayer"
];//»

//Extension points to the array position above
const EXT_TO_APP_MAP={//«
	lnk:0,
	app:1,
    txt:2,
    js:2,
    sh:2,
    json:2,
    cfg:2,
	html:2,
    zip:3,
    gb:4,
    nes:4,
    synth:5,
	jpg:6,
	png:6,
	gif:6,
	webp:6,
	webm:7
};//»
for (let k in EXT_TO_APP_MAP) ALL_EXTENSIONS.push(k);

//»
//Var«

const NS = window[__OS_NS__];
let Desk;

const Core = this;
Core.do_update=()=>{};
Core.NS=NS;

let initlog = NS.initlog;
let current_user, users;
const _mods = NS.mods;
const _apps = NS.apps;
const _ivars = NS.initvars;

const make=(which)=>{return document.createElement(which);}
const mk=make;

let winw =()=>{return window.innerWidth};
let winh =()=>{return window.innerHeight};
let winx =()=>{return 0;};
let winy =()=>{return 0;};

let home_path, desk_path;
let FSLET;
let FSBRANCH;
let FSPREF;
let fsapi;
const body = document.body;
const is_iframe = (window.parent !== window);
const NUM=Number.isFinite;

let winorig = window.location.origin;

let is_offline = false;
if (qobj.cached) is_offline = true;

let fs;
let fs_str = null;
let last_history_com = null;

let last_job_id = 1;
let drop_iter=0;

//Modes/Flags«

let dev_mode = true;
let dev_env = false;

//»
//Storage«

let fs_type, use_fs_type;
let lst = localStorage;
const root = {NAME: "/", APP: "sys.Explorer", KIDS: {}, treeroot: true, TYPE: "fs", sys: true};
root.KIDS['.'] = root;
root.KIDS['..'] = root;
root.root = root;

//»
//Arrays/Objects«
const UPDATES = {};
const ENV={};
let jobs = [];
let system_channel, system_messages = [];
let global_drops = [];
let gzip = null;
let terminals;
let current_term;
let historys = {};

const KC = {//«
	'BACK': 8,
	8: 'BACK',
	'TAB': 9,
	9: 'TAB',
	'ENTER': 13,
	13: 'ENTER',
	'SHIFT': 16,
	16: 'SHIFT',
	'CTRL': 17,
	17: 'CTRL',
	'ALT': 18,
	18: 'ALT',
	'ESC': 27,
	27: 'ESC',
	'SPACE': 32,
	32: 'SPACE',
	'PGUP': 33,
	33: 'PGUP',
	'PGDOWN': 34,
	34: 'PGDOWN',
	'END': 35,
	35: 'END',
	'HOME': 36,
	36: 'HOME',
	'LEFT': 37,
	37: 'LEFT',
	'UP': 38,
	38: 'UP',
	'RIGHT': 39,
	39: 'RIGHT',
	'DOWN': 40,
	40: 'DOWN',
	'INS': 45,
	45: 'INS',
	'DEL': 46,
	46: 'DEL',
	48:'0',
	49:'1',
	50:'2',
	51:'3',
	52:'4',
	53:'5',
	54:'6',
	55:'7',
	56:'8',
	57:'9',
	'a': 65,
	65: 'a',
	'b': 66,
	66: 'b',
	'c': 67,
	67: 'c',
	'd': 68,
	68: 'd',
	'e': 69,
	69: 'e',
	'f': 70,
	70: 'f',
	'g': 71,
	71: 'g',
	'h': 72,
	72: 'h',
	'i': 73,
	73: 'i',
	'j': 74,
	74: 'j',
	'k': 75,
	75: 'k',
	'l': 76,
	76: 'l',
	'm': 77,
	77: 'm',
	'n': 78,
	78: 'n',
	'o': 79,
	79: 'o',
	'p': 80,
	80: 'p',
	'q': 81,
	81: 'q',
	'r': 82,
	82: 'r',
	's': 83,
	83: 's',
	't': 84,
	84: 't',
	'u': 85,
	85: 'u',
	'v': 86,
	86: 'v',
	'w': 87,
	87: 'w',
	'x': 88,
	88: 'x',
	'y': 89,
	89: 'y',
	'z': 90,
	90: 'z',
	'OSKEY': 91,
	91: 'OSKEY',
	';': 186,
	186: ';',
	'=': 187,
	187: '=',
	',': 188,
	188: ',',
	'-': 189,
	189: '-',
	'.': 190,
	190: '.',
	'/': 191,
	191: '/',
	'\x60': 192,
	192: '\x60',
	'[': 219,
	219: '[',
	'\\': 220,
	220: '\\',
	']': 221,
	221: ']',
	"'": 222,
	222: "'",
	"LAST_KC": 223
}
this.KC=KC;
//»
const kc=(num,str)=>{if(num==KC[str])return true;return false;};
this.kc = kc;

//»
//Audio/Mixer«
/*

const AUDIO = (()=>{
let ctx = new AudioContext();
const Mixer = function() {
	let plugs = [];
	const master = ctx.createGain();
	master.connect(ctx.destination);
	const Plug = function(elm) {
		let gain = ctx.createGain();
		elm.connect(gain);
		gain.connect(master);
		this.elm = elm;
		this.set_volume = val => {
			gain.gain.value = val;
		};
		this.disconnect = _ => {
			gain.disconnect();
			let num = plugs.indexOf(this);
			if (num < 0) {
				cerr("Could not find the plug in plugs", this);
				return;
			}
			plugs.splice(num, 1);
		};
	};
	this.set_volume = val => {
		master.gain.value = val;
	};
	this.plugs = plugs;
	this.plug_in = elm => {
		let plug = new Plug(elm);
		plugs.push(plug);
		return plug;
	};
};
return {
mixer: new Mixer(),
ctx: ctx
}
})();
*/
//»
const globals = {//«
	updates:UPDATES,
//	audio:AUDIO,
	lst:lst,
	ext_app_arr: APP_ARR,
	ext_to_app_map: EXT_TO_APP_MAP,
	all_extensions: ALL_EXTENSIONS,
	blobs:blobs,
	is_offline: is_offline,
	cacheExpires: 86400,
	mods:{}, 
	AppVars: {}, 
	services:{
		num: 0, 
		maxnum:0,
		_:[]
	}
};
Core.globals = globals;

let hostname = window.location.hostname;

let SYSNAME, SYSACRONYM, SYSVERSION;
SYSNAME = "Linux on the Web";
SYSACRONYM = "LOTW";

SYSVERSION = "0.1";
globals.name = {
	NAME: SYSNAME,
	ACRONYM: SYSACRONYM,
	VERSION: SYSVERSION
}

//»
//»
//API«

//const copydiv=mk('div');
const APPICONS={//«
	Folder:"1f5c2",
	Explorer:"1f5c2",
	Hello:"1f64b",
	TextView:"1f4dd",
	BinView:"1f51f",
	Terminal:"1f5b3",
	Synth:"1f39b",
	XSynth:"1f39a",
	Arcade:"1f579",
	Unzip:"1f5dc",
	Mail:"1f4ec",
	Help:"26a1",
	About:"1f4ca",
	Login:"1f464",
	Forum:"1f5e3",
	Hello:"1f64b",
	MediaPlayer:"1f3a6",
	HelloWorld:"270b",
	ImageView:"1f304"
}//»
const getAppIcon=(arg,opts={})=>{
	let app = arg.split(".").pop();
	let ch = APPICONS[app];
	if (!ch) return "?";
	if (opts.html) return `&#x${ch};`;
//	return `\\u{${ch}}`;
	return eval(`"\\u{${ch}}"`);
};
const copyarea=mk('textarea');

const gbid=id=>{return document.getElementById(id);};
const api = (()=>{
const decompress = (blob, opts = {}) => {//«
	return new Promise(async (y, n) => {
		if (!(blob instanceof Blob)) return n("decompress expected Blob");
		let which;
		if (opts.deflate) which = "deflate";
		else which = "gzip";
//		let blob = new Blob([arg]);
		let ds = new DecompressionStream(which);
		let stream = blob.stream().pipeThrough(ds);
		let prom;
		if (opts.toObj) prom = new Response(stream).json();
		else if (opts.toBuf) prom = new Response(stream).arrayBuffer();
		else if (opts.toBlob) prom = new Response(stream).blob();
		else prom = new Response(stream).text();
		y(await prom);
	});
};//»
const compress = (arg, opts = {}) => {//«
	return new Promise(async (y, n) => {
		let input = await api.toBuf(arg);
		let which;
		if (opts.deflate) which = "deflate";
		else which = "gzip";
		let cs = new CompressionStream(which);
		let writer = cs.writable.getWriter();
		writer.write(input);
		writer.close();
		let arr = [];
		let reader = cs.readable.getReader();
		let sz = 0;
		while (true) {
			const {
				value,
				done
			} = await reader.read();
			if (done) break;
			arr.push(value);
			sz += value.byteLength;
		}
		let out = new Uint8Array(sz);
		let off = 0;
		for (let ar of arr) {
			out.set(ar, off);
			off += ar.byteLength;
		}
		if (opts.toBytes) return y(out);
		if (opts.toBuf) return y(out.buffer);
		y(new Blob([out]));
	});
};//»
const rand = (min,max)=>(Math.floor(Math.random()*(max-min+1))+min);
const strToBuf=s=>{return blobToBuf(new Blob([s],{type:"text/plain"}));};
const isStr=arg=>{return typeof arg==="string" || arg instanceof String;};
const isNum=arg=>{return((typeof arg==="number")||(arg instanceof Number));};
const isZero=arg=>{return arg===0;};
const isInt=arg=>{if(!isNum(arg))return false;return !((arg+"").match(/\./));};
const hashsum=(which,arg)=>{return new Promise(async(Y,N)=>{let doit=buf=>{crypto.subtle.digest(which,buf).then(ret=>{let arr=new Uint8Array(ret);let str='';for(let ch of arr)str+=ch.toString(16).lpad(2,"0");Y(str);}).catch(e=>{N(e);})};if(!crypto.subtle)return Y("FAKE-HASH-SUM-NO-CRYPTO.SUBTLE");if(isStr(arg))doit(await strToBuf(arg));else if(arg instanceof Blob)doit(await blobToBuf(arg));else if(arg instanceof ArrayBuffer)doit(arg);else if(arg && arg.buffer instanceof ArrayBuffer)doit(arg.buffer);else N("Core.api.hashsum called without a valid type(String,\xa0Blob,\xa0,TypedArray,\xa0or ArrayBuffer!)");});};
const isObj=arg=>{return (arg && typeof arg === "object"&& typeof arg.length === "undefined");};
const getNameExt = (fullname, if_fullpath, if_in_parts) => {//«
	let fullpath;
	if (fullname.match(/\//)) {
		let arr = fullname.split("/");
		if (!arr[arr.length - 1]) arr.pop();
		fullname = arr.pop();
		fullpath = arr.join("/");
	}
	let marr;
	let ext = "";
	let name;
	if ((marr = fullname.match(/\.([a-z][a-z0-9]*)$/))) {
		let tryext = marr[1].lc();
		if (globals.all_extensions.includes(tryext)) {
			ext = tryext;
			name = fullname.replace(/\.([a-z][a-z0-9]*)$/, "");
		} else name = fullname;
	} else name = fullname;
	if (if_in_parts) return [fullpath, name, ext];
	if (if_fullpath) return [fullpath + "/" + name, ext];
	return [name, ext]
};//»
const strNum=(str,min,max,if_exclude_min)=>{let num=null;if(isNum(str))return str;if(!isStr(str))return;if(str.match(/^-?[0-9]+$/))num=parseInt(str);else if(str.match(/^-?([0-9]+)?\.[0-9]+$/))num=parseFloat(str);if(isNum(min)){if(if_exclude_min && num<=min)return null;else if(num<min)return null;}if(isNum(max)&& num>max)return null;return num;};
const isArr=arg=>{return (arg && typeof arg === "object" && typeof arg.length !== "undefined");};
const isBool=arg=>{return typeof arg === "boolean";};
const bufToStr=arg=>{return (new TextDecoder('utf-8').decode(new DataView(arg)));};
const blobToBuf=b=>{return new Promise((Y,N)=>{let rdr=new FileReader();rdr.onloadend=()=>{Y(rdr.result);};rdr.onerror=N;rdr.readAsArrayBuffer(b);});};
const toBuf=dat=>{if(!dat)return null;if(dat instanceof ArrayBuffer)return dat;if(dat.buffer instanceof ArrayBuffer)return dat.buffer;if(isStr(dat))return strToBuf(dat);if(dat instanceof Blob)return blobToBuf(dat);return null;};
const blobToStr=b=>{return new Promise(async(Y,N)=>{Y(bufToStr(await blobToBuf(b)));});};
const bytesToStr=bytearg=>{let bytes2str=(bytes)=>{let arr=[];for(let i=0;i<bytes.length;i++)arr[i]=String.fromCharCode(bytes[i]);return arr.join("");};if(bytearg instanceof ArrayBuffer){let tmp=new Uint8Array(bytearg);bytearg=tmp;}if(bytearg.buffer){try{var decoder=new TextDecoder('utf-8');var view=new DataView(bytearg.buffer);return decoder.decode(view);}catch(e){return bytes2str(bytearg);}}else if(typeof bytearg==="string")return bytearg;};
const toStr=dat=>{if(typeof dat==="string" || dat instanceof String)return dat;if(dat instanceof ArrayBuffer || dat.buffer instanceof ArrayBuffer)return bytesToStr(dat);if(dat instanceof Blob)return blobToStr(dat);try{return dat.toString();}catch(e){}console.error("Unknown object in to capi.toStr");};

return {
extToApp:(arg)=>{
	let ext = arg.split(".").pop();
	let num = EXT_TO_APP_MAP[ext];
	if (!Number.isFinite(num)) return DEF_APP;
	return APP_ARR[num];
},
getAppIcon:getAppIcon,
getStore:(name,opts={})=>{
    return new Promise(async(Y,N)=>{
        if (!await fsapi.loadMod("sys.idb")) {
			if (opts.reject) return N("Cannot load module: sys.idb!");
			else return Y();
		}
        let mod = new NS.mods["sys.idb"](Core);
        mod.init(name);
        Y(mod.tx());
    });
},
compress:compress,
decompress:decompress,
clipCopy:s=>{copyarea.value=s;copyarea.select();document.execCommand("copy");},
blobToStr:blobToStr,
bytesToStr:bytesToStr,
toStr:toStr,
setEnv:(k,v)=>{ENV[k]=v;},
getEnv:k=>{return ENV[k];},
delEnv:k=>{return ENV[k];},
toBuf:toBuf,
toBytes:dat=>{return new Promise(async(Y,N)=>{let buf=await toBuf(dat);if(!buf)return Y(null);Y(new Uint8Array(buf));});},
jlog:obj=>{log(JSON.stringify(obj,null,"  "));},
center:(elem,usewin,dims)=>{let usew=winw();let useh=winh();let r;if(usewin){if(usewin.main)r=usewin.main.getBoundingClientRect();else r=usewin.getBoundingClientRect();usew=r.width;useh=r.height;}r=elem.getBoundingClientRect();let elemw=r.width;let elemh=r.height;if(dims){elemw=dims.X;elemh=dims.Y;}let usex=(usew / 2)-(elemw / 2);let usey=(useh / 2)-(elemh / 2);if(usex<0)usex=0;if(usey<0)usey=0;elem.x=usex;elem.y=usey;},
pathParts:arg=>{return getNameExt(arg, true, true);},
getNameExt:getNameExt,
getKeys:obj=>{if(!obj)obj={};let arr=Object.keys(obj);let ret=[];for(let k of arr)if(obj.hasOwnProperty(k))ret.push(k);return ret;},
textToBytes:async s=>{return new Uint8Array(await strToBuf(s));},
isEOF:arg=>{if(isObj(arg)){if(arg.EOF ||(arg.lines&&arg.lines.EOF))return true;}return false;},
blobAsBytes:blob=>{return new Promise((Y,N)=>{let reader=new FileReader();reader.onloadend=()=>{Y(new Uint8Array(reader.result));};reader.onerror=N;reader.readAsArrayBuffer(blob);});},
download:(blob,name)=>{if(!name)name="appdownload";if(typeof blob=="string")blob=new Blob([blob],{type:"text/plain"});let url=URL.createObjectURL(blob);let a=make('a');a.attset('href',url);a.attset('download',name);a.dis="none";document.body.appendChild(a);a.click();a.del();},
evt2Sym:e=>{let mod_str="";if(e.ctrlKey)mod_str="C";if(e.altKey)mod_str+="A";if(e.shiftKey)mod_str+="S";let code=e.keyCode;if(code>=97 && code<=122)code-=32;return(KC[code]+"_"+mod_str);},
gbid:gbid,
isNum:isNum,
isBool:isBool,
isInt:isInt,
isArr:isArr,
isPosInt:arg=>{return isInt(arg)&&arg>0;},
isNegInt:arg=>{return isInt(arg)&&arg<0;},
isPos:arg=>{return isNum(arg)&& arg>0;},
isNeg:arg=>{return isNum(arg)&& arg<0;},
isNotNeg:arg=>{return isNum(arg)&& arg>=0;},
is0:isZero,
isZero:isZero,
isStr:isStr,
isNull:arg=>{return (arg===null||arg===undefined);},
isArr:arg=>{return (arg && typeof arg === "object" && typeof arg.length !== "undefined");},
isObj:isObj,
isId:str=>{return !!(str && str.match && str.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/));},
isFunc:arg=>{return (arg instanceof Function);},
isBlob:arg=>{return (arg instanceof Blob);},
strNum:strNum,
strNumMinEx:(str,num)=>{return strNum(str,num,null,true);},

typeOf:arg=>{if(isStr(arg))return "string";if(isArr(arg))return "array";if(isObj(arg))return "object";if(isNum(arg))return "number";if(isBool(arg))return "boolean";if(arg===null)return "null";if(arg===undefined)return "undefined";if(isNaN(arg))return "NaN";return "???";},

strToBuf:strToBuf,
bufToStr:bufToStr,
tmStamp:()=>{return Math.floor(Date.now()/1000);},

sha1:arg=>{return hashsum("SHA-1",arg);},
sha256:arg=>{return hashsum("SHA-256",arg);},
sha384:arg=>{return hashsum("SHA-384",arg);},
sha512:arg=>{return hashsum("SHA-512",arg);},

mk:which=>(document.createElement(which)),
mkbut:s=>{let d=document.createElement('button');if(s)d.innerHTML=s;return d;},
mkdv:s=>{let d=document.createElement('div');if(s)d.innerHTML=s;return d;},
mksp:s=>{let d=document.createElement('span');if(s)d.innerHTML=s;return d;},
mktxt:str=>{if(!str)str="";return document.createTextNode(str);},
text:str=>{return document.createTextNode(str);},
bodyact:()=>{if(document.body==document.activeElement)return true;return false;},
clear:()=>{window.getSelection().removeAllRanges();},
//winw:()=>{return pi(window.innerWidth);},
//winh:()=>{return pi(window.innerHeight);},
noprop:e=>{e.stopPropagation();},

dist:(x1,y1,x2,y2)=>{return(Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)))},

rand:rand,
randCol: (op) =>{
	if (NUM(op)) return (`rgba(${rand(0,255)},${rand(0,255)},${rand(0,255)},${op})`)
	return (`rgb(${rand(0,255)},${rand(0,255)},${rand(0,255)})`)
//	return ("rgb(" + rand(0, 255) + "," + rand(0, 255) + "," + rand(0, 255) + ")")
},
randStr:(numarg, ifdash)=>{//«
	let got = 0;
	let retstr = "";
	let gotit = null;
	let do_batch=()=>{
		let arr = new Uint16Array(2);
		window.crypto.getRandomValues(arr);
		let iter=0;
		while (iter < 2) {
			let n = parseInt(arr[iter], 16);
			if (n >= 48 && n <= 57 || n >= 65 && n <= 90 || n >= 97 && n <= 122 || n == 95 || (ifdash && n == 45)){
				if (got == numarg) return true;
				got++;
				retstr += String.fromCharCode(n);
			}
			iter++;
		}
		return null;
	};
	if (typeof(numarg) == "number" && numarg > 0 && numarg <= 250) {
		while (!do_batch()){}
		return retstr;
	}
	else throw new Error("Invalid arg to randstr");
},//»
numberLines:arr=>{if(!arr)arr=[];let tmp=[];let num=0;let numwid=(arr.length+"").length;for(let ln of arr){let numstr=(++num)+"";tmp.push(("0".repeat(numwid-numstr.length)+numstr)+ "\x20"+ln);}return tmp;}
}
})();
Core.api = api;

const util = (()=>{//«
return {
gbid:gbid,
jlog:api.jlog,
isnotneg:api.isNotNeg,
isint:api.isInt,
isnum:api.isNum,
ispos:api.isPos,
isneg:api.isNeg,
isfunc:api.isFunc,
isblob:api.isBlob,
isobj:api.isObj,
isarr:api.isArr,
isstr:api.isStr,
isbool:api.isBool,
isnull:api.isNull,
strnum:api.strNum,
strnum_minex:api.strNumMinEx,
isid:api.isId,
typeof:api.typeOf,
mk:api.mk,
make:api.mk,
mkbut:api.mkbut,
mkdv:api.mkdv,
mkbr:api.mkbr,
mksp:api.mksp,
mktxt:api.mktxt,
text:api.text,
bodyact:api.bodyact,
clear:api.clear,
//winw:api.winw,
//winh:api.winh,
noprop:api.noprop,
center:api.center
}

})();
globals.util=util;
//»

//»

//Macros«

let cur_macros = null;
this.set_macros=obj=>{cur_macros=obj;};
let macro_update_cb=null;
let cur_macro_arr, macro_iter, dn_macro_keys,up_macro_keys;
let cur_macro_succ_cb, cur_macro_rej_cb;
this.set_macro_succ_cb=f=>{cur_macro_succ_cb=f;};
this.set_macro_rej_cb=f=>{cur_macro_rej_cb=f;};
this.call_macro_succ_cb=arg=>{if(cur_macro_succ_cb)cur_macro_succ_cb(arg);};
this.call_macro_rej_cb=_=>{if(cur_macro_rej_cb)cur_macro_rej_cb();};
this.get_macro_update_cb=_=>{return macro_update_cb;};
this.set_macro_update_cb=f=>{macro_update_cb=f;};
this.reset_macro_vars =_=>{//«
	cur_macro_arr = [];
	macro_iter = 0; 
	dn_macro_keys = {};
	up_macro_keys = {};
}//»
this.macro_key_down=code=>{//«
if (!cur_macros) return;
let ch;
if (code == KC.ALT) ch = "A";
else if (code == KC.CTRL) ch = "C"
else if (code == KC.SHIFT) ch = "S";
else ch = String.fromCharCode(code).toLowerCase();
if (!ch.match(/[a-zA-Z0-9]/)) return null;
dn_macro_keys[ch]=1;
let str = "";
if (cur_macro_arr.length) str = cur_macro_arr.join("+") + "+";
let mstr = getkeys(dn_macro_keys).sort().join("");
let marr = mstr.match(/^([ACS]+)/);
if (marr && marr[1]) mstr = mstr.replace(/^[ACS]+/, "").replace(/$/, "_"+marr[1]);
str += mstr;
return str;
}//»
this.macro_key_up=(code, out_cb, accept_cb, reject_cb, if_desk)=>{//«
if (!cur_macros) return;
let ch;
if (code == KC.ALT) ch = "A";
else if (code == KC.CTRL) ch = "C"
else if (code == KC.SHIFT) ch = "S";
else ch = String.fromCharCode(code).toLowerCase();
if (!ch.match(/[a-zA-Z0-9]/)) return;
if (!dn_macro_keys[ch]) return;
delete dn_macro_keys[ch];
up_macro_keys[ch] = 1;
if (getkeys(dn_macro_keys).length===0) {//«
	let str = getkeys(up_macro_keys).sort().join("");
	let marr = str.match(/^([ACS]+)/);
	if (marr && marr[1]) str = str.replace(/^[ACS]+/, "").replace(/$/, "_"+marr[1]);
	up_macro_keys = {};
	cur_macro_arr[macro_iter] = str;
	macro_iter++;
	str = cur_macro_arr.join("+")
	out_cb(str);
	let obj = cur_macros[str];
	if (obj) {
		if (obj.n) str = obj.n;
		if (if_desk) out_cb(str+"<br><span style='color:green;'>&#10003;</span>");
		else out_cb(str + " \u2713");//10003 == \u2713
		accept_cb(obj);
	}
	else {
		let keys = getkeys(cur_macros);
		if (!keys.length || str.length > keys.maxlen()) {
			if (if_desk) out_cb(str+"<br><span style='color:red;'>&#10007;</span>");
			else out_cb(str + " \u2717");
			reject_cb();
		}
	}
}//»
}//»

//»
//Eval«
const Eval = function(str, done_cb, opts){
"use strict";
const FakeTerminal = opts=>{//«
if (!opts) opts = {};
//Var«
let noop=()=>{};
let kill_funcs = [];
let execute_kill_funcs =_=>{//«
let iter = -1;
let dokill=()=>{
iter++;
let fn = kill_funcs[iter];
if (!fn) {
kill_funcs = [];
if (done_cb) done_cb("Killed");
return
}
fn(dokill);
}
dokill();
}//»
//»

let tell_which = true;
let silent = false;

if (api.isBool(opts.TELL)) tell_which = opts.TELL;
if (api.isBool(opts.SILENT)) silent = opts.SILENT;

let response=(arg, opts)=>{//«
let succ = arg.SUCC;
if (succ && succ.length==1&&succ[0]==="") return;
if (arg.CD) return;
log(arg, opts)
}//»
//Logging«
let _log = (...args)=>{
if (silent) return;
console.log(...args);
}
let _warn = (...args)=>{
if (silent) return;
console.warn(...args);
}
let _err = (...args)=>{
if (silent) return;
console.error(...args);
}

let out = (which, val)=>{
if (tell_which) _log("["+which+"]", val);
else _log(val);
}
//»

//Response«
let resperr=s=>{
out("STDERR",s);
}
let resperrch=s=>{
out("STDERR CH",s);
}
let resperrlines=a=>{
out("STDERR LINES",a);
} 
let resperrobj=o=>{
out("STDERR OBJ",o);
}
let respsucc=s=>{
if (api.isObj(s)&&s.EOF===true) return;
out("STDOUT",s);
}
let respsuccobj=o=>{
out("STDOUT OBJ",o);
} 
let respsuccch=s=>{
out("STDOUT CH",s);
}
let respsucclines=a=>{
out("STDOUT LINES",a);
}
let respsuccblob=b=>{
out("STDOUT BLOB",b);
}

//»
//FileObj«
function FileObj(flags) {

let _parser, _fent, _read, _write, _seek, _buffer, _iter=0;
let thisobj=this;

this.reset = ()=>{//«
thisobj.read = _read;
thisobj.write = _write;
thisobj.seek = _seek;
}//»
this.set_reader = reader_arg=>{//«
thisobj.read = reader_arg;
}//»
this.set_writer = writer_arg=>{//«
thisobj.write = writer_arg;
}//»
this.set_seeker = seeker_arg=>{//«
thisobj.seek = seeker_arg;
}//»
this.set_parser = parser_arg=>{//«
_parser = parser_arg;
}//»
function Reader() {//«
thisobj.stdin_reader = true;
this.is_terminal = true;
let cbarg;
this.readline = cb=>{
cbarg = cb;
}
this.line = (cb, if_noend)=>{
_parser.stdin = (str, cancel)=>{
if (str) str = str.replace(/\n$/,"");
else if (cancel) return cb(termobj.EOF);
cb(str);
if (cbarg) cbarg(str);
if (!if_noend) _parser.stdin = null;
}
}
}//»
function Seeker() {//«
this.start = x=>{}
this.end = x=>{}
}//»
function Writer() {//«
this.is_terminal = true;
if (flags.error) {
this.line = resperr; 
this.ch = resperrch; 
this.lines = resperrlines; 
this.object = resperrobj; 
}
else {
this.line = respsucc;
this.object = respsuccobj; 
this.ch = respsuccch;
this.lines = respsucclines;
this.blob = respsuccblob;
thisobj.stdout_writer = true;
}
this.flush = x=>{}
}//»

if (flags.read) _read = new Reader();
if (flags.write) _write = new Writer();
_seek = new Seeker();
thisobj.reset();
return thisobj;

}

function make_default_files() {//«
let arr = [];
arr[0] = new FileObj({read:true});
arr[1] = new FileObj({write:true});
arr[2] = new FileObj({write:true,error:true});
return arr;
}//»

//»
return {//«
h: Infinity,
w: Infinity,
ALIASES: {},
ENV: {USER: "user", EMAIL: ""},
EOF: {EOF: true},
FILES: make_default_files(),
FUNCS: {},
dirty: {},
file_objects:{},
get_homedir: _=> {return "/";},
kill_register:func=>{kill_funcs.push(func);},
refresh: noop,
response: response,
error: _err,
warn: _warn
}//»

}//»

let term = FakeTerminal(opts);
let parser = new NS.mods["sys.shell"](Core, term); //«
term.warn("Evaluating: <<< " + str + " >>>");
try {
parser.parse(str, "/", rv=>{
if (done_cb) done_cb(rv);
else {
term.warn("Returned", rv);
}
}, false, false);
}
catch(e){
term.warn("!!!!!   Caught error   !!!!!");
term.error(e);
}
//»

return {kill:_=>{parser.cancel();execute_kill_funcs();}}

}//»
//FS«

const sys_url = path => {
	let err = s => {
		console.error(s);
	};
	let sysroot = qobj.sysroot;
	if (sysroot) {
		let marr;
		if (!sysroot.match(/^\//)) {
			err("sysroot is not a fullpath! ignoring:" + sysroot);
		} else if (marr = sysroot.match(/^\/site(\/.+)$/)) return (marr[1] + "/" + path).regpath();
		else if (sysroot.match(/^\/loc\//)) {
			let url = loc_url((sysroot + "/" + path).regpath());
			if (url) return url + "&range=0-end";
			else {
				err("Local url not returned! ignoring:" + sysroot);
			}
		} else {
			err("Unsupported sysroot path(want /site or /loc):" + sysroot);
		}
	}
//	if (dev_env && dev_mode) return "/dev" + path;
	return "/root/code" + path;
};
this.sys_url = sys_url;

this.mime_of_path = function(str) {
	let marr;
	if (!(marr = str.match(/\.([a-z][a-z0-9]*)$/))) return "application/octet-stream";
	return ext_to_mime(marr[1]);
}
this.text_mime = function(str) {
	if (str.match(/^text\//) || str.match(/\/javascript$/)) return true;
	return false;
}

const load_mod = async(modname, cb, opts = {})=>{
	let use_type = opts.TYPE;
	let force = opts.FORCE;
	let call = opts.CALL;
	let path;
	let which = "mods";
	let trypath;
	let str;
	let have_cache = false;
	let hash_ret = true;
	const loadit = async () => {//«
		if (!str) return cb();
		if (!opts.noWrap) {
			if (which === "libs") str = `window[__OS_NS__].libs["${modname}"]=function(Core,shell_exports,com,args){"use strict";${str}\n}`;
			else str = `window[__OS_NS__].${which}["${modname}"]=function(Core,arg){"use strict";${str}\n}`;
		}
		let scr = make('script');
		scr.onload = () => {
			if (modname === "sys.shell") NS.mods["sys.shell"].eval = Eval;
			if (opts.noWrap) return cb(hash_ret);
			if (call) NS.mods[modname]();
			cb(hash_ret);
		};
		scr.onerror = e => {
			cerr(e);
			cb();
		};
		let path = "/runtime/" + which + "/" + modname + ".js";
		await fsapi.saveFsByPath(path, str, {
			ROOT: true
		});
		scr._src = Core.fs_url(path);
		document.head.add(scr);
	};//»
	async function tryfs() {
		str = await fsapi.readHtml5File(trypath, {
			ROOT: true
		});
		if (!str) return cb();
		if (have_cache) hash_ret = str.slice(-42,-2);
		loadit();
	};
	if (use_type) which = use_type;
	if (!force && NS[which][modname]) return cb(true);
	path = modname.replace(/\./g, "/");
	if (dev_mode) {
		try {
			let res = await fetch(sys_url('/' + which + '/' + path + ".js"));
			str = await res.text();
			loadit();
		} catch (e) {
			cerr(e);
			cb();
		}
	} 
	else {
		trypath = "/code/" + which + "/" + path + ".js";
		if (!await fsapi.pathExists(trypath)) {
			fs.install_app(path, tryfs, {
				MOD: true,
				TYPE: use_type,
				onProgress: opts.onProgress
			});
		}
		else {
			have_cache = true;
			tryfs();
		}
	}
};
this.load_mod = load_mod;

const loadModule = (name, opts) => {
	return new Promise((res, rej) => {
		load_mod(name, rv => {
			res(rv);
		}, opts);
	});
};
api.loadMod=loadModule;
this.loadModule=loadModule;
this.loadModules=(mod_arr,opts_arr)=>{if(!opts_arr)opts_arr=[];let proms=[];for(let i=0;i<mod_arr.length;i++)proms.push(loadModule(mod_arr[i],opts_arr[i]));return Promise.all(proms);};

api.loadLib = (name, opts={})=>{
	opts.TYPE="libs";
	return loadModule(name, opts);
};
this.load_lib = (name, cb)=>{load_mod(name,cb,{TYPE:"libs"});}



const make_script = (path, load, err, ifrand, win) => {
	let scr = make('script');
	document.head.appendChild(scr);
	if (win) win.scr = scr;
	if (load) {
		scr.onload = _ => {
			load(scr);
		};
	}
	if (err) {
		scr.onerror = e => {
			err(e, scr);
		};
		scr._onerror = e => {
			err(e, scr);
		};
	}
	scr._src = path;
	return scr;
};
this.make_script = make_script;
const makeScript=path=>{return new Promise((Y,N)=>{make_script(path,Y,N);});};
api.makeScript=makeScript;
api.makeScripts=arr=>{let proms=[];for(let p of arr)proms.push(makeScript(p));return Promise.all(proms);};

const mod_url=(arg,is_sys)=>{var use="mods/";if(is_sys)use="";return fs_url("code/"+use+arg.replace(/\./g,"/")+".js");}
this.mod_url=mod_url;
const fs_url = (path) => {
	if (path) path = path.replace(/^\/+/, "");
	else path = "";
	return "filesystem:" + window.location.origin + "/" + (use_fs_type || fs_type) + "/" + FSBRANCH + "/" + path;
}
this.fs_url=fs_url;
const loc_url = (path, opts) => {
	if (!opts) opts = {};
	if (opts.WS) {
		let useport = globals.local_port || 20001;
		return "ws://127.0.0.1:" + useport;
	}
	let url = null;
//	let base = globals.local_host + ":" + globals.local_port;
	let base = window.location.protocol + "//" + globals.local_host + ":" + globals.local_port;
	if (globals.local_port) {
		if (!path) url = base;
		else url = base + "/?path=" + encodeURIComponent(path.replace(/^\/loc/, ""));
	} else return null;
	if (opts.REMOTE) url = url + "&is_remote=1";
	return url;
};
this.loc_url = loc_url;

//»
//Terminal«

//Jobs

const JobApp=function(jobid){//«
let servobj;
let servid=null;
let JobService=function(){
this.is_job = true;
let stdin_cb=null;
let stdout_cb=null;
let stderr_cb=null;
let exports={name:"job","job-id":""+jobid,stdin:arg=>{if(stdin_cb)stdin_cb(arg);else cwarn("NO STDIN_CB!");},stdout:arg=>{if(stdout_cb)stdout_cb(arg);else{if(arg instanceof Function)stdout_cb=arg;else{if(arg && arg.EOF && Object.keys(arg).length==1)return;console.log("[JOB "+jobid+" STDOUT]",arg);}} },stderr:arg=>{if(stderr_cb)stderr_cb(arg);else{if(arg instanceof Function)stderr_cb=arg;else{if(arg && arg.EOF && Object.keys(arg).length==1)return;console.log("[JOB "+jobid+" STDERR]",arg);}} }};
this.exports = exports;
this.setid=idarg=>{servid=idarg;}
this.set_stdin_cb=cbarg=>{stdin_cb=cbarg;}
this.set_stdout_cb=cbarg=>{stdout_cb=cbarg;return()=>{stdout_cb=null;}}
this.set_stderr_cb=cbarg=>{stderr_cb=cbarg;return()=>{stderr_cb=null;}}
}

this.file_objects = {};
this.dirty = {};
this.kill=()=>{
cwarn("Stopping JobService: " + servid);
if (servid !== null) fs.stop_service(servid+"");
if (this.dirty) {
let keys = Object.keys(this.dirty);
let arr = [];
for (let i=0; i < keys.length; i++) if (this.dirty[keys[i]]) arr.push(keys[i]);
let iter = -1;
let sync=()=>{
iter++;
let key = arr[iter];
let obj = this.dirty[key];
if (obj) {
obj.write.sync(ret=>{
if (!ret){
cerr("Job: "+jobid+" NO RET FROM SYNC!!!!!!");
}
sync();
});
}
else {
this.file_objects={};
this.dirty={};
}
}
sync();
}
}
servobj = new JobService();
this.service = servobj;

fs.start_service(servobj);

//fs.start_service(servobj).then(rv=>{
//log(rv);
//});
//let rv = await fs.start_service(servobj);


}//»

this.register_job=comarg=>{jobs[last_job_id]={str:comarg,cbs:[],_:new JobApp(last_job_id)};return last_job_id++;}
this.check_job_id=idarg=>{return jobs[idarg];}
this.set_job_cb=(idarg,cb)=>{let obj=jobs[idarg];if(!obj){cerr("register_job_cb():GOT NO JOB???? "+idarg);return;}obj.cbs.push(cb);}
this.unregister_job=idarg=>{cwarn("unregister_job:"+idarg);let job=jobs[idarg];if(job)job._.kill();jobs[idarg]=undefined;}
this.get_job_list=()=>{var ret=[];for(let i=0;i<jobs.length;i++){let job=jobs[i];if(job)ret.push(i+"  "+job.str);}return ret;}
this.kill_job = idarg => {
	let job = jobs[idarg];
	if (!job) return false;
	job._.kill();
	for (let cb of job.cbs) cb();
	jobs[idarg] = undefined;
	return true;
}

this.save_hook=path=>{let arr=path.split("/");if(!arr[arr.length-1])arr.pop();let fname=arr.pop();fs.add_new_kid(arr.join("/"),fname,_=>{});}

const get_history = (which, cb, if_getonly, dsk) => {
	let gothist;
	let _historys;
	if (dsk) _historys = dsk.historys;
	else _historys = historys;
	gothist = _historys[which];
	if (gothist) return cb(gothist.slice(0));
	let hist_fname = "/var/history/" + which + ".txt";
	fs.getfile(hist_fname, ret => {
		if (ret) {
			let arr = ret.split("\n");
			if (!arr.length - 1) arr.pop();
			if (if_getonly) return cb(arr);
			_historys[which] = arr;
		} else {
			if (if_getonly) return cb(null);
			_historys[which] = [];
		}
		let iter_str = which + "_ITER";
		if (dsk) iter_str = `test_${iter_str}`;
		let iter = lst[iter_str];
		let hist = _historys[which];
		if (iter) {
			let sh_iter = parseInt(iter);
			for (let i = 0; i <= sh_iter; i++) {
				let k = which + ":" + i;
				hist.push(lst[k]);
				delete lst[k];
			}
			hist = hist.uniq();
			fs.save_fs_by_path(hist_fname, hist.join("\n"), (ret2, err) => {
				lst[iter_str] = "-1";
				cb(hist.slice(0));
			},{DSK: dsk});
		} else cb(hist.slice(0));
	},{DSK:dsk});
}
this.get_history = get_history;
this.api.getHistory=(which,getonly,dsk)=>{return new Promise((y,n)=>{get_history(which,y,getonly,dsk);});};
const set_local_storage=(k,v, dsk)=>{
	k=`${FSPREF}-${k}`;
	if (dsk) k = `test-${k}`;
	localStorage[k]=v;
};
this.set_local_storage=set_local_storage;
const get_local_storage=(k, dsk)=>{
	k=`${FSPREF}-${k}`;
	if (dsk) k = `test-${k}`;
	return localStorage[k];
};
this.get_local_storage=get_local_storage;
const del_local_storage=(k,dsk)=>{
	k=`${FSPREF}-${k}`;
	if (dsk) k = `test-${k}`;
	delete localStorage[k];
};
this.del_local_storage=del_local_storage;

this.save_shell_com = (comarg, which, dsk) => {
	let _historys;
	if (dsk) _historys = dsk.historys;
	else _historys = historys;
	if (!_historys[which]) _historys[which]=[];
	let MAX_COM_LEN = 1000;
	if (!comarg) return;
	else if (comarg.match(/^\x20+$/)) return;
	comarg = comarg.trim();
	if (comarg.length > MAX_COM_LEN) {
		cerr("Refusing to save command string>MAX_COM_LEN(" + MAX_COM_LEN + ")");
		log("MAYBE USE A SCRIPT(JUSTATHOUGHT)");
		return;
	}
	let iter_str = which + "_ITER";
	if (dsk) iter_str = `test_${iter_str}`;
	if (dsk){
		if (!comarg || (dsk.last_history_com === comarg)) return;
	}
	else if (!comarg || (last_history_com === comarg)) return;
	let lst = localStorage;
	let str = lst[iter_str];
	if (!str) str = "-1";
	let iter = parseInt(str);
	iter++;
	lst[which + ":" + iter] = comarg;
	lst[iter_str] = iter + "";
	_historys[which].push(comarg);
	if (dsk) dsk.last_history_com = comarg;
	else last_history_com = comarg;

}

//»
//Network/XHR«
const refresh_stats = () => {
	return new Promise(async (y, n) => {
		let rv=await fetch(`/_status`);
		if (!(rv&&rv.ok)) return y();
		let arr = (await rv.text()).split("\n");
		globals.stats.USERNAME = arr[0];
		globals.stats.EMAIL = arr[1];
		return y(arr[0]);
//		Desk.update_status(arr[0]);
/*
		let rv = await fetch("/_status");
		if (rv && rv.ok === true) globals.stats = await rv.json();
		else globals.stats = {}
		y(globals.stats);
*/
	});
};
api.refreshStats=refresh_stats;

/*
const loginout =(which,cb) => {//«
	return new Promise((Y, N) => {
		let win = window.open("/" + which.toLowerCase(), which, "width=700,height=500");
		const end = async () => {
			clearInterval(interval);
			await refresh_stats();
			Y(true);
			cb&&cb();
		};
		let interval = setInterval(() => {
			try {
				if (win && win.top) {} else {
					clearInterval(interval);
					end();
				}
			} catch (e) {
				clearInterval(interval);
				end();
			}
		}, 200);
	});
}//»
api.login=(cb)=>{return loginout("Login",cb);};
api.logout=(cb)=>{return loginout("Logout",cb);};
*/

this.get_email=()=>{
throw new Error("Get yer *own* damn email, what're you buggin me about that fer?");
};

const start_local_ws=()=>{let cb=null;if(!globals.local_port)return cerr("Not starting local websockets,need a local_port!");let ws=new WebSocket("ws://localhost:"+globals.local_port);ws.binaryType="arraybuffer";ws.onmessage=e=>{let str=api.bytesToStr(e.data);if(cb)cb(str);};ws.onopen=_=>{cwarn("WSOPEN")};};

this.get_channel_message=()=>{return system_messages.shift();}
this.send_channel_message=(dat)=>{system_channel.postMessage(dat);}

const xgettext=(url,cb)=>{xget(url,ret=>{if(ret && typeof ret==="string")cb(ret);else cb();},true);}
this.xgettext=xgettext;
api.xgetText=path=>{return new Promise((Y,N)=>{xgettext(path,Y);});}

const xgetobj = (url, cb, blob_arg, upload_prog_cb) => {//«
	let tryparse = str => {
		try {
			return JSON.parse(str);
		} catch (e) {
			log(str);
			cerr(e.message);
		}
	};
	xget(url, (ret, err) => {
		if (err) {
			let stat = err.STAT ? ("(" + err.STAT + ")") : "";
			if (err.MESS) cb(null, err.MESS.split("\n").join(" ") + stat);
			else if (err.ERR) cb(null, "There was an unspecified network error");
			else cb(null, err);
		} else {
			let obj = tryparse(ret);
			if (obj) cb(obj);
			else {
				cwarn(ret);
				cb(null, "JSON.parse error in xgetobj from url:" + url);
			}
		}
	}, true, blob_arg, null, upload_prog_cb);
};
this.xgetobj=xgetobj;
api.xgetObj=(path,blob)=>{return new Promise((Y,N)=>{xgetobj(path,Y,blob);});}
//»
this.xpostblob = function(url, blob, cb, if_text){xget(url, cb, if_text, blob);}
api.xpost=(url,blob,opts={})=>{//«
	return new Promise((y,n)=>{
		xgetobj(url,((succ,err)=>{
			if (succ) return y(succ);
			if (err) y({ERR: err});
			else y({ERR: "Unknown network error"});
		}), blob, opts.onUpProgress);
	});
};//»
this.xgetfile = (url, cb, stream_cb, if_text) => {//«
	let type, nBytes, gotBytes;
	const chunkSize = 1024 * 1024;
	let err = (stat, resp) => {
		if (resp instanceof Blob) blob_as_text(resp, blobret => {
			cb(null, {
				'STAT': stat,
				'MESS': blobret
			})
		});
		else cb(null, {
			'STAT': stat,
			'MESS': resp
		})
	};
	const getchunk = () => {
		var xhr = new XMLHttpRequest();
		var getlen;
		if (if_text) xhr.responseType = 'text';
		else xhr.responseType = 'blob';
		if (!stream_cb) xhr.open("GET", url + "&range=0-end");
		else {
			let endByte = gotBytes + chunkSize;
			if (endByte >= nBytes) endByte = nBytes;
			if (gotBytes >= endByte) return;
			getlen = endByte - gotBytes;
			xhr.open("GET", url + "&range=" + gotBytes + "-" + endByte);
		}
		xhr.onload = function() {
			if (this.status == 200) {
				let blob = this.response;
				if (typeof blob === "string") return cb(blob);
				if (!(blob instanceof Blob)) return cwarn("No blob received!");
				let size = blob.size;
				if (!size) return cwarn("No size returned");
				if (!stream_cb) {
					cb(blob);
				} else {
					if (size != getlen) {
						cerr("GOTSIZE:", size, "  != GETLEN:", getlen);
						return;
					} else {}
					gotBytes += size;
					stream_cb(blob);
					if (gotBytes == nBytes) cb();
				}
			} else err(this.status, this.response)
		};
		xhr.send();
	};
	if (stream_cb) stream_cb(null, getchunk);
	else return getchunk();
	let xhr = new XMLHttpRequest();
	xhr.open("GET", url + "&getsize=1");
	xhr.onload = function() {
		if (this.status == 200) {
			let lentxt = this.responseText;
			if (!(lentxt && lentxt.match(/^[0-9]+$/))) return cb();
			nBytes = parseInt(lentxt);
			stream_cb(null, null, nBytes);
			gotBytes = 0;
			type = xhr.getResponseHeader("Content-Type");
			getchunk();
		} else err(this.status, this.response);
	};
	xhr.send()
}//»
const xget = (url, cb, if_text, blob_to_post, prog_cb, upload_prog_cb) => {//«
	let xhr = new XMLHttpRequest();
	let upload;
	if (upload_prog_cb){
		let upload = xhr.upload;
		upload.onprogress = upload_prog_cb;
	}
	let method = 'GET';
	if (blob_to_post) method = "POST";
	xhr.open(method, url, true);
	if (if_text) xhr.responseType = 'text';
	else xhr.responseType = 'blob';
	xhr.onreadystatechange = function() {
		if (this.readyState == xhr.HEADERS_RECEIVED) {}
	};
	xhr.onprogress = prog_cb;
	xhr.onload = function() {
		if (this.status == 200) {
			let blob = this.response;
			let blobtype = blob.type;
			if (typeof blob === "string") cb(blob);
			else if (blobtype && blobtype.match && (blobtype.match(/^text/) || blobtype == "application/json" || blob.type == "application/javascript")) {
				let reader = new FileReader();
				reader.onloadend = function() {
					cb(reader.result);
				};
				reader.onerror = function(e) {
					cb();
				};
				reader.readAsText(blob);
			} else if (blob instanceof Blob) {
				let reader = new FileReader();
				reader.onloadend = function() {
					cb(reader.result);
				};
				reader.readAsArrayBuffer(blob);
			} else {
				cerr("Unknown response in Core.xget");
				log(blob);
			}
		} else {
			let gotstat = this.status;
			if (this.response instanceof Blob) {
				blob_as_text(this.response, function(blobret) {
					cb(null, {
						'STAT': gotstat,
						'MESS': blobret
					})
				});
			} else cb(null, {
				'STAT': gotstat,
				'MESS': this.response
			});
		}
	};
	xhr.onerror = function() {
		cb(null, {
			'ERR': true
		});
	};
	try {
		if (blob_to_post) xhr.send(blob_to_post);
		else xhr.send()
	} catch (e) {
		cerr(e)
	}
};
this.xget = xget;
api.xget=(url,opts={})=>{return new Promise((Y,N)=>{xget(url,Y,opts.text,opts.blob,opts.onProgress);});}
//»
//»
//Util«

api.initSW = if_unreg => {//«
	return new Promise(async (Y, N) => {
		if (!navigator.serviceWorker) {
			cerr("There is no service worker support!");
			Y(false);
			return;
		}
		try {
			let reg = await navigator.serviceWorker.register('/_generateServiceWorker?path=' + encodeURIComponent("." + window.location.pathname + window.location.search), {
				scope: window.location.pathname
			});
			log("SWRegistration", reg);
			if (if_unreg) {
				cwarn("Unregistering...");
				if (await reg.unregister()) Y(true);
				else Y(false);
			} else Y(true);
		} catch (e) {
			cerr(e);
			Y(false);
		}
	});
}//»

api.configPath=path=>{return new Promise(async(Y,N)=>{let trypath=home_path+"/.config/"+path;if(await fsapi.pathToNode(trypath))return Y(trypath);Y("/etc/config/"+path);});};
api.getInitStr = (path, opts = {}) => {
	return new Promise(async (Y, N) => {
		let initpath, trypath;
		if (!opts.noGet) {
			await fsapi.cacheFileIfNeeded("/etc/" + path, {
				def: opts.def,
				FSROOT: opts.FSROOT
			});
		}
		trypath = home_path + "/." + path;
		if (await fsapi.pathToNode(trypath)) initpath = trypath;
		if (!initpath) initpath = "/etc/" + path;
		let step = await NS.initstep("Using file:\xa0'" + initpath + "'");
		Y(await fsapi.readHtml5File(initpath));
		step.ok();
	});
};
const blob_as_text=(blob,cb)=>{let reader=new FileReader();reader.onloadend=()=>{cb(reader.result);};reader.onerror=function(){cb();};reader.readAsText(blob);};
const simulate=(element,eventName,locarg)=>{let oEvent,eventType=null;const eventMatchers={'HTMLEvents':/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,'MouseEvents':/^(?:contextmenu|dragstart|click|dblclick|mouse(?:enter|leave|down|up|over|move|out))$/};const options={pointerX:0,pointerY:0,button:0,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,bubbles:true,cancelable:true};if(locarg){options.pointerX=locarg.x;options.pointerY=locarg.y;}for(let name in eventMatchers){if(eventMatchers[name].test(eventName)){eventType=name;break;}}if(!eventType)throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');oEvent=document.createEvent(eventType);if(eventType=='HTMLEvents')oEvent.initEvent(eventName,options.bubbles,options.cancelable);else oEvent.initMouseEvent(eventName,options.bubbles,options.cancelable,document.defaultView,options.button,options.pointerX,options.pointerY,options.pointerX,options.pointerY,options.ctrlKey,options.altKey,options.shiftKey,options.metaKey,options.button,element);element.dispatchEvent(oEvent);return element;}
this.simulate = simulate;

const doParseNumber = (thisarg, opts, if_float) => {//«
	if (thisarg.match(/^0+$/)) thisarg="0";
	const dec = /^([-+])?[0-9]+(e[-+]?([0-9]+))?$/i,
		dec_dot = /^([-+])?([0-9]+)?\.[0-9]*(e[-+]?([0-9]+))?$/i,
		hex = /^([-+])?0x[0-9a-f]+$/i,
		oct = /^([-+])?0o[0-7]+$/,
		bin = /^([-+])?0b[01]+$/;
	let MIN = -Infinity;
	let MAX = Infinity;
	let KEYS = ["POS", "NEG", "NOTNEG", "NOTPOS", "NOTZERO", "MIN", "MAX", "DOTOK"];
	let val;
	let str;
	if (!opts) opts = {};
	for (let k of Object.keys(opts)) {
		if (!KEYS.includes(k)) throw new Error("Invalid option:" + k);
	}
	if (Number.isInteger(opts.MIN)) MIN = opts.MIN;
	else if (opts.MIN) throw new Error("Invalid value to MIN:" + opts.MIN);
	if (Number.isInteger(opts.MAX)) MAX = opts.MAX;
	else if (opts.MAX) throw new Error("Invalid value to MAX:" + opts.MAX);

	if (thisarg.match(dec) || thisarg.match(dec_dot)) {
		if (thisarg == "0") str = thisarg;
		else str = thisarg.replace(/^0+/, "");
	} else str = thisarg;
	if (str.match(dec) || str.match(hex) || str.match(oct) || str.match(bin)) val = eval(str);
	else {
		if ((if_float || opts.DOTOK) && (str.match(dec_dot))) {
			if (if_float) val = eval(str);
			else val = Math.floor(eval(str));
		} else return NaN;
	}
	if (opts.POS && val <= 0) return NaN;
	if (opts.NEG && val >= 0) return NaN;
	if (opts.NOTNEG && val < 0) return NaN;
	if (opts.NOTPOS && val > 0) return NaN;
	if (opts.NOTZERO && val == 0) return NaN;
	if (val < MIN) return NaN;
	if (val > MAX) return NaN;
	return val;
};//»
this.set_global_drop=(obj,cb)=>{global_drops[drop_iter]={obj:obj,cb:cb};return drop_iter++;}
this.get_global_drop=(str,update_cb)=>{let marr;if(!(str && str.match &&(marr=str.match(/^global-drop:(\d+)$/))))return;let num=parseInt(marr[1]);let obj=global_drops[num];if(obj.cb)obj.cb(update_cb);global_drops[num]=null;return obj.obj;}
const get_username=()=>{if(current_user)return current_user;current_user=get_local_storage("current_user");return current_user;};
this.get_username=get_username;
const set_username=val=>{if(!val){current_user=null;return;}current_user=val;set_local_storage("current_user",val);}
this.set_username=set_username;
const get_users=()=>{if(users)return users;let str=get_local_storage("users")||"{}";users=JSON.parse(str);return users;};
this.get_users=get_users;
const set_users=(arg)=>{users=arg;set_local_storage("users",JSON.stringify(arg));};
this.set_users=set_users;
const get_term_prompt=num=>{let str=SYSNAME+"\x20(tty#"+num+")";if(qobj.nosyslock)str=str+"\nYou are in 'no system lock' mode... please be cautious!";return str;}
const dodev=()=>{if(is_offline)return false;return dev_mode;}
const set_appvar=(win,key,val,dsk)=>{let g;if(dsk)g=dsk.globals;else g=globals;g.AppVars[win.app+"-"+key]=val;}
this.set_appvar = set_appvar;
const get_appvar=(win,key,dsk)=>{let g;if(dsk)g=dsk.globals;else g=globals;return g.AppVars[win.app+"-"+key];}
this.get_appvar = get_appvar;

const getkeys=(obj)=>{let arr=Object.keys(obj);let ret=[];for(let i=0;i<arr.length;i++){if(obj.hasOwnProperty(arr[i]))ret.push(arr[i]);}return ret;}

const pi=(str)=>{return parseInt(str, 10);}

const trace = (args,num) => {//«
	let stack = (new Error()).stack;
	let s = stack.split("\n")[3];
	let marr;
	if (marr = s.match(/(filesystem:.+)/)){
		let arr = marr[1].split("/");
		let s = arr.pop();
		let which = arr.pop();
		arr = s.split(":");
		let col = arr.pop();
		let ln = arr.pop();
		let name = arr.pop();
		let str = '[ '+which+"."+name+":"+ln+" ]";
		if (num===0) console.log(...args,str);
		else if (num===1) console.warn(...args,str);
		else console.error(...args,str);
	}
	else if (marr = s.match(/(blob:.+)/)){
		s = marr[1];
		let arr = s.split(":");
		let col = arr.pop();
		let line = arr.pop();
		s = arr.join(":");
		let which = blobs[s];
		let str = '[ '+which + ":" + line+" ]";
		if (num===0) console.log(...args,str);
		else if (num===1) console.warn(...args,str);
		else console.error(...args,str);
	}
	else{
console.warn(`Cannot trace url (${s})`);
	}
};//»
const log=(...args)=>{if(dev_mode || qobj.verbose)trace(args,0);}
this.log = log;
const cwarn = (...args) => {
	if (dev_mode || qobj.verbose) trace(args, 1);
}
this.cwarn=cwarn;
const cerr=(...args)=>{if(dev_mode || qobj.verbose)trace(args,2);}
this.cerr=cerr;

//»
//Prototypes«
function set_protos() {
let _;
const set_style_props=(which,arr)=>{for(var i=0;i<arr.length;i+=2){(function(k,v){Object.defineProperty(which.prototype,k,{get:function(){var val=this.style[v];if(k.length==1){return parseInt(val);}return val;},set:function(arg){this.style[v]=arg;}});})(arr[i],arr[i+1]);}}
set_style_props(HTMLElement,//«
[
"fs","fontSize",
"fw","fontWeight",
"tcol","color",
"bgcol","backgroundColor",
"bgimg","backgroundImage",
"pad", "padding",
"padt", "paddingTop",
"padb", "paddingBottom",
"padl", "paddingLeft",
"padr", "paddingRight",
"mar", "margin",
"mart", "marginTop",
"marb", "marginBottom",
"marl", "marginLeft",
"marr", "marginRight",
"bor", "border",
"bort", "borderTop",
"borb", "borderBottom",
"borl", "borderLeft",
"borr", "borderRight",
"borrad","borderRadius",
"pos","position",
"dis","display",
"vis","visibility",
"op", "opacity",
"ta", "textAlign",
"td", "textDecoration",
"ff", "fontFamily",
"lh", "lineHeight",
"over", "overflow",
"overx", "overflowX",
"overy", "overflowY",
"mxh", "maxHeight",
"maxh", "maxHeight",
"mxw", "maxWidth",
"maxw", "maxWidth",
"mh", "minHeight",
"minw", "minWidth",
"minh", "minHeight",
"mw", "minWidth",
"scl","scale",
"fld","flexDirection",
"flb","flexBasis",
"fls","flexShrink",
"flg","flexGrow",
"flx","flex",
"jsc","justifyContent",
"ali","alignItems",
"als","alignSelf",
"x","left", //Start parsing ints at 'x'
"y","top",
"r","right",
"b","bottom",
"z", "zIndex",
"w","width",
"h", "height"
]);//»
set_style_props(SVGElement,//«
[
"op","opacity",
"dis","display"
]);//»
Object.defineProperty(HTMLElement.prototype,'_src',{get:function(){return this.src;},set:function(arg){if(!arg)return;let marr;let thisobj=this;if(marr=arg.match(/^filesystem:https?:\/\/.+?\/[a-z]+(\/.+$)/)){if((window.requestFileSystem+"").match(/native code/)){this.src=arg;return;}let istext=false;let usemime="data";if(arg.match(/\.(js|txt|json|sh|html|htm)$/)){istext=true;usemime="text/plain";}if(fs){let getcb=ret=>{if(ret)this.src=URL.createObjectURL(new Blob([ret],{type:usemime}));else if(thisobj._onerror)thisobj._onerror();};let arr=marr[1].split("/");arr.shift();arr.shift();let path='/'+arr.join("/");if(istext)fs.getfile(path,getcb,{ROOT:true});else fs.get_fs_data(path,getcb,null,true);}else{let arr=marr[1].split("/");if(!arr[0])arr.shift();let fname=arr.pop();let curdir=globals.fs_root;let err=(str)=>{cwarn("fs.src setter error,check for _onerror");cerr(thisobj._onerror);if(thisobj._onerror)thisobj._onerror();};let getdir=(dirarg)=>{if(arr.length){dirarg.getDirectory(arr.shift(),{},ret=>{getdir(ret)},e=>{err("#42.0");});return;}dirarg.getFile(fname,{},fent=>{fent.file(file=>{var reader=new FileReader();reader.onloadend=function(e){thisobj.src=URL.createObjectURL(new Blob([this.result],{type:usemime}));};if(istext)reader.readAsText(file);else reader.readAsArrayBuffer(file);},()=>{err("#42.2");});},()=>{err("#42.1");});};getdir(globals.fs_root);}}else{this.src=arg;}}});
Object.defineProperty(Object.prototype,'keys',{get:function(){return Object.keys(this);},set:function(){}});
Object.defineProperty(Object.prototype,'vals',{get:function(){let arr=[];let keys=Object.keys(this);for(let k of keys){arr.push(this[k]);}return arr;},set:function(){}});

Blob.prototype.toString = function() {return '[Blob ('+this.size+', "'+this.type+'")]';}
Blob.prototype.render=function(parelem,pardoc){let usedoc=pardoc||document;let type=this.type;let size=this.size;const blob_str=()=>{return '[Blob('+size+',"'+type+'")]';};const corrupt_str=()=>{return "Corrupt:"+blob_str();};const add_str=(str)=>{parelem.insertAdjacentHTML('beforeend',str)};let hash={"image":"img","audio":"audio","video":"video"};let marr=type.match(/^(image|video|audio)\//);if(marr&&marr[1]){let elem=usedoc.createElement(hash[marr[1]]);let url=URL.createObjectURL(this);let playfunc=function(){URL.revokeObjectURL(url);};elem.onerror=function(){add_str('<span style="padding:7;background-color:#800;color:#fff;">'+corrupt_str()+'</span>');URL.revokeObjectURL(url);};elem.src=url;parelem.appendChild(elem);if(elem.play){elem.oncanplay=playfunc;elem.controls=true;elem.play();}else elem.onload=playfunc;}else add_str("<div>"+blob_str()+"</div>");}
Blob.prototype.isText=function(){var t = this.type;return (t.match(/^text\//)||t.match(/\/(javascript|json)$/));}

_ = Array.prototype;
_.eq=function(arg){
	if (!(arg instanceof Array)) return false;
	let ln = this.length;
	if (ln!==arg.length) return false;
	for (let i=0; i < ln; i++) {
		if (this[i]!==arg[i]) return false;
	}
	return true;
};
_.uniq =  [].uniq || function(a){return function() {return this.filter(a)}}(function(a,b,c) {return c.indexOf(a,b + 1) < 0})
_.splicein=function(arr,pos,lenarg){let uselen=arr.length;if(lenarg || lenarg==0)uselen=lenarg;let args=[pos,uselen].concat(arr);Array.prototype.splice.apply(this,args);}
_.clone=function(){var arr=[];for(var i=0;i<this.length;i++){if(this[i].clone){arr[i]=this[i]['clone']();break;}arr[i]=this[i];}return arr;}
_.maxlen=function(){var str=this.reduce(function(a,b){return a.length>b.length ? a:b;});return str.length}
_.rm=function(arg){if(!arg)return;var num=this.indexOf(arg);if(num>-1)this.splice(num,1);}

_ = HTMLElement.prototype;
_.loc = function(x, y) {
	if (x != 0 && !x) return {
		'X': this.style.left,
		'Y': this.style.top
	};
	else {
		this.style.left = x;
		this.style.top = y;
	}
}
_.dims = function(w, h) {
	if (w != 0 && !w) return {
		W: this.style.width,
		H: this.style.height
	};
	else {
		this.style.width = w;
		this.style.height = h;
	}
}
_.del = function(){if (this.parentNode) {this.parentNode.removeChild(this);}}
_.ael = function(which, fun){this.addEventListener(which, fun, false);}
_.attset = function(key, val) {this.setAttribute(key,val);}
_.attget = function(key) {return this.getAttribute(key);}
_.html = function(str) {this.innerHTML = str;}
_.add=function(kid){this.appendChild(kid);}
_.vcenter=function(amount){if(!amount)amount="50%";this.pos="relative";this.y=amount;this.style.transform="translateY(-"+amount+")";}
_.flexcol=function(if_off){if(if_off){this.style.display="";this.style.alignItems="";this.style.justifyContent="";this.style.flexDirection="";}else{this.style.display="flex";this.style.alignItems="center";this.style.justifyContent="center";this.style.flexDirection="column";}}

_ = String.prototype;
_.appname=function(){return this.split(".").pop();}
_.regpath=function(if_full){var str=this;if(if_full)str="/"+str;str=str.replace(/\/+/g,"/");if(str=="/")return "/";return str.replace(/\/$/,"");}
_.regstr=function(useend){var endsp="";if(useend)endsp=" ";return this.replace(/^[\x20\t]+/g,"").replace(/[\x20\t]+$/g,endsp).replace(/[\x20\t]+/g," ");}
_.rep = function (num) {var ret = "";for (var i=0; i < num; i++) {ret = ret + this;}return ret;}
_.lc = function (){return this.toLowerCase();}
_.uc = function (){return this.toUpperCase();}
_.tonbsp = function(){return this.split(/\x20/).join("&nbsp;")}
_.urienc = function() {return encodeURIComponent(this)};
_.htmlesc = function() {return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');}
_.chomp = function () {return this.replace(/\x20+$/g, "");}
_.firstup = function() {return this.charAt(0).toUpperCase() + this.slice(1);}
_.lpad=function(num,fill){var tmp;if(this.length<num)return fill.repeat(num-this.length)+this;return this;}
_.pi = function(opts) {return doParseNumber(this, opts);}
_.pir=function(lo,hi){if(!(Number.isFinite(lo)&&Number.isFinite(hi)&&hi>lo))throw new Error("Invalid arguments to String.pir");return doParseNumber(this,{MIN:lo,MAX:hi});}
_.ppi=function(opts){if(!opts)opts={};opts.POS=true;return doParseNumber(this,opts);}
_.pnni=function(opts){if(!opts)opts={};opts.NOTNEG=true;return doParseNumber(this,opts);}
_.pf=function(opts){return doParseNumber(this,opts,true);}

_=SVGElement.prototype;
_.sim = function(which) {simulate(this, which);}
_.down = function() {simulate(this, 'mousedown');}
_.ael = function(which, fun){this.addEventListener(which, fun, false);}
_.add = function(...args) {
	for (let kid of args) this.appendChild(kid);
}
_.del = function() {if (this.parentNode) this.parentNode.removeChild(this);}
_.attset = function(key, val) {this.setAttribute(key,val);}
_.attget = function(key) {return this.getAttribute(key);}

}//»

this.init = async(arg, userarg)=>{//«

//Var«

	const updates=[];
	let is_app;
	let app_path;
	let is_desk;
	let app_win;
	let is_shell;
	let winpath = window.location.pathname;
	let rv;
	let marr;
//	if (is_app){}
	if (winpath=="/shell.os") is_shell = true;
	else if (winpath == "/desk.os") is_desk = true;
	else if (marr = winpath.match(/^\/(.+)\.app$/)) {
		is_app=marr[1].replace(/\//g,".");
		app_path = `${marr[1]}.js`;
	}
	else {
console.error("Path no good: " + winpath);
		return;
	}
	globals.stats={};
	if (userarg){
		try{
			globals.stats = JSON.parse(atob(userarg));
		}
		catch(e){
console.error(e);
		}
	}
	let ua = navigator.userAgent;
	if (ua.match(/Chrome/)){
		globals.is_chrome=true;
		if (ua.match(/Macintosh/)) globals.is_mac=true;
	}
	else if (ua.match(/Firefox/))globals.is_ff=true;

	let initlog = NS.initlog;
	let initstep = NS.initstep;
	let step;

	let SYSTEM_IS_LOCKED = false;
	let use_init_func;

	globals.fs_root = arg.FS;
	fs_type = arg.FSTYPE;
	use_fs_type = arg.USEFSTYPE;
	if (!use_fs_type && (lst.FSTYPE!=fs_type)) lst.FSTYPE = fs_type;
	globals.fs_type = fs_type;
	globals.use_fs_type = use_fs_type;

	FSLET = arg.FSLET;
	globals.fs_let = FSLET;
	globals.FSLET = FSLET;

	FSBRANCH = arg.FSBRANCH;
	globals.fs_branch = FSBRANCH;
	globals.FSBRANCH = FSBRANCH;

	FSPREF = FSLET+"-"+FSBRANCH;
	globals.FSPREF = FSPREF;

	Core.sysfstype=dsk=>{
		if (!dsk) return (use_fs_type ||fs_type);
		return dsk.fs_type;
	};
	Core.sysfsbranch=dsk=>{
		if (!dsk) return FSBRANCH;
		return dsk.fs_branch;
	};
/*//«
	Core.sysfsbase=dsk=>{
		if (!dsk) return ("/" + (use_fs_type ||fs_type).slice(0,4)+"/"+FSBRANCH);
		return ("/" + (dsk.fs_type).slice(0,4)+"/"+dsk.fs_branch);
	};
//»*/
	if (is_shell && qobj.nosyslock){}
	else if (!is_app) {
		step=await initstep("Initializing the BroadcastChannel (for system integrity)");
		if (!('BroadcastChannel' in window)) {
			step.fail();
//			return initlog("BroadcastChannel API not found... aborting!");
			return;
		}
		step.ok();
		system_channel = new BroadcastChannel("system");
		system_channel.postMessage("init:"+FSPREF);
		system_channel.onmessage = e=>{//«
			let mess = e.data;
			if (mess=="init:"+FSPREF) {
				if (SYSTEM_IS_LOCKED) return;
				system_channel.postMessage("ack:"+FSPREF);
			}
			else if (mess=="ack:"+FSPREF) {
				globals.noevents = true;
				SYSTEM_IS_LOCKED = true;
				document.onkeydown=e=>{
					if (Desk) Desk.lock_system();
					else if (current_term) current_term.obj.lock_term();
				};
				document.onkeyup=null;
				document.onkeypress=null;
			}
			else if (mess.match && mess.match(/^(init|ack):/)){
	console.warn("Dropping: " + mess);
			}
			else {
				system_messages.push(mess);
	console.warn("Message received on the broadcast channel...");
	console.log(mess);
			}
		}//»
	}

	setTimeout(()=>{//«
		if (SYSTEM_IS_LOCKED){
			if (Desk) Desk.lock_system();
			else if (current_term) current_term.obj.lock_term();
		}
	},1500);//»
	set_protos();
//Developer stuff«
	if (winorig.match(/localhost/)||winorig.match(/127\.0\.0\.1/)||winorig.match(/192\.168\./)) {
		dev_env = true;
		globals.dev_env = true;
	}
	if (qobj.dev) {
		dev_mode = true;
		globals.dev_mode = true;
	}
//»
	globals.qobj = qobj;
	if (qobj.dev) {dev_mode = true;globals.dev_mode = true;}

//»
//Dom«
	body.style.margin = 0;
	body.style.overflow = "hidden";
	body.ff="sans-serif";
	body.fs="14px";
	if (1){
		let d = mk('div');
		d.pos="absolute";
		d.loc(-100,-100);
		d.op=0;
		d.w=0;
		d.h=0;
		body.add(d);
		d.add(copyarea);
	}
//»
//Load«

	const save_strings = async() => {//«
		step=await initstep("Saving system modules");
		fs.get_or_make_dir("code", "mods/sys", (modobj, moddir) => {
			let arr = [_ivars.core_str, "core", fs_str, 'fs'];
			let iter = -2;
			const dosave = () => {
				iter += 2;
				if (iter == arr.length) {
					delete _ivars.core_str;
					fs_str = null;
					step.ok();
					return;
				}
				let val = arr[iter];
				let name = arr[iter + 1];
				if (val && name) fs.save_fs_file(moddir, modobj, name + ".js", val, dosave);
				else dosave();
			};
			dosave();
		});
	}//»
	const init_fs = async(cb, is_reinit) => {//«
		step=await initstep("Initializing the filesystem");
		if (!is_reinit) fs.make_all_trees(()=>{
			step.ok();
			cb();
		});
		else {
			step.ok();
			cb();
		}
	}//»
	this.init_fs = init_fs;
	const initFs=is_reinit=>{return new Promise((Y,N)=>{init_fs(Y,is_reinit);});};
	api.initFs=initFs;
	const load_fs = async (cbarg) => {//«
		let str;
		let islive = dodev();
		let hash_ret=true;
		const loadit = async () => {//«
			str = `window[__OS_NS__].mods["sys.fs"]=function(Core,arg){"use strict";${str}\n}`;
			let scr = make('script');
			scr.onload = async() => {
				step.ok();
				step=await initstep("Running the 'fs' module");
				fs = new NS.mods["sys.fs"](Core, root);
				step.ok();
				fsapi = NS.api.fs;
				globals.fs = fs;
				cbarg(hash_ret);
			};
			scr.onerror = e => {
				step.fail();
				cerr(e);
				cbarg();
			};
			let url = URL.createObjectURL(new Blob([str], {
				type: "application/javascript"
			}));
			blobs[url] = "mods.sys.fs";
			scr.src = url;
			document.head.add(scr);
		};//»
		const doget = async () => {
			try {
				let res = await fetch(sys_url("/mods/sys/fs.js"));
				str = await res.text();
				if (!islive) fs_str = str;
				loadit();
			} catch (e) {
				cerr(e);
				cbarg();
			}
		};
		step=await initstep("Loading the 'fs' module");
		if (islive) {
			if (!dodev()) console.warn("Using live sys.fs");
			doget();
		} else {
			globals.fs_root.getDirectory("code/mods/sys", {}, dir => {
				dir.getFile("fs.js", {}, fent => {
					fent.file(file => {
						let rdr = new FileReader();
						rdr.onloadend = e => {
							str = rdr.result;
							hash_ret = str.slice(-42,-2);
							loadit();
						};
						rdr.readAsText(file);
					});
				}, ()=>{
					doget();
				})
			}, ()=>{
				doget();
			});
		}
	}//»
	const loadFs=()=>{return new Promise((Y,N)=>{load_fs(Y);});};
	api.loadFs=loadFs;

//»
//Event listeners«

	window.onbeforeunload = () => {//«
		let ifapi = NS.api.iface;
		if (ifapi) ifapi.closeAllConnections();
		if (Desk){
			let wins = Desk.get_windows(true);
			for (let w of wins){
				if (w.obj&&w.obj.onkill) w.obj.onkill();
			}
		}
		else if (app_win&&app_win.obj&&app_win.obj.onkill){
			app_win.obj.onkill();
		}
	};//»
    window.addEventListener("dragover",function(e){e =e||event;e.preventDefault();},false);
    window.addEventListener("drop",function(e){e =e||event;e.preventDefault();},false);

//»
//Local port«
	if (ENV.local_port&&!qobj.local_port) qobj.local_port=ENV.local_port+"";
	if (qobj.local_port) {//«
		let portstr = qobj.local_port;
		delete qobj.local_port;
		if (!portstr.match(/^[1-9][0-9]+$/)) {
			cwarn("Invalid local port string:" + portstr);
		} else {
			let locport = parseInt(portstr);
			if (locport < 1024 || locport > 65535) {
				cwarn("Invalid local port number(want 1024-65535):" + locport);
			} else globals.local_port = locport;
		}
		if (qobj.local_host) {
			let hoststr = qobj.local_host;
			if (hoststr=="localhost"||hoststr=="127.0.0.1"){
				globals.local_host = hoststr;
			}
			else if (!hoststr.match(/^192\.168\.\d+\.\d+\/?$/)) {
				console.error("invalid local host:" + hoststr + "(regex pattern is:/^192.168\\.\\d+\\.\\d+/?$/)");
			} else {
				hoststr = hoststr.replace(/^192/, "192");
				hoststr = hoststr.replace(/\/$/, "");
				globals.local_host = hoststr;
			}
//		} else globals.local_host = "http://127.0.0.1";
		} else globals.local_host = "localhost";
//console.log(`local_url:${window.location.protocol + "//" + globals.local_host + ":" + globals.local_port}`);
	}//»
//»

//Init«

const get_current_user=()=>{//«
	return new Promise(async(y,n)=>{
		get_username();
		get_users();
		if (!current_user){
			set_username("me");
			users[current_user] = await api.sha1(current_user);
			users["_"] = await api.sha1("root");
			set_users(users);
		}
		home_path = '/home/'+current_user;
		desk_path = get_local_storage("desk_path")||home_path+"/Desktop";
		globals.desk_path = desk_path;
		globals.home_path = home_path;
		try{
			step=await initstep("Creating all the system directories");
			await fsapi.touchHtml5Dirs([home_path],{reject:true});
			await fsapi.touchHtml5Dirs([desk_path],{reject:true});
//			await fsapi.touchHtml5File(desk_path+"/.",{reject:true});
			await fsapi.popHtml5Dirs(['/home']);
			step.ok();
		} catch (e) {
console.error(e);
			step.fail();
			NS.initlog("Desktop initialization failed: " + (e.message || e), true);
			return;
		}
		y(true);
	});
}//»
const make_app = (num_or_name, arg) => {//«
	const noop = () => {};
	let id;
	let win = make('div');
	Object.defineProperty(win,"title",{get:noop,set:noop});
	win.style.userSelect = "none";
	win.ondrop = e => {
		e.stopPropagation();
		e.preventDefault();
	};
	let name;
	let isterm = false;
	if (num_or_name.match(/^\d+$/)) {
		win.app = "sys.Terminal";
		name = win.app;
		isterm = true;

		win.ondrop = e=> {
			let i;
			let items = e.dataTransfer.items;
			let names=[];
			let files=[];
			let bodies=[];
			for (let item of items) {
				let ent = item.webkitGetAsEntry();
				if (!(ent&&ent.isFile)) continue;
				names.push(ent.name);
				files.push(item.getAsFile());
			}
			i = -1;
			const doitem=()=>{
				i++;
				if (i>=names.length) {
					let all = []; 
					for (let i=0; i < names.length; i++) all.push({name: names[i], blob: bodies[i]});
					win.obj.set_blob_drops(all);
					return;
				}
				let f = files[i];
				let rdr = new FileReader();
				rdr.onloadend = () => {
					bodies.push(new Blob([rdr.result],{type:"application/octet-stream"}));
					doitem();
				};
				rdr.onerror = (e)=>{
console.error(e);
					doitem();
				};
				rdr.readAsArrayBuffer(f);
			};
			doitem();
		};
		id = name;
	}
	else if (is_app) {
		name = num_or_name;
		id = num_or_name.split(".").pop();
		app_win = win;
	}
	else {
		name = num_or_name;
		id = name;
	}
	arg.TOPWIN = win;
	arg.topwin = win;
	win.status_bar=make('div');
	win.loc(0, 0);
	win.style.zIndex = 1;
	win.pos = "fixed";
	win.id = id;
	let main = make('div');
	win.main = main;
	arg.MAIN = main;
	arg.main = main;
	main.pos = "relative";
	main.loc(0, 0);
	main.w = winw();
	main.h = winh();
	main.top=win;
	win.appendChild(main);
	body.appendChild(win);
	win.set_winname = noop;
	name = name.replace(/\//g, ".");
	win.obj = new NS.apps[name](arg.APPOBJ,NS,globals,Core,Core.Desk,main);
	if (isterm) terminals[num_or_name] = win;
	return win;
}//»
const init_end = ()=>{//«
	if (_ivars.core_str||fs_str) save_strings();
	delete NS.sys;
	if (dev_env && dev_mode) NS.Core = Core;
	Object.freeze(window[__OS_NS__]);

}//»

const init_term = async () => {//«
	document.title = SYSACRONYM+" shell";
	terminals = {};
	document.onkeyup = null;
	initlog("Initializing console mode...");
	let shell_str;
	const start = () => {
		initlog("Getting shell history...");
		get_history("shell", histret => {
			if (!histret) histret = [];
			const doit = () => {
				const keydown = (e) => {//«
					let prevdef = {
						"s_CA": 1,
						"e_C": 1,
						"=_C": 1,
						"-_C": 1,
						"l_C": 1,
						"f_C": 1,
						"s_C": 1,
						"c_CS": 1,
						"k_C": 1,
						"a_C": 1,
						"w_C": 1,
						"d_A": 1,
						"p_C": 1,
						"j_C": 1
					};
					let code = e.keyCode;
					let macro_cb = Core.get_macro_update_cb();
					if (code >= 16 && code <= 18) {
						if (!macro_cb) {
							return current_term.obj.onkeydown(e,"","");
						}
					}
					let mod = "";
					if (e.ctrlKey) mod = "C";
					if (e.altKey) mod += "A";
					if (e.shiftKey) mod += "S";
					let sym = KC[code] + "_" + mod;
					if (prevdef[sym]) e.preventDefault();
					if (macro_cb) {
						if (sym=="ESC_") return current_term.obj.onescape();
						let str = Core.macro_key_down(code);
						if (str === null) return;
						macro_cb(str);
						return;
					}
					let marr;
					if (marr = sym.match(/^([1-9])_CA$/)) {
						let num = marr[1];
						if (current_term.id == num) return;
						current_term.style.zIndex = -1;
						current_term = terminals[num];
						if (!current_term) {
							current_term = make_app(num, {
								CORE: Core,
								Core: Core,
								NS: NS,
								APPOBJ: {
									HISTORY: histret.slice(),
									PROMPT: get_term_prompt(num)
								}
							});
							current_term.obj.onresize(true);
						} else {
							current_term.style.zIndex = 1;
							current_term.obj.onfocus();
						}
						return;
					}
					if (sym==="ESC_") return current_term.obj.onescape();
					current_term.obj.onkeydown(e, sym, mod);
				};//»
				const keyup=e=>{//«
					let code = e.keyCode;
					let macro_cb = Core.get_macro_update_cb();
					if (macro_cb) { /*Macronator*/
						Core.macro_key_up(
							code, 
							str => { /*out_cb*/
								macro_cb(str);
							}, 
							macroobj => { /*accept_cb*/
								Core.call_macro_succ_cb(macroobj);
								Core.set_macro_update_cb(null);
								Core.set_macros(null);
							},
							() => { /*reject_cb*/
								Core.call_macro_rej_cb();
								Core.set_macro_update_cb(null);
								Core.set_macros(null);
							},
							false
						);
						return;
					}
				};//»
				initlog("The shell environment is now active!");
				document.body.innerHTML = "";
				current_term = make_app("1", term_arg);
				if (!globals.noevents) {
					document.onkeyup = keyup;
					document.onkeydown = keydown;
					Core.keydown = keydown;
					document.onkeypress = e => {
						let code = e.charCode;
						if (code >= 32 && code <= 126) current_term.obj.onkeypress(e);
					};
				}
				window.onresize = () => {
					let keys = getkeys(terminals);
					for (let k of keys) {
						let win = terminals[k];
						win.main.w = winw();
						win.main.h = winh();
						win.obj.onresize(null, null, true);
					}
				};
				init_end();
			};
			let term_arg = {
				CORE: Core,
				Core: Core,
				NS: NS
			};
			term_arg.APPOBJ = {
				HISTORY: histret.slice(),
				PROMPT: get_term_prompt(1) + '\nPress Ctrl+Alt+[1-9] to switch between virtual consoles'
			};
			doit();
		});
	};
	const end = () => {
		initlog("The Terminal could not be loaded!");
	};
	const make_it = () => {
		shell_str = `window[__OS_NS__].apps["sys.Terminal"]=function(arg,NS,globals,Core,Desk,Main){"use strict";${shell_str}\n}`;
		let scr = make('script');
		scr.onload = start;
		scr.onerror = e => {
			throw new Error(e);
		};
		let url = URL.createObjectURL(new Blob([shell_str], {
			type: "application/javascript"
		}));
		globals.blobs[url] = "apps.sys.Terminal";
		scr.src = url;
		document.head.add(scr);
	};
	if (!is_offline && dev_mode) {
		let res = await fetch(sys_url("/apps/sys/Terminal.js"));
		shell_str = await res.text();
		make_it();
	} else {
		initlog("Checking for the Terminal app...");
		fs.app_is_installed("sys.Terminal", ret => {
			let getstr = async is_installed => {
				shell_str = await fsapi.readHtml5File('/code/apps/sys/Terminal.js', {
					ROOT: true
				});
				if (is_installed && shell_str) updates.push("apps.sys.Terminal", shell_str.slice(-42,-2));
				make_it();
			};
			if (ret) return getstr(true);
			initlog("Not found... install it!");
			let ext = null;
			if (dodev()) ext = "js";
			fs.install_app("sys.Terminal", ret => {
				if (ret) getstr(false);
				else initlog("Could not install the Terminal!", true);
			}, {
				EXT: ext
			});
		});
	}
};//»
const init_desk = async () => {//«

	document.title = SYSACRONYM+" desktop";
	document.onkeyup = null;
	step=await initstep("Loading the 'widgets' module");
	rv = await loadModule('sys.widgets');
	if (typeof rv === "string") updates.push("mods.sys.widgets", rv);
	step.ok();
	step=await initstep("Running the 'widgets' module");
	globals.widgets = new NS.mods["sys.widgets"](Core);
	step.ok();
	step=await initstep("Loading the 'desktop' module");
	rv = await loadModule('sys.desk');
	if (typeof rv === "string") updates.push("mods.sys.desk", rv);
	step.ok();
	step=await initstep("Running the 'desktop' module");
	Desk = new NS.mods["sys.desk"](Core,{body:document.body});
	winw = Desk.winw;
	winh = Desk.winh;
	winy = Desk.winy;
	winx = Desk.winx;
	step.ok();
	Core.Desk = Desk;

	globals.widgets.set_desk(Desk);

	window.onresize = null;
	window.onunload = null;


	Desk.init(() => {
		fs.set_desk(Desk);
		init_end();
	});
}//»
const init_app = async() => {//«
		const noop=()=>{};
		const Desk={
			check_open_files:noop,
			is_app:true,
			CG:{
				off:noop,
				on:noop
			}
		};
		Core.Desk=Desk;

//		step=await initstep("Loading the 'widgets' module");
//		await loadModule('sys.widgets');
//		step.ok();
//		step=await initstep("Running the 'widgets' module");
//		globals.widgets = new NS.mods["sys.widgets"](Core);
//		step.ok();
//		globals.widgets.set_desk(Desk);

		let path = qobj.path;
		let root = qobj.root;
		let argobj;
		if (path) {
			cwarn("Path:" + path)
		}
		if (root) {
			cwarn("Root:" + root)
		}
		if (qobj.args) {
			try {
				argobj = JSON.parse(atob(qobj.args));
			} catch (e) {
				initlog("Invalid base64 JSON in args", true);
				return
			}
			cwarn("Args", argobj);
		}
//		let app_path = is_app.replace(/\./g, "\/") + ".js";
		globals.app_mode = true;
		document.onkeyup = null;
		initlog("Initializing app mode...");
		const start = () => {//«
			const noop = ()=>{};
			NS.initlogelem.parentNode.del();
			let win = make_app(is_app, {
				CORE: Core,
				Core: Core,
				APPOBJ:{is_app:true}
			});
			Core.Window = win;
			let obj = win.obj;
			let keydown = obj.onkeydown||noop;
			let keypress = obj.onkeypress||noop;
			let keyup = obj.onkeyup||noop;
			let rs_handler = obj.onresize;
			document.onkeydown = e => {
				let code = e.keyCode;
				if (code == KC.ALT || code == KC.CTRL || code == KC.SHIFT) {}
				let mod_str = "";
				if (e.ctrlKey) mod_str = "C";
				if (e.altKey) mod_str += "A";
				if (e.shiftKey) mod_str += "S";
				let chr = KC[code];
				let kstr = chr + "_" + mod_str;
				let cpr = win.CPR;
				if (cpr) {
					if (cpr.key_handler) {
						if (kstr == "ENTER_A") kstr = "ENTER_";
						else return cpr.key_handler(kstr, e, false, code, mod_str);
					}
					let okbut = cpr.ok_button;
					let clickok = () => {
						okbut.click();
					};
					if (cpr.is_macro) {
						console.warn("Not handling current_prompt.is_macro!");
					} else if (okbut) {
						let keys = cpr._keys;
						if (keys) {
							if (kstr != "ESC_" && (keys === true || keys.includes(kstr))) cpr.keyok = true;
							clickok();
						} else if (kstr == 'ENTER_' || (kstr == "ESC_" && cpr.inactive)) {
							e.preventDefault();
							clickok();
						}
					}
					return;
				}
				keydown(e, kstr);
			};
			document.onkeyup = keyup;
			document.onkeypress = keypress;

			if (rs_handler) {
				window.onresize = () => {
					win.main.w = winw();
					win.main.h = winh();
					rs_handler(null, null, true);
				};
			}
			init_end();
		};//»
		const end = () => {
			initlog("Could not load:" + is_app, true);
		};
		let rv = await fetch(sys_url("/apps/"+app_path));
		if (!(rv&&rv.status==200)) return;
		const app_str = `window[__OS_NS__].apps["${is_app}"] = function (arg,NS,globals,Core,Desk,Main){(async()=>{"use strict";${await rv.text()}\n})()}`;
		make_script(URL.createObjectURL(new Blob([app_str],{type:"application/javascript"})), start, end);
	}
//»

//Initialize FS«

	if (_ivars.have_local_core) updates.push("mods.sys.core", _ivars.have_local_core);
	if (!is_app) {

		rv = await loadFs();
		if (!rv) return initlog("Could not load the system libraries",true);
		if (typeof rv === "string") updates.push("mods.sys.fs", rv);
		await initFs();
		fsapi = NS.api.fs;

		await get_current_user();
		if (!localStorage._didinit){
			await fsapi.writeHtml5File(globals.desk_path+'/HelloWorld.app','{"app":"demo.HelloWorld"}');
		}

		if (globals.local_port) {
			step = await initstep(`Attempting to mount /loc via ${globals.local_host}:${globals.local_port}...`);
			if (await fs.make_local_tree()) step.ok();
			else step.fail();
		}
		step=await initstep("Finding 'globals.json'");
		let globals_str = await api.getInitStr("config/globals.json",{noGet:true});
		if (globals_str) step.ok();
		else step.fail(true);
		try{
			step=await initstep("Parsing 'globals.json'");
			globals.usr = JSON.parse(globals_str);
			step.ok();
		}   
		catch(e){
			step.fail(true);
			globals.usr = {};
			initlog("Parse fail!");
			console.log(globals_str);
		} 
	}//»


	if (is_desk) init_desk();
	else if (is_app) init_app();
	else if (is_shell) init_term();
	else return initlog("What is happening here?", true);

	api.winw = winw;
	api.winh = winh;
	api.winx = winx;
	api.winy = winy;
	util.winw = winw;
	util.winh = winh;
	util.winx = winx;
	util.winy = winy;

//»

}//»

