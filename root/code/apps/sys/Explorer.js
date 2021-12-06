
//Imports«

const {is_app}=arg;
const{log,cwarn,cerr,api:capi}=Core;
const {getAppIcon}= capi;
const{util}=globals;
const{make,mkdv,mk,mksp}=util;
const {fs}=NS.api;
let topwin = Main.top;
let winid = topwin.id;
let path = topwin._fullpath;
let statbar = topwin.status_bar;

//»

//DOM«

let WDIE;
let dd = mkdv();
dd.pos = 'absolute';
dd.bor = '1px solid white';
dd.bgcol = 'gray';
dd.op = 0.5;
dd.loc(-1, -1);
dd.w = 0;
dd.h = 0;
Main.add(dd);

Main.bgcol="#332323";
Main.overy="auto";
Main.overx="hidden";
Main.tabIndex="-1";
Main.pad=5;
const icondv = mkdv();
icondv.main = Main;
icondv.win = Main.top;
icondv.pos = "relative";
icondv.dis="flex";
icondv.style.flexBasis=`100px`;
icondv.style.flexShrink=0;
icondv.style.flexGrow=0;
icondv.style.flexWrap="wrap";
Main.add(icondv);

topwin.drag_div = dd;
topwin.icon_div = icondv;

//»
//Var«

//let ICONS=[];
let is_loading = false;
let drag_timeout;
let dir;

//»
//Funcs«

const stat=(s)=>{statbar.innerHTML=s;};

const add_icon=path=>{
	log("ADD", path);
};
let curnum;

const load_dir=()=>{//«

let kids = dir.KIDS;
let keys = kids.keys;
keys.splice(keys.indexOf("."),1);
keys.splice(keys.indexOf(".."),1);
keys.sort();
curnum = keys.length

let s = '';
for (let i=0; i < curnum; i++){
	s+=`<div data-name="${keys[i]}" class="icon"></div>`;
}
icondv.innerHTML=s;
let options = {
  root: Main,
  rootMargin: '0px',
  threshold: 0.001
}

let callback = (entries, observer) => {//«
	entries.forEach(ent => {
		let d = ent.target;
		if (ent.isIntersecting){
			let fullname = d.dataset.name;

let nameext = capi.getNameExt(fullname);
let name = nameext[0];
let ext = nameext[1]||"";
let kid=kids[fullname];
let fent = kid.entry;
let app;
let islink=false;
if (fent.isDirectory){
	app="sys.Explorer";
}
else if (kid.LINK){
	app = kid.ref.APP;
	islink=true;
}
else if (kid.APPICON){
let o;
try{
o=JSON.parse(kid.APPICON);
app = o.app;
}catch(e){console.error(e);};

}
else{
	app = kid.APP;
}
let s="?";
if (app) s = capi.getAppIcon(app,{html:true});
d.innerHTML=`<span class="iconi">${s}</span><div class="iconl">${name}</div>`;
d.move_cb=()=>{
	observer.unobserve(d);
	delete d.move_cb;
};
d.z=1;
d.parwin = topwin;
d.imgdiv = d.childNodes[0];
d.set_icon_listeners();
d.name = name;
d.ext = ext;
d.app = app;
d._self = d;
d.childNodes[0].title = app;
d.childNodes[1].title = name;
if (!d.path) {
	Object.defineProperty(d,"path",{get:function(){return this.parwin.fullpath();}});
	Object.defineProperty(d,"fullname",{get:function(){let name=this.name;if(this.ext)name=name+"."+this.ext;return name;}});
}
if (islink) {
	d.add_link(!app);
	d.link = kid.LINK
}
/*«
			let icn = d.childNodes[0];
			icn.onmousedown=e=>{
log("PATH",`${path}/${name}`);
			};
			icn.title = name;
			icn.draggable=true;
			icn.ondragstart=e=>{
				e.preventDefault();
cwarn("DRAGGEM");
			};
»*/
		}
		else{
			d.innerHTML="";
		}
	});
};//»

let observer = new IntersectionObserver(callback, options);
for (let kid of icondv.children){
	observer.observe(kid);
}

is_loading = false;

}//»

const init=async()=>{//«
	let num=0;
	dir = await fs.pathToNode(path);
	if (!dir) return;
	if (dir.root.TYPE!=="fs") {
		stat("Error: only doing directory type: 'fs'");
		return;
	}
	if (!dir.done){
		stat("Getting entries...");
		let cb=(ents)=>{
			if (!ents.length){
				if (!num) stat(`Empty`);
				return;
			};
			num+=ents.length;
			stat(`${num} entries`);
		};
		await fs.populateFsDirObjByPath(path, {par:dir,streamCb:cb});
		dir.done.true;
		load_dir();
	}
	else{
		load_dir();
	}

}//»


//»

//OBJ/CB«
this.onkeydown = function(e,s) {//«

if (s=="r_"){

if (is_loading) return;
is_loading = true;
Main.scrollTop=0;
icondv.innerHTML="";
load_dir();

}

}//»
this.onkill = function() {//«
	icondv.del();
//	sty.del();
}//»
this.onresize = function() {//«

}//»
this.onfocus=()=>{
Main.focus();
};
this.onblur=()=>{
Main.blur();
};
this.onload=()=>{
init();
};
this.update=(num)=>{
//if (!Number.isFinite(num)){

//}
//else{
//curnum+=num;
//}

//stat(`${curnum} entries`);
stat(`${dir.KIDS.keys.length-2} entries`);
};
this.add_icon=add_icon;

//»

Main.focus();
Desk.add_folder_listeners(topwin);


