
//Imports«
//const APPOBJ = arg.APPOBJ||{};
//const{NS,Core,Desk,main,topwin}=arg;
const{log,cwarn,cerr}=Core;
const main = Main;
const topwin = main.top;
const{fs,util,widgets}=globals;
const{poperr}=widgets;
const capi = Core.api;
const{make,mkdv,mk,mksp}=util;
const fsapi = NS.api.fs;

let _;
/*«
let Core = arg.CORE;
_=Core;

let log = _.log;
let cwarn = _.cwarn;

let globals = Core.globals;
_=globals;

let WDG = _.widgets;
let poperr = WDG.poperr;

let fs = globals.fs;
let util = globals.util;
_=util;
let make = _.make;
»*/

let audio_ctx = globals.audio.ctx;
let outgain = audio_ctx.createGain();
//»

//VAR«

var arcade_obj = this;

var ext_to_wasm ={//«
	gb:"binjgb"
}//»
var ext_to_js={//«
	gb: "games.GBEmulator",
	nes: "games.NESEmulator"
}//»
var ext_to_dims={//«
	gb:{
		w:160,
		h:144
	},
	nes:{
		w: 256,
		h: 240
	}
}//»
var wasm_cache = {};
var js_cache = {};

var wasm_mod = null;

var SCREEN_HEIGHT, SCREEN_WIDTH, ASPECT;

/*«
var BUT_A = "A";
var BUT_B = "X";
var BUT_SEL = "Bk";
var BUT_START = "St";
var BUT_UP = "N";
var BUT_LEFT = "W";
var BUT_DOWN = "S";
var BUT_RIGHT = "E";
var str_to_but ={//«
	"A": BUT_A,
	"B": BUT_B,
	"Select": BUT_SEL,
	"Start": BUT_START,
	"Up": BUT_UP,
	"Down": BUT_DOWN,
	"Left": BUT_LEFT,
	"Right": BUT_RIGHT
}//»
»*/

//var kb_map, gp_map;

var norm_kb_map = {//«
	".":"A",
	",":"B",
	"w":"Up",
	"s":"Down",
	"a":"Left",
	"d":"Right",
	"UP":"Up",
	"DOWN":"Down",
	"LEFT":"Left",
	"RIGHT":"Right",
	"SPACE":"Start",
	"ENTER":"Select"
}//»

///*Q-bert...for diagnols
var qbert_kb_map = {//«
	".":"A",
	",":"B",
	"w":"Up",
	"a":"Down",//s
	"q":"Left",//a
	"s":"Right",//d
	"UP":"Up",
	"DOWN":"Down",
	"LEFT":"Left",
	"RIGHT":"Right",
	"SPACE":"Start",
	"ENTER":"Select"
}//»

var kb_map = norm_kb_map;
//*/

var gp_map={//«
	"A":"A",
	"B":"A",
	"X":"B",
	"Y":"B",
	"U":"Up",
	"D":"Down",
	"L":"Left",
	"R":"Right",
	"Bk":"Select",
	"St":"Start"
}//»

var did_read = false;
var running = true;
var emulator = null;
var gamepad_kill_cb=null;
//»

//DOM«
var canvas;
//var main = arg.MAIN;
//var topwin = arg.TOPWIN;
var w = main.clientWidth;
var h = main.clientHeight;
main.bgcol="#171717";
_ = main.style;
_.display="flex";
_.alignItems="center";
_.justifyContent="center";
_.flexDirection="column";
//log(main);
const handle_drop=(bytes,namearg)=>{
	var name;
	if (!namearg) return;
	if (!bytes) return;
	var arr = namearg.split(".");
	var ext = arr.pop();
	if (!arr.length) return;
	name = arr.join(".");
	var wasm = ext_to_wasm[ext];
	var jsmod = ext_to_js[ext];
	var dims = ext_to_dims[ext];
	if (!(jsmod&&dims)) return;
	if (emulator) {
		emulator.pause();
		emulator.kill();
		emulator = null;
	}
	topwin.title=name;
	init_canvas(dims);
	if (wasm) init_wasm(wasm, jsmod, bytes, name);
	else init_js(jsmod, bytes, null, name);
};
main.ondrop = function(e){
	e.preventDefault();
	e.stopPropagation();
	fs.drop_event_to_bytes(e, handle_drop);
}//»


//Funcs«

function init() {//«
	outgain.connect(audio_ctx.destination);
	outgain.gain.value = 0.8;
	try_gp_read();
	resize();
}//»
function init_canvas(dims){//«
	main.innerHTML="";
	SCREEN_WIDTH = dims.w;
	SCREEN_HEIGHT = dims.h;
	ASPECT = SCREEN_WIDTH/SCREEN_HEIGHT;
	canvas = make("canvas"); 
	canvas.width=SCREEN_WIDTH;
	canvas.height=SCREEN_HEIGHT;
	canvas.style.margin="auto";
//	canvas.bor="1px solid gray";
	main.add(canvas);
}//»
function init_gamepad(cb){//«
	fs.get_json_file('/etc/input/gamepad.json',(gpret,gperr)=>{
//log(gpret, gperr);
		if (gperr) return poperr("Parse error in gamepad.json: " + gperr);
		if (gpret) {
			if (gpret.kb2gp) kb_map = gpret.kb2gp;
			if (gpret.std2nes)	gp_map = gpret.std2nes;
		}
		else {

		}
		cb();
	})
}//»
function init_emulator(jsmodarg, bytes, wasmmodarg, namearg){//«
	emulator = jsmodarg.init(arcade_obj, bytes, canvas, outgain, (ret,err)=>{
		if (!ret) return poperr("Could not initialize the emulator: " + err);
		init();
	}, wasmmodarg);
}//»
function init_js(jsarg, bytes, wasmarg, namearg){//«
	var gotjs = js_cache[jsarg];
	if (gotjs){
		init_emulator(gotjs, bytes, wasmarg);
		return;
	}
	fs.getmod(jsarg,(modret)=>{
		if (!modret) return poperr("Could not get the js mod: " + jsarg);
		js_cache[jsarg] = modret;
		init_emulator(modret, bytes, wasmarg, namearg);
	},{STATIC:true});
}//»
async function init_wasm(wasm, jsmod, bytes, namearg) {//«
	var gotwasm = wasm_cache[wasm];
	var gotjs = js_cache[jsmod];
	if (gotwasm&&gotjs) {
		init_emulator(gotjs, gotwasm);
		return;
	}
	let wasmmod = await fsapi.getMod("util.wasm");
	if (!wasmmod) return poperr("No wasm module!");
	let base_path = '/code/wasms/games/'+wasm+'.wasm';
	let wasmret;
	if (await fsapi.pathToNode(base_path,{isRoot:true})) {
		wasmret = await fsapi.readHtml5File(base_path, {ROOT:true,BLOB:true});
	}
	else {
		wasmret = await capi.xget('/root'+base_path);
		await fsapi.writeHtml5File(base_path, wasmret, {ROOT:true});
	}
	wasmmod.WASM({wasmBinary:wasmret}, wasm, modret=>{
		if (!modret) return poperr("No module!!");
		wasm_mod = modret;
		init_js(jsmod, bytes, wasm_mod, namearg);
	});
}//»

function load_init(bytes,name,ext){//«
	let wasm = ext_to_wasm[ext];
	let jsmod = ext_to_js[ext];
	let dims = ext_to_dims[ext];
	if (!(jsmod&&dims)) return;
	init_canvas(dims);
	init_gamepad(()=>{
		if (wasm) init_wasm(wasm, jsmod, bytes, name+"."+ext);
		else init_js(jsmod, bytes,null,name+"."+ext);
	});
}//»

function try_gp_read() {//«
log("TRY");
	if (gamepad_kill_cb) {
		gamepad_kill_cb();
		gamepad_kill_cb = null;
	}
	fs.read_device("/dev/gamepad/1",(ret,kill_cb)=>{
		if (kill_cb) {
log(kill_cb);
			gamepad_kill_cb=kill_cb;
			return 
		}
		if (!emulator) return;
		if (!ret) return;
		var but;
		if (gp_map) but = gp_map[ret.button];
		else but = ret.button;
		emulator.fire(but,(ret.value=="down"?true:false));
		did_read = true;
	},{INTERVAL: 0});
}//»
function resize(){//«
	if (!canvas) return;
	if (h*ASPECT > w) {
		canvas.w = w;
		canvas.h = w/ASPECT;
	}
	else {
		canvas.h = h;
		canvas.w = h*ASPECT;
	}
}//»

//»

//OBJ/CB«

this.poll_gp =()=>{
	fs.get_all_gp_events(true);
	try{
		if (did_read) {
			if (!navigator.getGamepads()[0]) did_read = false;
			return;
		}
		if (navigator.getGamepads()[0]) try_gp_read();
	}
	catch(e){}
}

this.onloadfile = load_init;
this.onappinit=()=>{
//topwin.title="Nineteendo";
main.tcol="#ccc";
let sp=make('sp');
//sp.tcol="#ccc";
sp.fs=32;
sp.innerHTML="Drop an nes or gb file here!";
let info=make('div');
info.innerHTML=`
<br>
To play, either plug in a usb gamepad, or...<br><br>
The arrows are W-A-S-D.<br>
The A button is '.' (period key)<br>
The B button is ',' (comma key)<br>
The Start button is the spacebar<br>
The Select button is the enter key.
`;
info.fs=21;
main.add(sp);
main.add(info);
}
this.onicondrop=async(arr)=>{//«
for (let p of arr){
if (p.match(/\.gb$/)||p.match(/\.nes$/)) {
let name = p.split("/").pop();
//cwarn("Play",name);
let ret = await fsapi.readFile(p);
let dat = await Core.api.toBytes(ret);
handle_drop(dat,name);
//log(dat);
break;
}
}
};//»
this.onkeydown = function(e,sym) {//«
	if (!emulator) return;
	var marr;
	if (sym=="SPACE_A") {
		running = !running;
		if (running) {
			emulator.run();
		}
		else {
			emulator.pause();
		}
	}
	else if (sym=="q_A") {
		if (kb_map === qbert_kb_map) {
			kb_map = norm_kb_map;
		}
		else kb_map = qbert_kb_map;

		cwarn("New keyboard map");
	}
	else if (sym=="g_") try_gp_read();
	else if (kb_map && (marr=sym.match(/^(.+)_$/)) && kb_map[marr[1]]) {
//		let but = str_to_but[kb_map[marr[1]]];
		let but = kb_map[marr[1]];
		if (!but) return;
		emulator.fire(but,true);
	}

}//»
this.onkeyup = function(e,sym) {//«
	if (!emulator) return;
	var marr;
	if (kb_map && (marr=sym.match(/^(.+)_$/)) && kb_map[marr[1]]) {
//		let but = str_to_but[kb_map[marr[1]]];
		let but = kb_map[marr[1]];
		if (!but) return;
		emulator.fire(but,false);
	}
}//»
this.onkill = function() {//«
	if (emulator) {
		emulator.pause();
		emulator.kill();
	}
	if (gamepad_kill_cb) gamepad_kill_cb();
}//»
this.onresize = function() {//«
	w = main.clientWidth;
	h = main.clientHeight;
	resize();
}//»
//»

//«

this.topwin = topwin;
if (arg.file) {
	let fullpath = arg.file;
	fs.path_to_contents(fullpath, (ret,err)=>{
		if (!ret) return poperr("Could not get the data from: " + fullpath);
		let fullname = fullpath.split("/").pop();
		let arr = fullname.split(".");
		let ext = arr.pop();
		let fname = arr.join(".");
		load_init(ret,fname,ext);
	}, true);
}

//»

