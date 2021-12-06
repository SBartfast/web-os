
//«

//»

//!!!!!!!!!!!!!     Commented out warning     !!!!!!!!!!!!!!«
//			cwarn("Make_icon():\x20have link,we have an extension too! " + arg.EXT);
/*!!!!!!!!!!!!!!!!!!!!    !IMPORTANTT   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Just like in: automake_icon()... every time we make an icon to put directly 
into a folder window's icon_div, we need to set the parwin attribute to
the topwin!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
SOOOOOOOOOOOOOOOOOOOOO... what do we have to do to deref icons that are links?
ANYTHING DIFFERENT????????
»*/
/*!!!!!   Don't want to lose track of icons  !!!!//«
After creating icons via the popup/paste method, we saved them in the make_icon_cb 
(after place_in_icon_slot), but then icon editing was started, and we didn't save
under the real name. The bigger issue is that it just puts the icon anywhere, even
though there is not a location in localStorage.//»*/
/*Buggy buggy bug: YHLKWT //«

Created a text file (feebert.txt) in home dir and moved it to the desktop in shell.
Then "moved" if from feebert.txt to feebert to turn it into a bin file, but after
doing this, it became non selectable, and the icn wrapper at YHLKwt
was null (or perhaps the icon itself was null). After doing a reload_desk_icons
with r_CAS, everything was AOK.

This is all about the perils of swapping out icon images.
//»*/

/*Issues«

For development purposes:
When loading the desktop with remote links on them (under /site), the server must have had
initfs and syncroot called, or there will be 500 server errors in server.py.

Also, when trying to move them around, there are checks for orig.root.TYPE=="local" to see
if they have to be copied.

In vim, when doing PGUP_ (UP_A) and PGDN_ (DOWN_A) while scrolling a long file, the
entire desktop scrolls up when the taskbar is hidden. Putting in the override
of those keysyms in dokeydown stops the behaviour. 
Working solution: desk.onscroll=e=>{desk.scrollTop=0;}

//!!!   ICONS array issues when moving onto folder icons  (SOLVED?)  !!!«


!!!!!     This all just seems to be about not having a correct ICONS array     !!!!!

So, all we gotta do is debug the ICONS array at the several points of moving icons
around.

Seems to be working with just doing icon_off && ICONS=[] when doing moves onto
folder icons.




Moving icons onto a folder's drop zone works the first time, but not the
second.  Once it gets working, remove the if(loc){...} thing from the beginning
of move_icons.

Okay, here's the deal. When icons are dropped onto a folder icon the first
time, the folder icon becomes selected with yellow. If the folder is then
opened by pressing ENTER_ or double clicking it, then it becomes deselected,
and the whole cycle of dropping icons onto it can begin again. If only gets
deselected with ESC_, then, that is when the problems start.


WHAT ONLY SEEMS TO ALWAYS WORK IS: PHYSICALLY DOUBLE CLICKING THE FOLDER ICON AFTER
DRAG'N'DROPPING STUFF ONTO IT.

ALSO: PHYSICALLY DOUBLE-CLICKING IT AFTER DOING CTRL-M ONTO IT.

Also: ENTER_ and ENTER_A are treated like ENTER_, when just 1 icon is highlighted yellow.

//»

»*/

//Let/Const«

//Imports/Decs«

const NS = window[__OS_NS__];
const Desk = this;
const {DSK,lotw_mode,body}=arg;

if (DSK) {
	DSK.Desk = Desk;
	Desk.DSK = DSK;
}
Desk.automate_mode = false;
//Desk.automate_mode = true;
const fsapi = NS.api.fs;
const capi = Core.api;
const _={};
Desk.ENV=_;


const MODS = NS.mods;
const{KC,kc,simulate,globals,log,cwarn,cerr,sys_url,xget}=Core;
//const{menu:MENU,widgets:WDG,qobj,fs,stats,FSBRANCH,FSPREF,util, all_extensions}=globals;
const{home_path, widgets:WDG,qobj,fs,stats,FSBRANCH,FSPREF,util, all_extensions}=globals;

const path_to_obj = (path, cb, if_root, getlink) => {
	fs.path_to_obj(path, cb, if_root, getlink, DSK);
};
const populate_fs_dirobj = (path, cb, parobj, iflong) => {
	fs.populate_fs_dirobj(path, cb, parobj, iflong, DSK);
}
const populate_rem_dirobj = (path, cb, parobj, opts={}) => {
	opts.DSK=DSK;
	fs.populate_rem_dirobj(path, cb, parobj, opts);
}
const pathToNode=(path,opts={})=>{
	opts.DSK=DSK;
	return fsapi.pathToNode(path,opts);
};

const{popup:_popup,poperr:_poperr,popok:_popok,make_popup:_make_popup}=WDG;
//const popin = NS.api.widgets.popin;
const wdgapi = NS.api.widgets
const popup = (s, opts) => {
	_popup(s, opts, DSK);
};
const poperr = (s, opts) => {
	_poperr(s, opts, DSK);
};
const popok = (s, opts) => {
	_popok(s, opts, DSK);
};
const make_popup = arg=>{return _make_popup(arg,DSK);};

const{center,isnum,isobj,isarr,isint,isstr,mkdv,mksp,mkbut,make}=util;
const NUM=Number.isFinite;
const {dist,getNameExt,getKeys}=Core.api;

let {dev_mode,dev_env}=globals;

const winx=()=>{if(DSK)return DSK.topwin.main.getBoundingClientRect().left;return 0;};
this.winx=winx;
const winy=()=>{if(DSK)return DSK.topwin.main.getBoundingClientRect().top;return 0;};
this.winy=winy;
const winw=()=>{if(DSK)return DSK.winw();return window.innerWidth;}
this.winw = winw;
const winh = (if_no_taskbar) => {
	if (DSK) return DSK.winh();
	if (taskbar_hidden||if_no_taskbar) return window.innerHeight;
	return window.innerHeight - taskbar.clientHeight;
}
this.winh = winh;

//const make=x=>{return document.createElement(x)}
//const mkdv=()=>{return make("div")}
//const mksp=()=>{return make("span")}
//»
//Flags/Modes«

//let CYCLE_MIN_WINS = false;
let PREV_DEF_ALL_KEYS = false;
let CYCLE_MIN_WINS = true;
//let cur_showing = false;
let cur_showing = true;
let taskbar_hidden = false;
let have_window_cycle = false;
let debug_keydown = false;
if (qobj.debug_keydown) debug_keydown = true;
let noevents = false;
let cmenu_active = true;
if (qobj.nocontext) cmenu_active = false;
let	windows_showing = true;
let window_chrome_mode = true;
let layout_mode = false;
let zoom_to_cursor_mode = false;
let alt_is_up=false;

//»
//DOM Elements/Objects/Arrays«

let CWIN_HOLD;
let CWCW;
let ICONS=[];
const CUR = mkdv();
const desk = mkdv();
const desk_coldiv=mkdv();
const desk_imgdiv=mkdv();
const background_div=mkdv();
const taskbar = mkdv();
//const start_button=mkdv();
//const system_clock=mkdv();
//const system_clock= {} ;
const system_user_widget = {};
const system_tray = mkdv();
const minwinbar = mkdv();
let CDL;
let CDICN, CDW, CRW, CEDICN;
CDW = CDICN = CRW = CEDICN = null;
let IA = [];
let DDD;
let CG;
let windows = [];
let minimized_windows=[];

//»
//String/Regex constants/vars«

const MEDIAPLAYER_EXTENSIONS=["webm","mp4","m4a","ogg","mp3"];
const DEF_BIN_OPENER = "util.BinView";
const DEF_FORUM = "general";

//About«   
const ABOUT_STR=`

${globals.name.NAME} is <i>the</i> next-generation platform for the rapid
prototyping, development and distribution of web-based applications, and is a
perfect choice for scientists and hobbyists.

`;
//»

let desk_path;

const USER_BG_IMG_PATH = `${home_path}/.config/desk/bgimg`;
const USER_BG_IMG_OP_PATH = `${home_path}/.config/desk/bgimg_op`;
const USER_BG_COL_PATH = `${home_path}/.config/desk/bgcol`;
const SYS_BG_IMG_PATH = `/etc/config/desk/bgimg`;
const DEF_BG_IMG_PATH = '/var/bgimg';
const DEF_KEYSYM_STR = '{"t_A":{"ON":1,"NAME":"open_terminal"}}';

const SP = " ";
const RE_SP_PL = / +/,
	RE_SP_ONLY = /^ +$/,
	RE_SP_G = / /g;

//»
//JS Objects«

const api={};
Desk.api=api;
//let win_overflow={t:0,b:1,l:1,r:1};
let win_overflow={t:0,b:0,l:0,r:0};
let keysym_map, keysym_funcs;
let std_keysym_map={};
//let app_icons=[];

//»
//Style/CSS Values«
let OVERLAYOP = "0.5";
let TASKBAR_OP=1;
let CUR_FOLDER_XOFF = 10;

let DEF_BG_IMG_OP = 0.3;
let DESK_ICON_BOR = "2px solid #ff7";
let DESK_ICON_BG = "rgba(255,255,200,0.33)";
let FOLDER_ICON_BOR = "2px solid gold";
let FOLDER_ICON_CUR_BOR = "2px solid #000";
let FOLDER_ICON_BG = "rgba(255,160,0,0.33)";

let DEF_DESK_GRADIENT = "linear-gradient(135deg,#000 0%,#003 35%,#006 50%,#000077 75%,#33c 90%,#77f 95%,#ff7 100%)";
let WIN_CYCLE_CG_OP = 0;
//let WINBUT_OFF_COL = "#889";
let WINBUT_OFF_COL = "#778";
//let WINBUT_ON_COL = "#99a";
let WINBUT_ON_COL = "#bba";
let DESK_COL = "#444";
let WIN_COL_ON="#2a2a3a";
let WIN_COL_OFF="#232333";
let WINNAME_COL_ON=WINBUT_ON_COL;
let WINNAME_COL_OFF=WINBUT_OFF_COL;

let hidden_taskbar_thresh;
const STEP_MODE_DESK_OP=0.5;
const ICON_Z = 1;
let CURBORWID=2;

//0 ususally makes the desktop somewhat noticeable
//0.5 keeps a very small black line between windows, but you can't really see the desktop
//1 makes it a very tight jigsaw like fit
const TILING_OVERLAP=0.5;

//When dragging icons around, a large enough value here insures that the "n items->" label keeps showing.
//If you are moving the mouse very fast, the pointer can go over the label and trigger an event to
//make it disappear and think that you've "dropped" your payload.
let CDL_OFFSET=5;
let ICON_OP_MS=250;
//let USE_DZ_OP=0;
let USE_DZ_OP=0.33;

let MIN_WIN_ON_COL="#ddd";
let MIN_WIN_OFF_COL="gray";

const DRAG_IMG_OP = 0.66;
let ICON_MOVE_FACTOR = 1200;
//let ICON_MOVE_FACTOR = 200;

let FDZ_COL = "#f33";
let WDZ_COL = "#33f";
let DDZ_COL="#393";
const MAC_ICON_PURPLE="#8c4eb8";

const DEF_CG_OP = 0.0;

let ICON_DIM = 44,
	TITLE_DIM = 16,
	FOLDER_GRID_W = 5,
	win_move_inc = 50,
	win_move_inc_small = 5,
	win_resize_inc = 50,
	win_resize_inc_small = 5,
	min_win_width = 86,
	min_win_hgt = 50

let desktop_bgcol = "#000",
	mainwin_bgcol = "#fff",
	mainwin_tcol = "#000",
	desk_icon_label_col = "rgba(0,0,0,0.42)",
	desk_icon_font_col = "#fff",
	winid_tcol_on = "#555555",
	winid_tcol_off = "#444444",
//	topwin_bgcol_on = "#303030",
//	topwin_bgcol_off = "#272727",
	menubar_bg_color = "#E8E8E8",

	window_boxshadow = "2px 3px 7px #444",
	window_boxshadow_hold;

let folder_grid_start_x = 20,
	folder_grid_start_y = 5,
	desk_grid_start_x = 25,
	desk_grid_start_y = 40

let	IGSX = 100, IGSY = 100;

let DESK_GRID_W = Math.floor((winw()-desk_grid_start_x)/IGSX);
let DESK_GRID_H = Math.floor((winh()-desk_grid_start_y)/IGSY);

//»
//Init Events & Values«

let	ev = null;

let DDIE, WDIE, DDX, DDY;
let drag_timeout;
DDIE=WDIE=DDX=DDY=null;

//»
//Timers/Counters/Numbers/Amounts«
let OVERLAY_MS = 1500;
let WIN_MIN_TRANS_SECS="0.25";

let MS_BETWEEN_BIG_FOLDER_BATCHES = 0;
let BIG_FOLDER_BATCH_SIZE = 20;
let MAX_FILE_SIZE = 1024*1024;
let SHOW_TASKBAR_DELAY = 250;
let num_win_cycles = 0;
let system_clock_interval;
let last_clock_time;
//const MIN_MS_DIFF_TO_UPDATE_CLOCK = 60 * 1000;
const MIN_MS_DIFF_TO_UPDATE_CLOCK = 5 * 1000;
const MAX_TILING_STEPS = 2*((winw()>winh())?winw():winh());
const MOVE_RS_TIMEOUT = 300;
let move_rs_timer = null;
let taskbar_timer;
let win_num = 0;
let CGZ = 9999999;
let min_win_z = 10;
this.min_win_z = min_win_z;
let	hiZ = min_win_z;
let alt_tab_presses = 1;
let tilde_press = 0;
let icon_num = 0;

//»

//»

//System«
let overlay_timer;
let MAX_OVERLAY_LENGTH = 42;
const overlay=(()=>{
	let fakediv = make('div');
	fakediv.innerHTML = '<div style="opacity: '+OVERLAYOP+';border-radius: 15px; font-size: xx-large; padding: 0.2em 0.5em; position: absolute; -webkit-user-select: none; transition: opacity 180ms ease-in; color: rgb(16, 16, 16); background-color: rgb(240, 240, 240); font-family: monospace;"></div>';
	return fakediv.childNodes[0];
})();
overlay.z=CGZ+1;
const show_overlay=(str)=>{//«
	if (str.length > MAX_OVERLAY_LENGTH) str = str.slice(0,MAX_OVERLAY_LENGTH)+"...";
	overlay.innerText = str;
	if (overlay_timer) clearTimeout(overlay_timer);
	else desk.appendChild(overlay);
	Core.api.center(overlay, desk);
	overlay_timer = setTimeout(()=>{
		overlay_timer = null;
		overlay.del();
	}, OVERLAY_MS);
};//»
const toggle_fullscreen=()=>{
	if (!document.fullscreenElement) document.body.requestFullscreen();
	else document.exitFullscreen();
};
//»

//Desk«

const DESK_CONTEXT_MENU=[//«
	"\u{1f381}\xa0New",[
		"Folder",
		()=>{Desk.make_icon_cb((DSK && DSK.desk_path) || globals.desk_path, "Folder")},
		"Text File",
		()=>{Desk.make_icon_cb((DSK && DSK.desk_path) || globals.desk_path, "Text")}
	],
	"\u{1f4ca}\xa0About",()=>{make_popup({WIDE:true,STR: ABOUT_STR, TIT: "About LOTW"});},
//	"\u{26a1}\xa0Help",()=>{open_app("doc.Help");},
//	"\u{1f64b}\xa0Chat",()=>{open_app("net.Hello");},
	"\u{1f4ec}\xa0Mail",()=>{open_app("net.Mail");},
	"\u{1f5e3}\xa0Forum",()=>{open_app("net.Forum",null,null,{}, {forum:DEF_FORUM});},
	"\u{1f5b3}\xa0Terminal",()=>{open_terminal()},
];//»
const toggle_taskbar=()=>{
	if (taskbar_hidden) taskbar.show();
	else taskbar.hide();
};
const make_desktop = () => {//«

//DOM«
	desk.name = desk_path.split("/").pop();
	if (DSK) desk.id="lotw_desktop"
	else desk.id = "desktop";
	Desk.desk = desk;
	globals.desk_elem = desk;
	desk._self = desk;
	desk.type = "desk";
	desk.tcol = "#000";
	desk.pos = "relative";
	desk.over = "hidden";
	desk.w = winw();
	desk.h = winh();
	desk.z = min_win_z;
	desk.style.backgroundSize = winw() + " " + winh();
	background_div.pos = "absolute";
	background_div.loc(0, 0);
	background_div.w = winw();
	background_div.h = winh();
	background_div.z = min_win_z - 1;
	background_div.style.backgroundSize = winw() + " " + winh();
	desk_coldiv.pos = "absolute";
	desk_coldiv.bgcol = DESK_COL;
	Desk.set_bgcol=val=>{
		desk_coldiv.bgcol = val;
	};
	Desk.set_bgimg = (val, oparg)=>{
		if (oparg) desk_imgdiv.op = oparg;
		desk_imgdiv.style.backgroundImage=`url("${val}")`;
	};
	desk_coldiv.loc(0, 0);
	desk_coldiv.w = winw();
	desk_coldiv.h = winh();
	desk_coldiv.z = min_win_z - 3;
	desk_coldiv.style.backgroundSize = winw() + " " + winh();
	desk_imgdiv.pos = "absolute";
	desk_imgdiv.loc(0, 0);
	desk_imgdiv.w = winw();
	desk_imgdiv.h = winh();
	desk_imgdiv.z = min_win_z - 2;
	desk_imgdiv.style.backgroundSize = winw() + " " + winh();
	desk_imgdiv.style.backgroundRepeat="no-repeat";
	desk_imgdiv.style.backgroundPosition="center";

//	if (!dev_env || qobj.showbgimg) desk_imgdiv.op=0.3;
//	else desk_imgdiv.op=0;

	DDD = make('div');
	DDD.pos = 'absolute';
	DDD.bor = '1px solid white';
	DDD.bgcol = 'gray';
	DDD.op = 0.5;
	DDD.id="DDD";
	DDD.loc(-1, -1);
	DDD.w = 0;
	DDD.h = 0;
	desk.add(DDD);
	CG = make('div');
	CG.id = 'click_guard';
	CG.dis = 'none';
	Desk.CG = CG;
	CG.pos = "absolute";
	CG.loc(0, 0);
	CG.z = CGZ;
	CG.bgcol = "#000";
	CG.w = winw();
	CG.h = winh();
	CG.op = DEF_CG_OP;
	CG.on = useop => {
		if (NUM(useop)) CG.op = useop;
		else CG.op = DEF_CG_OP;
		CG.dis = "block";
	};
	CG.off = () => {
		CG.dis = "none";
	};
	CG.onclick = focus_editing;
	CG.ondblclick = focus_editing;
	CG.onmousedown = e => {
		if (Desk.desk_menu) {
			e.stopPropagation();
			return Desk.desk_menu.kill();
		}
		focus_editing(e);
	};
	CG.onmouseup = focus_editing;
	CG.oncontextmenu = focus_editing;
	CG.onmousemove = nopropdef;
	desk.add(CG);
	let area = make('textarea');
	area.id="desk_textarea";
	let adiv = make('div');
	adiv.pos = "absolute";
	adiv.loc(-1, -1);
	adiv.w = 1;
	adiv.h = 1;
	adiv.op = 0;
	adiv.z = -1;
	adiv.add(area);
	area.w=1;
	desk.add(adiv);
	desk.area = area;
	body.add(desk);
	body.add(background_div);
	body.add(desk_coldiv);
	body.add(desk_imgdiv);

//Icon selection cursor//«
CUR.pos="absolute";
CUR.id="CUR";
CUR.bor=`${CURBORWID}px solid #aaa`;
CUR.w=IGSX;
CUR.h=IGSY;
CUR.z=0;
CUR.op=0;
CUR.mart=-1.5;
CUR.on=(is_tog)=>{
	if (is_tog) cur_showing = true;
	else if (!cur_showing) return;
	CUR.op=1;
	CUR.dis="";
};
CUR.off=(is_tog)=>{
	if (is_tog) cur_showing = false;
	else if (cur_showing) return;
	CUR.op=0;
	CUR.dis="none";
};
CUR.ison=()=>{
	return (CUR.op==1);
};
CUR.isdesk=()=>{
	return (CUR.parentNode===desk);
};
CUR.xoff=()=>{
	return (CUR.parentNode===desk)?desk_grid_start_x:folder_grid_start_x;
};
CUR.yoff=()=>{
	return (CUR.parentNode===desk)?desk_grid_start_y:folder_grid_start_y;
};
CUR.getpos=()=>{
	return {x:(CUR.x-CUR.xoff())/IGSX, y:(CUR.y-CUR.yoff())/IGSY};
};
CUR.setpos=(x,y,icn)=>{
	if (CUR.isdesk()) {
		CUR.x = CUR.xoff()+IGSX*x;
		CUR.y = CUR.yoff()+IGSY*y;
		return;
	}
	if (!icn) return;
	CUR.loc(icn.offsetLeft,icn.offsetTop);
	let d = CUR.main.scrollTop - CUR.offsetTop;
	if (d > 0) CUR.main.scrollTop-=d;
};
CUR.set=()=>{
	if (CUR.isdesk()){
		CUR.x=desk_grid_start_x;
		CUR.y=desk_grid_start_y;
	}
	else{
		let got = CUR.main.lasticon;
		if (got && got.parwin == CUR.main.top) CUR.loc(got.offsetLeft+2,got.offsetTop+2);
		else {
			CUR.main.scrollTop=0;
			CUR.x=CUR_FOLDER_XOFF;
			CUR.y=0;
		}
	}
};
CUR.todesk=()=>{
	if (CUR.parentNode===desk){
		return CUR.on();
	}
//	CUR.bor = `${CURBORWID}px solid #ddd`;
	desk.add(CUR);
	let pos = desk.lastcurpos;
	if (pos) CUR.setpos(pos.x, pos.y);
	else CUR.set();
	CUR.on();
};
CUR.right=(if_ctrl)=>{
	let {x,y}=CUR.getpos();
	if (if_ctrl) CUR.select(true);
	if (CUR.isdesk()){
		if (x+1 < DESK_GRID_W) x++;
		else {
			if (CUR.yoff()+(IGSY*(y+2)) < winh()) {
				y++;
				x=0;
			}
			else {
				x=0;
				y=0;
			}
		}
		CUR.setpos(x,y);
		return;
	}
	let icn = CUR.geticon();
	if (!icn) return;
	let next = icn.nextSibling;
	if (!next) return;
	let xpos = next.offsetLeft;
	let ypos = next.offsetTop;
	CUR.main.lasticon = next;
	CUR.loc(xpos+CUR_FOLDER_XOFF,ypos);
};
CUR.left=(if_ctrl)=>{
	let {x,y}=CUR.getpos();
	if (if_ctrl) CUR.select(true);
	if (CUR.isdesk()){
		if (x > 0) x--;
		else if (y > 0){
			x = DESK_GRID_W-1;
			y--;
		}
		else {
			x = DESK_GRID_W-1;
			y = DESK_GRID_H-1;
		}
		CUR.setpos(x,y);
		return;
	}
	let icn = CUR.geticon();
	if (!icn) return;
	let prev = icn.previousSibling;
	if (!prev) return;
	let xpos = prev.offsetLeft;
	let ypos = prev.offsetTop;
	CUR.main.lasticon = prev;
	CUR.loc(xpos+CUR_FOLDER_XOFF,ypos);
};
CUR.up=if_ctrl=>{
	if (if_ctrl) CUR.select(true);
	let {x,y}=CUR.getpos();
	if (CUR.isdesk()){
		y--;
		if (y<0) {
			y = Math.floor((winh()-CUR.yoff())/IGSY)-1;
			x--;
			if (x<0) x = DESK_GRID_W-1;
		}
		CUR.setpos(x,y);
		return;
	}
	let icn = CUR.geticon();
	if (!icn) return;
	const doit=()=>{
		let r = icn.gbcr();
		let elem = document.elementFromPoint(5+r.left, r.top-10);
		if (!elem) return;
		if (elem.parentNode.className==="icon") elem = elem.parentNode;
		if (elem.className==="icon" && elem.parentNode===icn.parentNode){
			CUR.loc(elem.offsetLeft+CUR_FOLDER_XOFF, elem.offsetTop);
			CUR.scrollIntoViewIfNeeded();
			CUR.main.lasticon = elem;
			return true;
		}
	}
	if (!doit()) {
		CUR.main.scrollTop-=IGSY;
		doit();
	}
};
CUR.down=if_ctrl=>{
	let {x,y}=CUR.getpos();
	if (if_ctrl) CUR.select(true);
	if (CUR.isdesk()) {
		if (desk_grid_start_y+(IGSY*(y+1)) < winh()) y++;
		else{
			y=0;
			x++;
			if (x==DESK_GRID_W) x=0;
		}
		CUR.setpos(x,y);
		return;
	}
	let icn = CUR.geticon();
	if (!icn) return;
	const doit=()=>{
		let r = icn.gbcr();
		let elem = document.elementFromPoint(5+r.left, 5+IGSY+r.top);
		if (!elem) return;
		if (elem.className==="icon" && elem.parentNode===icn.parentNode){
			CUR.loc(elem.offsetLeft+CUR_FOLDER_XOFF, elem.offsetTop);
			CUR.scrollIntoViewIfNeeded();
			CUR.main.lasticon = elem;
			return true;
		}
	};
	if (!doit()) {
		CUR.main.scrollTop+=IGSY;
		doit();
	}
};
CUR.move=(which, if_ctrl)=>{
	if (!CUR.ison()) return CUR.on();
	if (which==="R") CUR.right(if_ctrl);
	else if (which==="L") CUR.left(if_ctrl);
	else if (which==="U") CUR.up(if_ctrl);
	else if (which==="D") CUR.down(if_ctrl);
	if (!CUR.isdesk()) CUR.scrollIntoViewIfNeeded();
};
CUR.geticon=()=>{
	let r = CUR.getBoundingClientRect();
	let elems = document.elementsFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
	let e0=elems[0];
	if (e0===CUR) e0=elems[1];
	if(!e0) return null;
	if (e0.icon) return e0.icon;
	if (e0.className=="icon") return e0;
	if(e0.parentNode&&e0.parentNode.className=="icon") return e0.parentNode;
	let e1=elems[1];
	if(!e1) return null;
	if (e1.className=="icon") return e1;
	if(e1.parentNode&&e1.parentNode.className=="icon") return e1.parentNode;
	return null;
};
CUR.select=(if_toggle,if_open)=>{
	let openit=()=>{
		if (!if_toggle&&ICONS.length==1) {
			icon_dblclick(ICONS[0]);
			return true;
		}
		return false;
	};
	if (!CUR.ison()) {
		if(openit()) return;
		return CUR.on();
	}
	let icn = CUR.geticon();
	if (!icn) return openit();
	let haveit = ICONS.includes(icn);
	if (if_toggle&&haveit){
		icon_off(icn,true);
	}
	else if (if_open){
		if (haveit) icon_off(icn,true);
		icon_dblclick(icn);
	}
	else if (!haveit){
		if (ICONS.length&&(icn.parwin!==ICONS[0].parwin)) icon_array_off();
		ICONS.push(icn);
		icon_on(icn);
	}
	else{
		icon_dblclick(icn);
	}
};
//»

	desk.reset = ()=>{
		body.style.cursor = "default";
		desk.style.cursor = "default";
		DDIE = null;
		DDD.loc(-1, -1);
		DDD.w = 0;
		DDD.h = 0;
	};
//»
//Events«
	let didleave = false;
	let on = () => {
		if (!CDL) return;
		CDL.into(desk.name);
	};
	let off = () => {
		if (!CDL) return;
		CDL.reset();
	};
	desk.onscroll=e=>{desk.scrollTop=0;};
	desk.onmousemove = e => {//«
		ev = e;
		if (CDL) {//«
			if (e.clientX+CDL.clientWidth+CDL_OFFSET-winx() > winw()){
				CDL.x="";
				CDL.r = winw()-e.clientX+winx();
			}
			else{
				CDL.r="";
				CDL.x=e.clientX+CDL_OFFSET-winx();
			}

			if (e.clientY+CDL.clientHeight+CDL_OFFSET-winy() > winh()){
				CDL.y="";
				CDL.b = winh()-e.clientY+winy();
			}
			else {
				CDL.b="";
				CDL.y=e.clientY+CDL_OFFSET-winy();
			}
		}//»
		else if (CRW) {//«
			let dir = CRW.rs_dir;
			if (dir) {
				let w = CRW;
				let odiv = w.movediv;
				let m = w.main;
				let sx = w.startx;
				let sy = w.starty;
				let sw = w.startw;
				let sh = w.starth;
				let sl = w.startl;
				let st = w.startt;
				if (dir.match(/s/)) {
					let goth = sh + e.clientY - sy;
					if (goth > min_win_hgt) {
						m.h = goth;
						let dy = w.gbcr().bottom - winh();
						if (dy > 0 && !win_overflow.b) m.h -= dy;
					}
				} else if (dir.match(/n/)) {
					let dy = e.clientY - sy;
					let goth = sh - dy;
					if (goth > min_win_hgt) {
						let goty = st + dy;
						if (goty >= 0 || win_overflow.t) {
							m.h = goth;
							w.y = goty;
						}
					}
				}
				if (dir.match(/e/)) {
					let gotw = sw + e.clientX - sx;
					if (gotw > min_win_width) m.w = gotw;
					let dx = w.gbcr().right - winw();
					if (dx > 0 && !win_overflow.r) m.w -= dx;
				} else if (dir.match(/w/)) {
					let dx = e.clientX - sx;
					let gotw = sw - dx;
					if (gotw > min_win_width) {
						let gotx = sl + dx;
						if (gotx >= 0 || win_overflow.l) {
							m.w = gotw;
							w.x = gotx;
						}
					}
				} /*XXX TODO odiv can be undefined here TODO XXX*/
				if (!odiv) {
					cerr("Hi,no odiv with CRW in Gen_mousemove");
				} else {
					odiv.w = w.offsetWidth;
					odiv.h = w.offsetHeight;
					odiv.update();
				}
			} else {
				CRW.main.w = CRW.main.w + (e.clientX - (pi(CRW.main.offsetWidth) + CRW.x)) - winx();
				CRW.main.h = CRW.main.h + (e.clientY - (pi(CRW.main.offsetHeight) + CRW.y + CRW.titlebar.h + CRW.footer.h)) - winy();
				if (CRW.main.w < min_win_width) CRW.main.w = min_win_width;
			}
			CRW.status_bar.resize();
			if (CRW.constant_resize) CRW.obj.onresize();
		}//»
		else if (CDW) {//«
			const check_win_loc = (x, y, ifcur, if_win) => {
				let usex = x;
				let usey = y;
				if (!if_win) {
					if (usex < -100) usex = -100;
					else if (usex > winw()) usex = winw();
				} else {
					if (usex < 0) {
//					if (usex < winx()) {
//						if (!win_overflow.l) usex = winx();
						if (!win_overflow.l) usex = 0;
					} else {
						let dx = usex + CDW.offsetWidth - winw() - winx();
						if (dx > 0) {
							if (!win_overflow.r) usex -= dx;
						}
					}
				}
				if (ifcur && usey < 0) {
					if (if_win) {
						if (!win_overflow.t) usey = 0;
					}
				} else if (!if_win) {
					if (usey < -100) usey = -100;
					else if (usey > winh() + 100) usey = winh() + 100;
				} else {
					let dy = usey + CDW.offsetHeight - winh() - winy();
					if (dy > 0) {
						if (!win_overflow.b) {
							usey -= dy;
						}
					}
				}
				return {
					X: usex,
					Y: usey
				};
			};
//			let loc = check_win_loc(e.clientX - DDX, e.clientY - DDY, true, true);
			let loc = check_win_loc(e.clientX - DDX, e.clientY - DDY, true, true);
			CDW.loc(loc.X, loc.Y);
			if (CDW.movediv) CDW.movediv.update();
			if (CDW.constant_move && CDW.obj.onmove) CDW.obj.onmove();
		}//»
		else if (DDIE) {//«
			clearTimeout(drag_timeout);
			if (DDIE.clientX < e.clientX) {
				DDD.style.right = "";
				DDD.x = DDIE.clientX-winx();
				DDD.w = e.clientX - DDIE.clientX;
			} else {
				DDD.style.left = "";
				DDD.style.right = winw() - DDIE.clientX+winx();
				DDD.w = DDIE.clientX - e.clientX;
			}
			if (DDIE.clientY < e.clientY) {
				DDD.style.bottom = "";
				DDD.y = DDIE.clientY-winy();
				DDD.h = e.clientY - DDIE.clientY;
			} else {
				DDD.style.top = "";
				DDD.style.bottom = winh(true) - DDIE.clientY+winy();
				DDD.h = DDIE.clientY - e.clientY;
			}
drag_timeout = setTimeout(()=>{
	select_icons_in_drag_box_desk(e);
},0);
		}//»

		else if (WDIE) {//«
			clearTimeout(drag_timeout);
			let w = Desk.CWIN;
			let m = w.main;
			let scrtopdiff = m.scrollTop - WDIE.scrtop;
			let scrleftdiff = m.scrollLeft - WDIE.scrleft;
			let d = w.drag_div;
			let x_scroll_diff = m.offsetWidth - m.clientWidth;
			let y_scroll_diff = m.offsetHeight - m.clientHeight;
			let gotw;
			let goth;
			if (WDIE.clientX < e.clientX) {
				d.style.right = "";
				d.x = WDIE.clientX - w.offsetLeft + m.scrollLeft - scrleftdiff - winx();
				gotw = e.clientX - WDIE.clientX + scrleftdiff;
				if (gotw > WDIE.maxw) gotw = WDIE.maxw;
				d.w = gotw;
			} else {
				d.style.left = "";
				d.style.right = w.main.w - (WDIE.clientX - w.offsetLeft + m.scrollLeft) - x_scroll_diff + scrleftdiff + winx();
				d.w = WDIE.clientX - e.clientX - scrleftdiff;
			}
			if (WDIE.clientY < e.clientY) {
				d.style.bottom = "";
				d.y = WDIE.clientY - w.offsetTop - w.titlebar.h + m.scrollTop - scrtopdiff-winy();
				goth = e.clientY - WDIE.clientY + scrtopdiff;
				if (goth > WDIE.maxh) goth = WDIE.maxh;
				d.h = goth;
			} else {
				d.y = e.clientY - m.getBoundingClientRect().top + m.scrollTop;
				d.h = WDIE.clientY - e.clientY - scrtopdiff;
			}
drag_timeout = setTimeout(()=>{
	select_icons_in_drag_box_win(e, w, scrleftdiff, scrtopdiff);
},0);
		}//»

/*
		else{
			if (e.clientY+hidden_taskbar_thresh >=window.innerHeight){
				if (taskbar_hidden){
					if (taskbar_timer) return;
					taskbar_timer = setTimeout(()=>{
						taskbar.b=0;
					}, SHOW_TASKBAR_DELAY);
				}
				else {
					if (taskbar_timer) return;
					taskbar_timer = setTimeout(()=>{
						taskbar.z=CGZ-1;
					}, SHOW_TASKBAR_DELAY);
				}
			}
			else {
				if (taskbar_hidden){
					if (taskbar_timer){
						clearTimeout(taskbar_timer);
						taskbar_timer=null;
						return;
					}
					taskbar.b=-taskbar.gbcr().height;
				}
				else {
					if (taskbar_timer){
						clearTimeout(taskbar_timer);
						taskbar_timer=null;
						return;
					}
					taskbar.z=min_win_z-1;
				}
			}
		}
*/

	};//»
	desk.onmouseup = async e => {//«
		e.preventDefault();
		e.stopPropagation();
		body.style.cursor = "default";
		desk.style.cursor = "default";
		DDIE = null;
		DDD.loc(-1, -1);
		DDD.w = 0;
		DDD.h = 0;
		ev = e;
		if (CDICN) {
			cldragimg();
			desk.style.cursor = "";
			if (CDICN.parwin == desk) { /*Back where we started:just move icon*/
				let proms = [];
				CG.on();
				proms.push(place_in_icon_slot(desk, CDICN, {
					X: e.clientX-winx(),
					Y: e.clientY-winy()
				}));
				CDICN.moved = true;
				for (let i = 0; i < ICONS.length; i++) {
					let icn = ICONS[i];
					if (ICONS[i] != CDICN) proms.push(place_in_icon_slot(desk, icn, {
						X: e.clientX-winx(),
						Y: e.clientY-winy()
					}));
				}

				await Promise.all(proms);
				CG.off();

			}
			else if (CDICN.parwin.fullpath() == desk.fullpath()) no_move_all_icons();
			else {
				move_icons(desk_path, () => {
					if (Desk.CWIN) window_off(Desk.CWIN);
					CDICN = null;
				}, e);
				return;
			}
			CDICN = null;
		}
		else if (CDW) {
			CDW.style.boxShadow = window_boxshadow;
			CDW = null;
		} else if (CRW) {
			delete CRW.rs_dir;
			delete CRW.startx;
			delete CRW.starty;
			CRW.status_bar.resize();
			CRW.obj.onresize();
			CRW = null;
		} 
	};//»
	desk.onmousedown = e => {//«
		e.preventDefault();
		if (Desk.CWIN) {
			window_off(Desk.CWIN);
			Desk.CWIN = null;
		}
		if (e.button===0) DDIE = e;
		desk.area.focus();
		CDICN = null;
	};//»
	desk.onclick = e => {//«
		if (!windows_showing) {
			if (IA && IA.length) return;
			toggle_show_windows();
		}
		if (desk.dblclick) delete desk.dblclick;
	};//»
	desk.ondblclick = e => {//«
//log(`${e.timeStamp} DBL`);
	};//»
	desk.onmouseleave = e => {//«
		if (document.elementsFromPoint(e.clientX,e.clientY).includes(desk)) return;
		body.style.cursor = "default";
		desk.style.cursor = "default";
		if (DDIE) desk_drag_off();
		cldragimg();
		if (CRW && CRW.obj) CRW.obj.onresize();
		CDICN = null;
		CRW = null;
		CDW = null;
		if (taskbar_hidden) taskbar.b=-taskbar.gbcr().height;
		else taskbar.z=min_win_z-1;
		if (taskbar_timer){
			clearTimeout(taskbar_timer);
			taskbar_timer=null;
		}
	};//»
	desk.onmouseout = e => {//«
		if (CDICN) {
			didleave = true;
			off();
			return;
		}
		if (CDL && CDL.clear) CDL.clear();
	};//»
	desk.onmouseover = e => {//«
		if (CDL && CDL.copyto) CDL.copyto("Desktop");
		if (!CDICN) {
			return;
		}
		if (CDICN.parwin === desk) return;
		if (!IA.length && CDICN.path === desk_path) return;
		if (!IA.length && (check_if_newpath_is_in_itself(CDICN.fullpath(), desk_path + "/" + CDICN.name))) return;
		didleave = false;
		if (!CDICN) return;
		if (!didleave) on();
	};//»
	desk.oncontextmenu = e => {//«
		if (!cmenu_active) return;
		e.preventDefault();
		e.stopPropagation();
		window_off(Desk.CWIN);
		let usex=e.clientX, usey=e.clientY;
		deskcontext({
			x: usex,
			y: usey
		});
	};//»
	desk.ondrop = async e => {//«
		await save_dropped_files(e, null);
	};//»
//»

return new Promise(async (y,n)=>{//«
	const set_bg_img=async(path)=>{
		return new Promise(async(y,n)=>{
			if (globals.is_ff){
				let bytes = await fsapi.readHtml5File(path, {BLOB:true});
				if (! bytes instanceof Uint8Array) return y();
				let url = URL.createObjectURL(new Blob([bytes]));
				desk_imgdiv.style.backgroundImage=`url("${url}")`;
			}
			else desk_imgdiv.style.backgroundImage=`url("${Core.fs_url(path)}")`;
			y();
		});
	};
	const set_bg_col=async(path)=>{
		return new Promise(async(y,n)=>{
			let bytes = await fsapi.readHtml5File(path, {BLOB:true});
			if (globals.is_ff){
				if (! bytes instanceof Uint8Array) return y();
				let url = URL.createObjectURL(new Blob([bytes]));
				desk_imgdiv.style.backgroundImage=`url("${url}")`;
			}
			else desk_imgdiv.style.backgroundImage=`url("${Core.fs_url(path)}")`;
			y();
		});
	};

	if (lotw_mode) return y();

//	if (!dev_env || qobj.showbgimg) {
	if (await fsapi.pathToNode(USER_BG_IMG_PATH)) {
		await set_bg_img(USER_BG_IMG_PATH);
	}
	else if (await fsapi.pathToNode(DEF_BG_IMG_PATH,{ROOT:true})){
		await set_bg_img(DEF_BG_IMG_PATH);
	}

/*«
	else if (!await fsapi.pathToNode(DEF_BG_IMG_PATH,{ROOT:true})){
		let rv = await fetch('/_sitebgimg');
		if (rv&&rv.ok===true){
			await fsapi.writeHtml5File(DEF_BG_IMG_PATH,await rv.blob(),{ROOT:true});
			await set_bg_img(DEF_BG_IMG_PATH);
		}
	}
	else await set_bg_img(DEF_BG_IMG_PATH);
»*/

	let bgimg_op = DEF_BG_IMG_OP;
	if (await fsapi.pathToNode(USER_BG_IMG_OP_PATH)) bgimg_op=await fsapi.readHtml5File(USER_BG_IMG_OP_PATH);
	desk_imgdiv.op = bgimg_op;
//	}

//	if (!dev_env || qobj.showbgcol) {
	if (await fsapi.pathToNode(USER_BG_COL_PATH)) {
		let text = await fsapi.readHtml5File(USER_BG_COL_PATH);
		if (text.match(/gradient/)) desk_coldiv.style.backgroundImage=text;
		else desk_coldiv.bgcol = text;
	}
	else desk_coldiv.style.backgroundImage=DEF_DESK_GRADIENT;
//	}
	y();

});//»

}//»

const make_taskbar=()=>{//«

let bar = taskbar;//«
let lst_str = `taskbar_hidden:${desk_path}`;

desk.add(bar);
//log(bar);
bar.jsc="space-between";
bar.style.userSelect="none";
bar.onmousedown=noprop;
bar.padt=3;
bar.padb=1;
bar.h=26;
if (qobj.nobar) bar.dis="none";
else bar.dis="flex";
//bar.dis="flex";
bar.pos="absolute";
bar.b=0;
bar.w="100%";
bar.op=0;
bar.z=min_win_z-1;
bar.bgcol="#101020";
bar.hide=()=>{
	taskbar_hidden=true;
	bar.z=CGZ-1;
	bar.b=-bar.gbcr().height;
	for (let i=0; i < windows.length; i++){
		let w = windows[i];
		if (!w.is_minimized) continue;
		minimized_windows.push(w);
		windows.splice(i, 1);
		i--;
	}
};
bar.show=()=>{
	taskbar_hidden=false;
	bar.z=min_win_z-1;
	bar.b=0;
	windows = windows.concat(minimized_windows);
	minimized_windows = [];
};
bar.oncontextmenu=e=>{//«
e.preventDefault();
e.stopPropagation();

window_off(Desk.CWIN);

let items_arr=[];
/*
if (taskbar_hidden){
	items_arr.push("Show\x20Taskbar");
	items_arr.push(()=>{
//		delete localStorage[lst_str];
		bar.show();
	});
}
else{
	items_arr.push("Hide\x20Taskbar");
	items_arr.push(()=>{
//		localStorage[lst_str]="true";
		bar.hide();
	});
}
*/
deskcontext({
	x: e.clientX,
	y: e.clientY
}, {items: items_arr});

}//»
bar.onmouseleave=()=>{
	if (taskbar_hidden){
		bar.hide();
	}
}
bar.onmousemove=e=>{
	e.stopPropagation();
};
//»

let mwb = minwinbar;//«

mwb.marr=mwb.marl=3;
mwb.dis="flex";

mwb.addwin=(w)=>{

let max_wid = "300px";

let r = w.gbcr();
let t = mkdv();
t.pos="absolute";
t.w=r.width;
t.h=r.height;
t.loc(r.left,r.top);
t.bor="1px solid #ccc";
t.z=CGZ-1;
t.style.transition = `transform ${WIN_MIN_TRANS_SECS}s ease 0s, left ${WIN_MIN_TRANS_SECS}s ease 0s, top ${WIN_MIN_TRANS_SECS}s ease 0s, width ${WIN_MIN_TRANS_SECS}s ease 0s`;
requestAnimationFrame(()=>{
	let c = mwb.lastChild;
	let x = c.gbcr().left;
	let wid = c.gbcr().width;
	t.ontransitionend=()=>{
		d.op=1;
		t.del();
	};
	t.loc(x, winh());
	t.w=wid;
});


desk.add(t);


	w.dis="none";
//	if (!CYCLE_MIN_WINS) windows.splice(windows.indexOf(w),1);
	if (taskbar_hidden) {
		windows.splice(windows.indexOf(w),1);
		minimized_windows.push(w);
	}
	w.is_minimized=true;
	w.z = min_win_z;
	let d = mkdv();
	d.fls=1;
	d.op=0;
	d.flb=max_wid;
	d.padt=d.padb=1;
	d.padl=d.padr=5;
	d.marr=d.marl=1.5
	d.maxw=max_wid;
	d.fs=15;
	d.dis="flex";
	d.pos="relative";
	d.tcol="#999";
	d.bor="3px outset #444";
	d.over="hidden";

	let imdiv = w.img_div.cloneNode(true);
	imdiv.marr=5;
	imdiv.pos="";
	d.add(imdiv);
	let titstr = w.title;

	let tit = mkdv();
//	tit.marr=5;
	tit.w="100%";
	tit.innerText=titstr;
	d.add(tit);
	let fdv = mkdv();
	fdv.pos="absolute";
	fdv.loc(0,0);
	fdv.w="100%";
	fdv.h="100%";
//	fdv.style.backgroundImage="linear-gradient(90deg, rgba(34,34,51,0) 90%, rgba(34,34,51,1) 97%)";
	fdv.style.backgroundImage="linear-gradient(90deg, rgba(16,16,32,0) 90%, rgba(16,16,32,1) 97%)";
	d.add(fdv);
	d.onmousedown=()=>{
		d.is_active = true;
		d.bor="3px inset #444";
	};
	d.onmouseup=()=>{
		d.is_active = false;
		d.bor="3px outset #444";
	};
	d.onmouseout=()=>{
		d.is_active = false;
		d.bor="3px outset #444";
	};
	const dounmin=(if_instant)=>{
		w.dis="block";
		let r = d.gbcr();
		d.del();
		const done=()=>{
			delete w.is_minimized;
			delete w.unminimize;
			if (w===Desk.CWIN) Desk.CWIN=null;
			window_on(w);
		}
		if (if_instant) return done();

w.op=0;

let t = mkdv();
t.pos="absolute";
t.w=r.width;
t.h=r.height;
t.loc(r.left,r.top);
t.bor="1px solid #ccc";
t.z=CGZ-1;
desk.add(t);

r = w.gbcr();

t.style.transition = `transform ${WIN_MIN_TRANS_SECS}s ease 0s, left ${WIN_MIN_TRANS_SECS}s ease 0s, top ${WIN_MIN_TRANS_SECS}s ease 0s, width ${WIN_MIN_TRANS_SECS}s ease 0s`;
requestAnimationFrame(()=>{
	t.ontransitionend=()=>{
		w.op=1;
		t.del();
		done();
	};
	t.loc(r.left, r.top);
	t.w=r.width;
	t.h=r.height;
});

	};
	d.onclick=()=>{dounmin()};
	w.unminimize=(if_instant)=>{
		if (if_instant) return dounmin(true);
		d.bor="3px inset #444";
		setTimeout(()=>{d.bor="3px outset #444";dounmin();},200);
	};
	w._button=d;
	mwb.add(d);
	if (w===Desk.CWIN) {
		Desk.CWIN=null;
		top_win_on();
	}

};
bar.add(mwb);
//»

mwb.resize=()=>{mwb.w=winw()};
mwb.resize();
hidden_taskbar_thresh = bar.gbcr().height;

};//»

const set_desk_path = (path) => {//«
	return new Promise(async (Y,N)=>{
		path = path.regpath();
		if (!path.match(/^\//)) return Y();
		if (desk_path===path) return Y(true)
		
		if (! await pathToNode(path)) return Y();
		desk_path = path
		globals.desk_path = desk_path;
		let arr = desk.icons;
		for (let icn of arr) {
			if (icn && icn.del) icn.del();
		}
		await reloadIcons(desk);
		Y(true);
		Core.set_local_storage("desk_path", desk_path, DSK);
		Desk.set_desktop_stats();
	});
};
this.set_desk_path=set_desk_path;

//»
const deskcontext = (loc, opts={}) => {//«
	let itemsarg=opts.items;
	let desk_ctx_items = get_desk_context();
	CG.on();
	let dx = 0;
	let usex = loc.x - winx();
	let usey = loc.y - winy();
	if (usex + 200 > winw()) dx = usex + 200 - winw();
	Desk.desk_menu = new WDG.ContextMenu(desk, {
		x: usex-dx,
		y: usey,
		BREL:opts.BREL,
		RREL:opts.RREL
	}, "desk", null, DSK);
	let useitems = desk_ctx_items;
	if (itemsarg) useitems = itemsarg;
	for (let i = 0; i < useitems.length; i += 2) {
		let item = Desk.desk_menu.add_item(useitems[i], useitems[i + 1]);
	}
	Desk.desk_menu.adjust_y(DSK);
};
this.deskcontext=deskcontext;
//»
const toggle_show_windows = () => {//«
	let wins = filter_windows();
	if (windows_showing) {
		windows_showing = false;
		for (let i = 0; i < wins.length; i++) {
			let w = wins[i];
			if (w == Desk.CWIN) w.is_current = true;
			w.dis = "none";
			if (w.overdiv) w.overdiv.dis = "none";
		}
		window_off(Desk.CWIN);
		Desk.CWIN = null;
		CUR.todesk();
	} else {
		windows_showing = true;
		if (Desk.CWIN) window_off(Desk.CWIN);
		for (let i = 0; i < wins.length; i++) {
			let w = wins[i];
			w.dis = "block";
			if (w.overdiv) w.overdiv.dis = "block";
			if (w.is_current) {
				if (w.is_minimized) {
					w.overdiv.on();
				}
				else window_on(w);
				w.is_current = null;
			}
		}
		if (!Desk.CWIN) top_win_on();
	}
//	Desk.update_windows_showing();
	return true;
}//»
const reload_desk_icons=async()=>{CG.on();let nodes=Array.from(desk.childNodes);let arr=nodes.filter(n=>n.className==="icon");while(arr.length)arr.pop().del();await reloadIcons(desk);CG.off();};

//»
//Folders«
this.add_folder_listeners=(win)=>{//«
let didleave;
let main = win.main;

const clear_drag = () => {
	WDIE = null;
	let dd = win.drag_div;
	dd.loc(-1, -1);
	dd.w = 0;
	dd.h = 0;
};
let on = () => {
	if (!CDL) return;
	main.style.cursor = "copy";
	CDL.into(win.name);
};
let off = () => {
	main.style.cursor = "";
	if (CDL) CDL.reset();
};
main.onmousedown=e=>{
	e.stopPropagation();
	if (e.clientX < win.offsetLeft + main.clientWidth + winx() && e.clientY < win.offsetTop + main.clientHeight + win.titlebar.h + winy()) {
		window_on(win);
		WDIE = e;
		WDIE.scrtop = main.scrollTop;
		WDIE.scrleft = main.scrollLeft;
		let gotw = main.scrollWidth - (e.clientX - win.offsetLeft + main.scrollLeft);
		WDIE.maxw = gotw - 1 + winw();
		let goth = main.scrollHeight - (e.clientY - win.offsetTop - win.titlebar.h + main.scrollTop);
		WDIE.maxh = goth - 1 + winh();
	}
	if (Desk.CWIN == win) return;
	window_off(Desk.CWIN);
	window_on(win);
};
main.onmouseover=e=>{//«
	e.stopPropagation();
	if (CDICN){
		if (CDICN.path === win.fullpath()) return;
		if ((check_if_newpath_is_in_itself(CDICN.fullpath(), win.fullpath() + "/" + CDICN.name))) return;
		didleave = false;
		if (!CDICN) return;
		if (!didleave) on();
	}
};//»
main.onmouseout=e=>{//«
	e.stopPropagation();
	off();
	if (CDICN) {
		didleave = true;
	}
};//»
main.onmouseup=e=>{//«
	e.stopPropagation();
	if (CDICN){//«
		desk.style.cursor = "";
		move_icons(win.fullpath(), rv => {
			off();
			if (Desk.CWIN) window_off(Desk.CWIN);
			window_on(win);
			CDICN = null;
			cldragimg();
		}, e, win);
	}//»
	else {
		CRW=null;
		CDW=null;
		clear_drag();
	}

};//»
main.onmouseleave=e=>{
	clear_drag();
};



};//»

const make_folder = win => {//«
	const reload = () => {
		if (win.reloading) return;
		win.reloading = true;
		icondv.innerHTML="";
		reload_icons(win, () => {
			delete win.reloading;
		}, true);
	};
	const update = async() => {
		let kids = await fsapi.getFsDirKids(win.fullpath());
		win.status_bar.innerHTML = `${kids.length}\xa0items`;
	};
	const clear_drag = () => {
		WDIE = null;
		let dd = win.drag_div;
		dd.loc(-1, -1);
		dd.w = 0;
		dd.h = 0;
	};
	let obj = {};
	let main = win.main;
	win.obj = obj;
	let icondv = make('div');
	main.clear_drag = clear_drag;
	icondv.main = main;
	icondv.win = win;
	icondv.pos = "relative";
//	icondv.padr=10;
//	icondv.padt=10;
//	icondv.pos = "absoulte";
//	icondv.x=10;	
//	icondv.y=10;	
	icondv.dis="flex";
//	icondv.style.flexBasis=`${ICON_DIM}px`;
	icondv.style.flexBasis=`100px`;
	icondv.style.flexShrink=0;
	icondv.style.flexGrow=0;
	icondv.style.flexWrap="wrap";
	win.main.pos = "relative";
	let dv = make('div');
	dv.pos = 'absolute';
	dv.bor = '1px solid white';
	dv.bgcol = 'gray';
	dv.op = 0.5;
	dv.loc(-1, -1);
	dv.w = 0;
	dv.h = 0;
	icondv.add(dv);
	win.icon_div = icondv;
	main.icon_div = icondv;
	main.add(icondv);
	main.overy = "auto";
	main.overx="hidden";
	main.pad=5;
	win.drag_div = dv;
	obj.onresize=()=>{
		icondv.w = main.w;
		let icn = main.lasticon;
		if (!icn) return;
		if (icn.parwin===win) {
			CUR.loc(icn.offsetLeft, icn.offsetTop);
			main.scrollTop = icn.offsetTop-main.clientHeight/2;
		}
		else{
//			main.scrollTop=0;
			delete main.lasticon;
			CUR.set();
		}
	};
	obj.onkeydown = (e, k, mod) => {
		let code = e.keyCode;
		if (kc(code, 'TAB')) {
			e.preventDefault();
			e.stopPropagation();
		} 
		else if (k == "r_") {
			reload();
		} 
		else if (k == "u_") update();
	};
	obj.onescape=()=>{
		if (ICONS.length && ICONS[0].parwin===win) {
			icon_array_off();
			return true;
		}
		return false;
	};
	obj.get_context = () => {
		return [
			"Make\xa0a\xa0folder", () => {
				make_folder_icon_cb(win, null, null, true);
				update();
			}, 
			"Create\xa0a\xa0text\xa0file",
			()=>{Desk.make_icon_cb(win.fullpath(), "Text",win)},
			"Reload", 
			reload
		]
	};
	obj.reload = reload;
	obj.update = update;
	obj.onblur=()=>{
//		CUR.todesk();
	};
	obj.onkill=()=>{
//		CUR.todesk();
	};

//Events

win.ondrop = async e => {
	e.stopPropagation();
	e.preventDefault();
	await save_dropped_files(e, win);
};

let didleave;
let on = () => {
	if (!CDL) return;
	main.style.cursor = "copy";
	CDL.into(win.name);
};
let off = () => {
	main.style.cursor = "";
	if (CDL) CDL.reset();
};
main.onmousedown=e=>{
	e.stopPropagation();
	if (e.clientX < win.offsetLeft + main.clientWidth + winx() && e.clientY < win.offsetTop + main.clientHeight + win.titlebar.h + winy()) {
		window_on(win);
		WDIE = e;
		WDIE.scrtop = main.scrollTop;
		WDIE.scrleft = main.scrollLeft;
		let gotw = main.scrollWidth - (e.clientX - win.offsetLeft + main.scrollLeft);
		WDIE.maxw = gotw - 1 + winw();
		let goth = main.scrollHeight - (e.clientY - win.offsetTop - win.titlebar.h + main.scrollTop);
		WDIE.maxh = goth - 1 + winh();
	}
	if (Desk.CWIN == win) return;
	window_off(Desk.CWIN);
	window_on(win);
};
main.onmouseover=e=>{//«
	e.stopPropagation();
	if (CDICN){
		if (CDICN.path === win.fullpath()) return;
		if ((check_if_newpath_is_in_itself(CDICN.fullpath(), win.fullpath() + "/" + CDICN.name))) return;
		didleave = false;
		if (!CDICN) return;
		if (!didleave) on();
	}
};//»
main.onmouseout=e=>{//«
	e.stopPropagation();
	off();
	if (CDICN) {
		didleave = true;
	}
};//»
main.onmouseup=e=>{//«
	e.stopPropagation();
	if (CDICN){//«
		desk.style.cursor = "";
		move_icons(win.fullpath(), rv => {
			off();
			if (Desk.CWIN) window_off(Desk.CWIN);
			window_on(win);
			CDICN = null;
			cldragimg();
		}, e, win);
	}//»
	else {
		CRW=null;
		CDW=null;
		clear_drag();
	}

};//»
main.onmouseleave=e=>{
	clear_drag();
};

}//»

const reload_icons_in_folder = (which, arr) => {//«
	let icon_name_compare = function(a, b) {
		if (a.NAME > b.NAME) return 1;
		else if (a.NAME < b.NAME) return -1;
		return 0;
	};
	if (which.icons) {
		for (let icn of which.icons) {
			if (icn) icn.del();
		}
		which.icons = [];
	}
	arr = arr.sort(icon_name_compare);
	let alllen = arr.length;
	let iter=0;
	let icondv=which.icon_div;
//	let folders=[];
	const dobatch=()=>{//«
		let tolen = iter+BIG_FOLDER_BATCH_SIZE;
		for (let i=iter;i<tolen; i++) {
			if (i==alllen) {
				if (which!==desk) set_folder_dims(which);

				return;
			}
			let obj = arr[i];
			let name = obj.NAME;
			let app;
//			if (obj.DIR) app = "Folder";
			if (obj.DIR) app = "sys.Explorer";
//			else if (obj.LINK) app = "Link";
//			else if (obj.FIFO) app = "FIFO";
			else app = ext_to_app(obj.EXT);
			if (!app) app = "Unknown";
			let useapp = obj.FOBJ.APP;
			if (obj.FOBJ.ref) useapp = obj.FOBJ.ref.APP;
//			if (useapp=="Folder") useapp="sys.Explorer";
			let arg = {
				LABEL: name,
				APP: useapp,
				ROOTTYPE: obj.ROOTTYPE
			};
			arg.EXT = obj.EXT;
			arg.LINK = obj.LINK;
			arg.TYPE = "icon";
			let newicon = make_icon(arg);
//			newicon.fobj = obj.FOBJ;
			if (obj.LINK) {
				newicon.link = obj.LINK.regpath();
				newicon.add_link();
				let ref = obj.FOBJ.ref;
				let arr = capi.getNameExt(ref.NAME);
				newicon.linkname = arr[0];
				newicon.linkext = arr[1];
				newicon.linkpath = ref.par.fullpath;
				let useapp = ref.APP;
//				if (useapp=="Folder") useapp = "sys.Explorer";
				newicon.linkapp = useapp;
				newicon.ref = ref;
			}
			newicon.name = name;
			newicon.ext = obj.EXT;
			if (which===desk) {
				newicon.pos="absolute";
				place_in_icon_slot(which, newicon, null, true, true);
			}
			else {
				icondv.add(newicon);
				newicon.parwin = which;
			}
			icon_off(newicon);
			if (app == "Application") newicon.deref_appicon();
/*
			if (app==="sys.Explorer") {
				pathToNode(newicon.fullpath()).then(async n=>{
					if (!n.done) await fsapi.popDir(n);
					icon_dblclick(newicon,null,w=>{
						newicon.win = w;
					});
				});
			}
*/
		}
		iter+=BIG_FOLDER_BATCH_SIZE;
		setTimeout(dobatch,MS_BETWEEN_BIG_FOLDER_BATCHES);
	};//»
//log(icondv);
//	if (which===desk) dobatch();
	dobatch();
	which.loaded = true;
}//»
const reload_icons = (win, cb, is_refresh) => {//«
	let fullpath;
	let usemain;
	if (win === desk) {
		fullpath = desk_path;
		usemain = desk;
	} else {
		fullpath = (win.path + "/" + win.name + "/").regpath();
		usemain = win.main;
	}
	path_to_obj(fullpath, ret => {
		if (!ret) return console.error("Nothing returned from path_to_obj:\x20"+fullpath);
		const doload = () => {
			let kids = ret.KIDS;
			let keys = getKeys(kids);
			let kid;
			let arr = [];
			for (let i = 0; i < keys.length; i++) {
				let name = keys[i];
				if (name == "." || name == "..") continue;
				kid = kids[name];
				if (kid.perm===false) continue;
				let obj = {
					PATH: fullpath,
					FOBJ: kid
				};
				obj.ROOTTYPE = ret.root.TYPE;
				if (kid.APP == "sys.Explorer") {
					obj.NAME = name;
					obj.DIR = true;
				} 
				else if (kid.APP == "Link") {
					obj.NAME = name.replace(/\.lnk$/,"");
					obj.APP="Link";
					obj.EXT="lnk";
					obj.LINK = kid.LINK;
				} 
				else {
					let namearr = getNameExt(name);
					obj.NAME = namearr[0];
					obj.EXT = namearr[1];
				}
				arr.push(obj);
			}
			reload_icons_in_folder(win, arr);
//			deref_folder_links(win);
			if (win !== desk) {
				if (!is_refresh) {
//					set_folder_dims(win);
					win.icon_div.w = win.main.w;
				}
				win.status_bar.innerHTML = `${arr.length}\xa0items`;
			}
			cb && cb();
		};
		if (!ret.done) fs.popdir(ret, doload,{DSK:DSK});
		else doload();
	});
};//»
const open_folder_win = (name, path, iconarg, winargs) => {//«
	let icon = iconarg ||{app: "sys.Explorer",name: name,path: path,fullpath:()=>{(path + "/" + name).regpath()}};
	icon.winargs = winargs;
	let win = open_new_window(icon);
	winon(win);
}//»
const deref_folder_links = (which) => {//«
	let icons = get_icon_array(which, true);
	let len = icons.length;
	let iter = -1;

	function doicon() {
		iter++;
		if (iter == len) return;
		let icon = icons[iter];
		if (!(icon && icon.link)) return doicon();
		icon.deref_link(doicon);
	}
	doicon();
}//»
const set_folder_dims = (win) => {//«
	let obj = get_newwin_obj();
	if (!(NUM(win.x))) win.x = obj.X;
	if (!(NUM(win.y))) win.y = obj.Y;
	if (!(NUM(win.main.h))) win.main.h = 400;
	if (!(NUM(win.main.w))) win.main.w = 500;
	check_win_size(win);
	check_win_loc(win);
	return;
	if (NUM(win.main.w)&&NUM(win.main.h)) return;
	let kids = win.icon_div.childNodes;
	let hix = 0;
	for (let kid of kids) {
		let gotx = kid.x + kid.offsetWidth;
		if (gotx > hix) hix = gotx;
		else break;
	}
	if (hix < 350) hix = 350;
	win.main.w = hix + 15;
	let h = 15 + (kids[kids.length - 1].gbcr().bottom - win.main.offsetTop);
	if (h < 350) h = 350;
	if (h > win.main.h) h = win.main.h;
	win.main.h = h;
	check_win_size(win);

}//»
const check_name_exists = (str, which, usepath) => {//«
	if (str == "" || str.match(RE_SP_ONLY)) return true;
	let par;
	if (which) par = which;
	else if (usepath) par = get_win_by_path(usepath);
	if (!par) throw new Error("check_name_exists():No par!");
	let icons = get_icon_array(par, true);
	for (let i = 0; i < icons.length; i++) {
		let icon = icons[i];
		if (which && icon === which) continue;
		if (icon.fullname == str) return true;
	}
	return false;
}//»
const get_icon_array = (arg, if_compact) => {//«
	let icons;
	if (arg.icons) icons = arg.icons;
	else if (arg == desk) icons = set_icon_array_of_desk();
	else icons = set_icon_array_of_win(arg);
	let arr = [];
	if (if_compact) {
		for (let i = 0; i < icons.length; i++) {
			let icon = icons[i];
			if (icon) {
				if (icon.parentNode) arr.push(icon);
				else icons[i] = undefined;
			}
		}
		return arr;
	} else return icons;
}//»
const set_icon_array_of_desk = () => {//«
	let numx = DESK_GRID_W;
	desk.cols = numx;
	let arr = [];
	let kids = desk.childNodes;
	for (let i = 0; i < kids.length; i++) {
		let kid = kids[i];
		if (kid.type != "icon" || kid.path != desk_path) continue;
		let num = kid.col + (kid.row * numx);
		arr[num] = kid;
	}
	desk.icons = arr;
	return arr;
}//»
const set_icon_array_of_win = (win) => {//«
	let arr = [];
	let iconarr = win.getElementsByClassName("icon");
	for (let i = 0; i < iconarr.length; i++) arr[i] = iconarr[i];
	win.icons = arr;
	win.cols = FOLDER_GRID_W;
	return arr;
}//»
const vacate_icon_slot = icon => {//«
	if (icon.parwin!==desk) return;
	if (!(icon.name && icon.parwin)) {
console.error("No icon.name && icon.parwin", icon);
		return;
	}
	let oldarr = icon.parwin.icons;
	let ind = oldarr.indexOf(icon);
	if (ind > -1) {
if (icon.parwin===desk){
delete localStorage[icon.fullpath()];
}
		oldarr[ind] = undefined;
	} else console.error("The icon was not in the icons array!", icon);
}//»
const place_in_icon_slot = (elem, icon, pos, if_create, if_load) => {//«
	let startx;
	let starty;
	let iswin;
	if (elem.type == "window") {
		startx = folder_grid_start_x;
		starty = folder_grid_start_y;
	} else if (elem == desk) {
		startx = desk_grid_start_x;
		starty = desk_grid_start_y;
	}
	if (icon.name && !if_create) vacate_icon_slot(icon);
	let arr = get_icon_array(elem);
	if (if_create&&elem===desk){
		icon.pos="absolute";
		icon.parwin = desk;
		elem.add(icon);
		let s = localStorage[icon.fullpath()];
		if (s){
			let parr = s.split(" ");
			let col = parseInt(parr[0]);
			let row = parseInt(parr[1]);
			let i = col + (row * DESK_GRID_W);
			arr[i] = icon;
			icon.slot = i;
			icon.col=col;
			icon.row=row;
			icon.z = ICON_Z;
			icon.x=desk_grid_start_x + (col * IGSX);
			icon.y=desk_grid_start_y + (row * IGSY);
			return;
		}
		else if(if_load){
console.error(`The icon (${icon.name}) was not found in localStorage!`);
console.log(icon);
		}
	}
	const do_add=()=>{
		if (elem.icon_div) {
			icon.parwin = elem.icon_div.win;
			elem.icon_div.add(icon);
		} else {
			icon.parwin = desk;
			elem.add(icon);
			icon.save();
		}
	};
	if (!pos) {
		let i = 0;
		let x, y;
		let doit = () => {
			let xnum = i % elem.cols;
			let ynum = Math.floor(i / elem.cols);
			x = startx + (xnum * IGSX);
			y = starty + (ynum * IGSY);
			icon.col = xnum;
			icon.row = ynum;
			icon.x = x;
			icon.y = y;
			arr[i] = icon;
			icon.slot = i;
			icon.z = ICON_Z;
			do_add();
		};
		for (; i < arr.length; i++) {
			if (!(arr[i] && arr[i].parentNode)) break;
		}
		doit();
		return {
			x: x,
			y: y
		};
	} else {

		let low_dist = Infinity;
		let low_x = null;
		let low_y = null;
		let good_it = null;
		let i = 0;
		let grid_x = Math.floor((pos.X - startx) / IGSX);
		if (grid_x < 0) grid_x = 0;
		let grid_y = Math.floor((pos.Y - starty) / IGSY);
		if (grid_y < 0) grid_y = 0;
		let grid_pos = (grid_y * elem.cols) + grid_x;
		if (!arr[grid_pos] && (grid_x < elem.cols)) {
			good_it = grid_pos;
			low_x = startx + (grid_x * IGSX);
			low_y = starty + (grid_y * IGSY);
		} else {
			let check_low = () => {
				let ynum = Math.floor(i / elem.cols);
				let xnum = i % elem.cols;
				let x = startx + (xnum * IGSX);
				let y = starty + (ynum * IGSY);
				let got_dist = dist(x + 40, y + 40, pos.X, pos.Y);
				if (got_dist < low_dist) {
					low_dist = got_dist;
					low_x = x;
					low_y = y;
					good_it = i;
				}
			};
			for (i = 0; i < arr.length; i++) {
				let icn = arr[i];
				if (!icn) check_low();
			}
			if (!(low_x && low_y)) check_low();
		}
		if (low_x && low_y) {
			icon.col = good_it % elem.cols;
			icon.row = Math.floor(good_it / elem.cols);
			icon.z = ICON_Z;
			arr[good_it] = icon;
			do_add();
			return move_icon(icon, low_x, low_y);
		}
		throw new Error("failure");
	}
}//»
const reloadIcons = win => {//«
	return new Promise((Y, N) => {
		reload_icons(win, Y);
	});
}//»
const update_folder_statuses = usepath => {//«
	for (let w of windows) {
		if (w.app === "sys.Explorer") {
			if (usepath) {
				if (w.fullpath() === usepath) w.obj.update();
			} else w.obj.update();
		}
	}
};
this.update_folder_statuses=update_folder_statuses;
//»

//»
//Window/App«
//			if (this.type !== "window") return console.warn("Trying to set the path of type=" + this.type);

const make_window = (arg) => {//«
	let do_center = false;
	let is_embedded = arg.EMBEDDED;
	let is_chrome = arg.ISCHROME;
	let is_normal = !(is_embedded || is_chrome);
	let is_hidden = arg.HIDDEN;
	let app = arg.APP;
	let appobj = arg.APPOBJ;
	let winid;
	if (!appobj) appobj = {};
	let win = make("div");
//log(arg.FULLPATH);
	win._fullpath = arg.FULLPATH;
	if (is_hidden) win.dis="none";
	Object.defineProperty(win, "path", {
		get:function(){return this._path;},
		set:function(arg){this._path=arg;}
	});
	win.zup =()=>{
		if (is_chrome) return;
		if (win.is_minimized) win.unminimize(true);
		win.style.zIndex = ++hiZ;
		if (win.overdiv) win.overdiv.style.zIndex = ++hiZ;
	};
	win.className="topwin";
	win.is_layout = false;
	if (is_chrome) {
		win.is_chrome = true;
	} else if (!(is_embedded||is_hidden)) windows.push(win);

	let main = make("div");
	win.main = main;
	main.top = win;
	win.ondrop = e => {
		e.stopPropagation();
		e.preventDefault();
	};
	win.onclick=noprop;
	win.ondblclick=noprop;
	win.onmouseover=noprop;
	win.onmouseout=noprop;
	win.onmousedown=e=>{
		e.stopPropagation();
		window_on(win);
	};
	if (arg.DIALOG) win.dialog = arg.DIALOG;
	if (arg.NOBUTTONS) {
		win.nobuttons = true;
		win.dialog = true;
	}
	if (is_chrome || arg.NOCHROME) win.nowindecs = true;
	no_select(win);
	if (appobj.path) {
		if (app.match(/^\./)) win.app = app;
		else win.app = appobj.path.replace(/\//g,".") + "."+app
	}
	else win.app = app;
	win.type = "window";
	if (!is_embedded) win.pos = "absolute";
	if (!win.nowindecs) {
		win.bor = "1px solid #333";
	}

	if (arg.ID) {
		if (!arg.ID.match(/^win_\d+$/)) throw new Error("What arg.ID here:" + arg.ID);
		win.id = arg.ID;
	} else win.id = "win_" + get_win_id();
	winid = win.id;
	main.id = "main_"+winid;
	if (arg.ALIAS) win._alias = arg.ALIAS;
	if (arg.APPMODE) win.nosave = true;
	else win.nosave = null;
	if (arg.FULLSCREEN) {
		win.loc(0, 0);
		main.w = winw();
		main.h = winh();
	} else {
		if (NUM(arg.X)&&NUM(arg.Y)) {
			win.x=arg.X;
			win.y=arg.Y;
		}
		else if (arg.CENTER){
			do_center = true;
		}
		if (NUM(arg.WID)) main.w=arg.WID;
		if (NUM(arg.HGT)) main.h=arg.HGT;
	}
	if (isint(arg.Z)) win.z = arg.Z;
	else win.z=2;
	no_select(main);
	main.bgcol = mainwin_bgcol;
	main.tcol = "#000";
	main.bor = "0px solid transparent";
	main.pos = "relative";
	main.className="mainwin";
	main.type = "window";

	main.oncontextmenu = e => {
		e.preventDefault();
		e.stopPropagation();
		if (have_window_cycle) return;
		if (!cmenu_active) return;
		if (win.context_menu_on) win.context_menu_on(e);
	}; /*title in center*/
	let titlebar = make('div');
	titlebar.id="titlebar_"+winid;
	titlebar.h = 18;
	if (win.nowindecs) titlebar.dis = "none";
	no_select(titlebar);
	titlebar.className = "titlebar";
	titlebar.win = win;
	win.titlebar = titlebar;
	main.titlebar = titlebar;
	main.app = app;
	titlebar.oncontextmenu = nopropdef;
	titlebar.draggable=true;
	titlebar.ondragstart=e=>{
		e.preventDefault();
		if (win.is_maxed) win.maximize_button.reset();
		win.style.boxShadow = "";
		CDW = win;
		DDX = e.clientX - pi(win.offsetLeft);
		DDY = e.clientY - pi(win.offsetTop);
	};
	let title = make("div");
	title.id="title_"+winid;
	title.padt=1.25;
	title.ta = "center";
	title.pos = "relative";
	win.title_div = title;
	title.tcol = "black";
	title.ff = "sans-serif";
	title.ael('mouseover', () => {
		body.style.cursor = "default";
	});
	titlebar.add(title);
	titlebar.label = win.namespan;
	if (is_normal) {
		win["bgcol.on"]=WIN_COL_ON;
		win["bgcol.off"]=WIN_COL_OFF;

		let namespan = make('span');
		namespan.id="namespan_"+winid;
		namespan.fs = 12;
		namespan["tcol.on"] = WINNAME_COL_ON;
		namespan["tcol.off"] = WINNAME_COL_OFF;
		namespan.title = winid;
		win.namespan = namespan;
		Object.defineProperty(win, "title", {
			get: () => {
				return namespan.innerText.trim();
			},
			set: arg => {
				namespan.innerText = arg.regstr().replace(/\x20/g, "\xa0");
			}
		});
		win.title = arg.NAME;
		title.add(namespan);

		main.over="hidden";

	}
	titlebar.onmouseover=e=>{
		if (CDL) titlebar.style.cursor = "";
		else titlebar.style.cursor = "move";
	};
	if (is_normal) {
		let img_div = make('div');
		img_div.pos = "absolute";
		img_div.bor = "0px solid transparent";
		img_div.x = 0;
		img_div.y = 0;
		img_div.padb = 3;
		img_div.style.cursor = "default";
		win.context_menu_on = (e) => {
			if (!win.obj.get_context) return;
			CG.on();
			let op_hold = img_div.op;
			let usex,usey;
			if (e) {
				usex = e.clientX;
				usey = e.clientY;
			}
			else{
				img_div.bgcol = "#fff";
				img_div.op=1;
				let r = win.gbcr();
				usex = r.left;
				usey = r.top+win.titlebar.h;
			}
			WDG.wincontext({
				x:usex,
				y:usey
			}, win, DSK);
			Desk.desk_menu.kill_cb = () => {
				img_div.op=op_hold;
				img_div.bgcol = "";
				if (win.obj&&win.obj.onfocus) win.obj.onfocus();
			};
		};
		img_div.onclick = ()=>{win.context_menu_on()};
		win.img_div = img_div;
		title.add(img_div);
		let useimg = arg.WINTITLEIMG;
		if (useimg) {
			img_div.img = useimg;
			img_div.add(useimg);
		}
		else igen.attach({
			PAR: img_div,
			APP: app,
			OPTS:{LETS:arg.LETS}
		});
		Object.defineProperty(win, "titleimg", {
			get: () => {
				return img_div.img;
			},
			set: arg => {
				if (!isobj(arg)) return;
				delete img_div.wrapper;
				delete img_div.img;
				img_div.innerHTML="";
				igen.attach({APP: app, PAR:img_div, OPTS:arg});
				img_div.img.style.maxWidth = TITLE_DIM
			}
		});
		img_div.id="titleimgdiv_"+winid;
		img_div.img.id="titleimg_"+winid;
		img_div.title = app.split(".").pop();
		win.style.boxShadow = window_boxshadow;
	} 
/*Buttons on right*/
//«
	const doclose = function(evt, thisarg, force, if_dev_reload) {
		if (win.is_minimized) return;
		let _this = this;
		let usethis;
		if (thisarg) usethis = thisarg;
		else usethis = _this;
		if (!force && (win != Desk.CWIN)) return;
		let topwin = usethis.top;
		if (topwin.no_events) return;
		if (topwin.nobuttons && !force) return;
		let gotpar = topwin.parent_win;
		if (topwin.obj.onkill) topwin.obj.onkill(if_dev_reload);
		for (let i = 0; i < windows.length; i++) {
			if (windows[i] == topwin) windows.splice(i, 1);
		}
//if (win.app=="sys.Explorer"){
//	topwin.dis="none";
//}
//else{
		topwin.killed = true;
		topwin.obj.killed = true;
		topwin.del();
		if (topwin.icon) topwin.icon.win = null;
//}
		if (gotpar) {
			delete gotpar.child_win;
			Desk.CWIN = gotpar;
			window_on(gotpar);
		}
		else {
			top_win_on();
		}
	};


	let butdiv = make('div');
	butdiv.style.cursor = "default";
	win.butdiv = butdiv;
	butdiv.off = () => {
		butdiv.op = 0.5;
	};
	butdiv.on = () => {
		butdiv.op = 0.75;
	};
	if (win.nobuttons) butdiv.op = 0;
	butdiv.pos = "absolute";
	butdiv.r = 3;
	butdiv.y = 0;
	butdiv.dis = "flex";
	butdiv.style.flexDirection = "row-reverse";
	butdiv.h = 16;
	butdiv.z=1000000;
	butdiv.tcol = "#000";
	const mkbut = (col, sz) => {
		let b = make('div');
		b.over = "hidden";
		b.padl=b.padr=2;
		b.ta = "center";
		b.fs = sz;
		b.w = 16;
		b.h = 16;
		b.bor="1px solid #000";
		b.bgcol = WINBUT_OFF_COL;
		b.onmousedown=e=>{e.stopPropagation();};
		b.hover = () => {
			b.bgcol=WINBUT_ON_COL;
		};
		b.unhover = () => {
			b.bgcol=WINBUT_OFF_COL;
		};
		b.top = win;
		butdiv.add(b);
		return b;
	};
	let close = mkbut("14px");
	close.id="closebut_"+winid;
	close.innerText="\u{1f5d9}";
	close.title="Close";
	close.style.lineHeight = "15px";
	butdiv.close = close;
	titlebar.close = close;
	win.close_button = close;
	win.force_kill = if_dev_reload => {
		if (win.is_minimized) win.unminimize(true);
		doclose(null, close, true, if_dev_reload);
	};
	close.onclick=()=>{
//		butdiv.reset();
		win.force_kill();
	}
	win.key_kill = () => {
		if (win.obj && win.obj.is_editing) {
			if (win.obj.try_kill) win.obj.try_kill();
			else cwarn("Dropping close signal");
		} else doclose(null, close);
	};
	let max = mkbut("12px");
	max.id="maxbut_"+winid;
	max.style.lineHeight = "16px";
	max.reset=()=>{
		win.is_maxed = false;
//		max._char="\u{1f5d6}";
		max.innerText="\u{1f5d6}";
//		max.innerText
		max.title="Maximize";
	};
	max.onclick = () => {
		let w = win;
		if (w.movediv||w.is_transitioning||w.is_minimized||w.is_fullscreen) return;
//		butdiv.reset();
		close.unhover();
		max.unhover();
		min.unhover();
		let transend = e =>{
			w.style.transition = "";
			w.main.style.transition = "";
			win.status_bar.resize();
			win.obj.onresize();
			w.removeEventListener('transitionend', transend);
			delete w.is_transitioning;
		};
		if (!Desk.automate_mode) {
			w.is_transitioning = true;
			w.addEventListener('transitionend', transend);
			w.style.transition = "left 0.2s, top 0.2s";
			w.main.style.transition = "width 0.2s, height 0.2s";
		}
		if (!w.is_maxed) {
			w.maxholdw = w.main.w;
			w.maxholdh = w.main.h;
			w.maxholdx = w.x;
			w.maxholdy = w.y;
			w.is_maxed = true;
			let usepl = 0;
			let usepr = 0;
			let pl = win.main.padl;
			let pr = win.main.padr;
			if (pl) usepl = pi(pl);
			if (pr) usepr = pi(pr);
			w.loc(1,0);
			w.main.style.width = winw() - usepl - usepr - 2;
			w.main.style.height = winh() - titlebar.gbcr().height - footer.gbcr().height - 3;
//			max._char="\u{1f5d7}";
			max.innerText="\u{1f5d7}";
			max.title="Unmaximize";
		} else {
			w.main.w = w.maxholdw;
			w.main.h = w.maxholdh;
			w.x = w.maxholdx;
			w.y = w.maxholdy;
			max.reset();
		}
		if (Desk.automate_mode) transend();

	};
	max.reset();
	win.maximize_button = max;

//XXXXXXXXXXXXXXXXXXX

	let min = mkbut("16px");
	min.id="minbut_"+winid;
	min.innerText="\u{1f5d5}"; 
	min.title="Minimize";
	min.onclick=()=>{
		if (win.is_minimized) return;
		minwinbar.addwin(win);
	};
	win.minimize_button = min;

	butdiv.win = win;
	const onhover=function(){
		if (CDL) return;
		butdiv.op = 1;
		this.hover();
	};
	const onunhover=function(){
		if (CDL) return;
		if (win !== Desk.CWIN) butdiv.op=0.5;
		else butdiv.op = 0.75;
		this.unhover();
	};
///*
	close.onmouseenter=onhover;
	close.onmouseleave=onunhover;
	max.onmouseenter=onhover;
	max.onmouseleave=onunhover;
	min.onmouseenter=onhover;
	min.onmouseleave=onunhover;
//*/
	title.add(butdiv);
//»

	let footer=make('div');
	footer.id="foot_"+winid;
	if (!win.nowindecs && is_normal) {
		footer.dis="flex";
		footer.style.justifyContent="space-between";
		footer.h=18;
		let statdiv=make('div');
		statdiv.id="stat_"+winid;
		statdiv.onmousedown=noprop;
		statdiv.onclick=noprop;
		statdiv.oncontextmenu=noprop;
		statdiv.tcol="#ddd";
		statdiv.fs=14;
		statdiv.padl=3;
		statdiv.padt=1;
		statdiv.over="hidden";
		let rsdiv = make('div');
		rsdiv.id="rsdiv_"+winid;
		rsdiv.win = win;
		rsdiv.style.flex="0 0 15px";
		rsdiv.bgcol="#778";
		rsdiv.bor="2px inset #99a";
		rsdiv.onmouseover=e=>{
			if (CDL) rsdiv.style.cursor = "";
			else rsdiv.style.cursor = "nwse-resize";
		};
		rsdiv.draggable=true;
		rsdiv.ondragstart=e=>{
			e.preventDefault();
			if (win.is_maxed) max.reset();
			CRW = win;
			if (CRW != Desk.CWIN) window_on(CRW);
			desk.style.cursor = "nwse-resize";
		};
		statdiv.resize=()=>{statdiv.style.maxWidth = main.w - 20;};
		win.status_bar = statdiv;
		win.rs_div = rsdiv;
		footer.add(statdiv);
		footer.add(rsdiv);
	}
	win.footer=footer;
	win.add(titlebar);
	win.add(main);
	win.add(footer);
	desk.add(win);
	if (is_normal) win.img_div.img.style.maxWidth = TITLE_DIM;
	if (do_center) Core.api.center(win);
	win.obj = {};
	arg.MAIN = main;
	arg.TOPWIN = win;
	arg.WINID = win.id;
	arg.main = main;
	arg.topwin = win;
	arg.winid = win.id;
	arg.DESK = Desk;
	arg.CORE = Core;
	arg.Core = Core;
	arg.Desk = Desk;
	arg.NS = NS;
	if (win.nosave) arg.APPMODE = true;
	if (!arg.ISBLANK) make_app_window(arg);
	return win;
}
this.make_window=make_window;
//»

const make_app_window = (arg) => {//«

//Var«

	let hashsum;
	let have_cache = false;
	let hold_current = Desk.CWIN;
	let win = arg.TOPWIN;
	let mainwin = arg.MAIN;
	let appobj = arg.APPOBJ || {};
	appobj.DSK = DSK;
	let app_path = appobj.path;
	let url;
	let cb = arg.CB||(()=>{});
	let scrpath;
	let winapp = win.app;
	let is_local = winapp.match(/^local\./);
	let str, marr;
	let icon = arg.ICON || {};
	if (!icon.ready) icon.ready={};

//»

	win.barferror = e => {//«
		mainwin.pad = 10;
		mainwin.bgcol = "#000";
		mainwin.tcol = "#aaa";
		mainwin.fs = "";
		mainwin.innerHTML = "<br><div style='text-align:center;color:#f55;font-size:34;font-weight:bold;'>Error</div><br><pre><b>" + e.stack + "</b></pre>";
		window_on(win);
		cb(win);
	};//»
	const loadit = async() => {//«
		set_win_defs(win);
		icon.ready.state = "Awaiting application onload event";
		await win.obj.onload();
		if (arg.APPMODE) win.obj.onappinit();
		icon.ready.state = true;
		cb(win);
	};//»
	const load_cb = () => {//«
		icon.ready.state = "Running application";
		try {
			if (!arg.MAIN) console.log(" ");
			win.obj = new NS.apps[winapp](appobj,NS,globals,Core,Desk,mainwin);
			NS.apps[winapp]._hashsum = hashsum;
			win.obj._hashsum = hashsum;
			win.obj.arg = arg;
			loadit();
		} catch (e) {
			icon.ready.error = "Application script runtime error:\x20"+winapp;
			win.barferror(e);
		}
	};//»

	const do_win_del=mess=>{//«
		win.del();
		if (windows.includes(win)) windows.splice(windows.indexOf(win),1);
		icon.ready.error = mess;
		cb();
		WDG.popwait(mess, () => {
			if (hold_current) setTimeout(() => {
				window_on(hold_current);
			}, 50);
		}, "error");
	}//»
	const make_it = async () => {//«
		if (!str) {
			do_win_del("The application does not exist:\x20" + winapp);
			return;
		}
		str = `window[__OS_NS__].apps["${winapp}"] = function (arg,NS,globals,Core,Desk,Main){(async()=>{"use strict";${str}\n})()}`;
//log(str);
		let scr = make('script');
		scr.onload = load_cb;
		scr.onerror = e => {
			icon.ready.error = "Application script load error:\x20"+winapp;
			win.barferror(e);
		};
		let path = "/runtime/apps/" + winapp + ".js";
		await fsapi.saveFsByPath(path,str,{ROOT:true});
		scr._src = Core.fs_url(path);
		document.head.add(scr);
	};//»
	const err_cb = e => {//«
		if (win && win.icon) delete win.icon.win;
		let mess = "The application could not be loaded\xa0(" + winapp + ")";
		if (e) mess = `${mess}<br><br>Reason:${e.message||e}`;
		do_win_del(mess);
	};//»
	const load_cache = () => {//«
		const doit=()=>{
			let scr;
			let trypath=("/"+winapp.replace(/\./g, "/") + ".js").regpath();
			if (!appobj.path)trypath = "/code/apps"+trypath;
			path_to_obj(trypath, async ret => {
				if (!ret) {
					icon.ready.error = "Could not find the app at:\x20" + trypath;
					return poperr("Could not find the app at:\x20" + trypath);
				}
				let url;
				let type = ret.root.TYPE;
				if (type == "fs") {
					str = await fsapi.readHtml5File(trypath, {
						ROOT: true
					});
					if (!str) return err_cb();
/*
					hashsum = str.slice(-42,-2);
					if (have_cache) Core.do_update(`apps.${winapp}`, hashsum, (rv)=>{
						if (rv) {
							delete NS.apps[winapp];
							NS.apps[winapp]=undefined;
						}
					});
*/
				}
				else {
					if (type == "remote") {
						if (trypath.match(/^\/site\/users\//)) {
							let marr = trypath.match(/^\/site\/users\/(.+)$/);
							let arr = marr[1].split("/");
							if (arr.length < 2) url = trypath;
							else {
								let uname = arr.shift();
								let fname = arr.pop();
								let dirname = arr.join("/");
								if (!dirname) dirname = "/";
								url = '/_getuserfile?user=' + uname + '&file=' + fname + '&dir=' + dirname;
							}
						} else url = trypath;
					}
					else if (type == "local") url = Core.loc_url(trypath);
					else {
						icon.ready.error = "Cannot create application from type:\x20" + type;
						return poperr("Cannot create application from type:\x20" + type);
					}
					try {
						let res = await fetch(url);
						str = await res.text();
					} catch (e) {
						err_cb();
						return;
					}
				}
				make_it();
			}, true);
		};
		if (appobj.path) return doit();
		fs.app_is_installed(winapp, rv => {
			if (rv) {
//console.warn(`Here we have apps.${winapp} loaded from cache... do we need another? APPAPPAPPAPP`);
				have_cache = true;
				doit();
				return
			}
			fs.install_app(winapp, ret => {
				if (ret) doit();
				else {
					icon.ready.error = "Could not install app:" + winapp;
					poperr("Could not install app:" + winapp);
				}
			}, {}, DSK);
		}, DSK);
	};//»
	const doload = async () => {//«
		icon.ready.state = "Seeking application file";
		if (NS.apps[win.app]) {
			win.obj = new NS.apps[winapp](appobj,NS,globals,Core,Desk,mainwin);
			win.obj._hashsum = NS.apps[winapp]._hashsum;
			loadit();
			return;
		} 
		else if (appobj.path) return load_cache();
//		else if (is_local || (!globals.is_offline && dev_mode)) {
		try {
			if ((marr = winapp.match(/^local\.(.+)$/))) {
				if (!qobj.loc_app_root) throw "The local application root is not defined!";
				let path = ("/" + qobj.loc_app_root + "/" + marr[1].replace(/\./g, "/") + ".js").regpath();
				if (!path.match(/^\/loc\//)) {
					icon.ready.error = "Currently only supporting '/loc' paths!";
					throw new Error("Currently only supporting '/loc' paths!");
				}
				url = Core.loc_url(path) + "&range=0-end";
			} 
			else {
				url = sys_url("/apps/" + winapp.replace(/\./g, "/") + ".js");
			}
			let res = await fetch(url);
			str = await res.text();
		} catch (e) {
			err_cb(e);
			return;
		}
		make_it();
//		} 
//		else load_cache();
		
	};//»

	if(winapp=="Script" || winapp=="None"){set_win_defs(win);icon.ready.state=true;cb(win);return;}
/*«
	else if (winapp=="Folder") {
		make_folder(win);
		set_win_defs(win, arg);
		icon.ready.state=true;
		cb(win);
	}
»*/
	win.main.onmouseup=e=>{
		CRW=null;
		CDW=null;
		if (!arg.ISCHROME && win.obj.onicondrop) {
			e.stopPropagation();
			desk.style.cursor="";
			if (CDICN) {
				let paths = [CDICN.fullpath()];
				for (let icon of IA) paths.push(icon.fullpath());
				win.obj.onicondrop(paths.uniq());
				win.winon();
			}
			CDICN = null;
			icon_array_off();
			cldragimg();
		}
	};
	doload();

}//»

const open_terminal = () => {//«
	open_app("sys.Terminal", null, true);
	return true;
};
this.open_terminal = open_terminal;
//»
const set_win_defs = (w,arg={}) => {//«
	const noop = () => {};
	let obj = w.obj;
	obj.winid = w.id;
	if (!obj.type) obj.type = "default";
	if (!obj.topwin) obj.topwin = w;
	if (!obj.onresize) obj.onresize = noop;
	if (!obj.onappinit) obj.onappinit = noop;
	if (!obj.onload) obj.onload = () => {
		return new Promise((Y, N) => {
			Y(true)
		})
	};
	if (!obj.get_context) obj.get_context = ()=>{
		return [
		];
	}
	if (!obj.onkill) obj.onkill = noop;
	if (!obj.onsave) obj.onsave = noop;
	if (!obj.onloadfile) obj.onloadfile = noop;
	if (!obj.onicondrop) obj.onicondrop = noop;
	if (!obj.onfocus) obj.onfocus = noop;
	if (!obj.onblur) obj.onblur = noop;
	if (!obj.onkeydown) obj.onkeydown = noop;
	if (!obj.onkeyup) obj.onkeyup = noop;
	if (!obj.onkeypress) obj.onkeypress = noop;
	if (!w.is_chrome && w.style.zIndex >= 0) {
		check_win_visible(w);
		w.status_bar.resize();
		if (!arg.HIDDEN) {
			window_off(Desk.CWIN);
			window_on(w);
		}
	}
};
this.set_win_defs=set_win_defs;
//»
const ext_to_app = ext => {//«
	if (!ext) return DEF_BIN_OPENER;
	let num = globals.ext_to_app_map[ext];
	if (typeof num == "number" && globals.ext_app_arr[num]) {
		return globals.ext_app_arr[num];
	}
	return "Unknown";
}//»
const get_win_by_app = which => {//«
	for (let i = 0; i < windows.length; i++) {
		if (windows[i].app == which) return windows[i];
	}
};
this.get_win_by_app = get_win_by_app;
//»
const get_win_by_path = (path, extarg, if_all) => {//«
	if (!path.match(/^\//)) {
		cerr("not a fullpath");
		return;
	}
	let ret = [];
	path = path.regpath();
	for (let w of windows) {
		let ext = w.ext;
		let gotname = (w.path + "/" + w.name).regpath();
		if (gotname === path) {
			if (extarg) {
				if (ext === extarg) ret.push(w);
			} else if (!ext) ret.push(w);
		}
	}
	if (path === desk_path) ret.push(desk);
	if (if_all) return ret;
	return ret[0];
};
this.get_win_by_path = get_win_by_path;
//»
const get_win_id=()=>{win_num++;return win_num+""}
const winon=win=>{if(win===desk)return;window_on(win);win.zup();return;}
const close_window=()=>{if(!(Desk.CWIN && Desk.CWIN.key_kill))return null;Desk.CWIN.key_kill();return true;}
const fullscreen_window = () => {//«
	if (!Desk.CWIN) return null;
	let w = Desk.CWIN;
	if (w.is_transitioning) return;
	let transend = e => {
		w.style.transition = "";
		w.main.style.transition = "";
		w.status_bar.resize();
		w.obj.onresize();
		w.removeEventListener('transitionend', transend);
		delete w.is_transitioning;
		if (w.is_fullscreen) delete w.is_fullscreen;
		else w.is_fullscreen = true;
	};
	if (w.is_layout || w.is_minimized) return;
	let mn = w.main;
	if (!Desk.automate_mode) {
		w.style.transition = "left 0.2s,top 0.2s";
		mn.style.transition = "width 0.2s,height 0.2s";
	}
	if (w.is_fullscreen) {
		w.bor = w.bor_hold;
		delete w.bor_hold;
		w.x = w.fsholdx;
		w.y = w.fsholdy;
		mn.w = w.fsholdw;
		mn.h = w.fsholdh;
	} else {
		let usepl = 0;
		let usepr = 0;
		let pl = mn.padl;
		let pr = mn.padr;
		if (pl) usepl = pi(pl);
		if (pr) usepr = pi(pr);
		w.fsholdw = w.main.w;
		w.fsholdh = w.main.h;
		w.fsholdx = w.x;
		w.fsholdy = w.y;
		w.bor_hold = w.bor;
		w.bor="";
		w.x = 0;
		if (w.no_chrome_mode) w.y=0;
		else w.y = "-" + (w.titlebar.h) + "px";
		mn.w = winw() - usepl - usepr;
		mn.h = winh(true);
	}
	w.is_transitioning = true;
	if (!Desk.automate_mode) w.addEventListener('transitionend', transend);
	else transend();
}//»
const minimize_window=()=>{if(!Desk.CWIN)return null;Desk.CWIN.minimize_button.click();};
const maximize_window=()=>{let w=Desk.CWIN;if(!w||w.is_fullscreen)return null;w.maximize_button.click();};
const toggle_window_tiling = () => {//«
	let wid = winw();
	let hgt = winh();
	let arr = [];
	let if_intersects = false;
	let has_tile_holds = false;
	const intersects = (w1, w2) => {
		let t1 = w1.t;
		let b1 = w1.b;
		let l1 = w1.l;
		let r1 = w1.r;
		let t2 = w2.t;
		let b2 = w2.b;
		let l2 = w2.l;
		let r2 = w2.r;
		if (t1 < 0 || t2 < 0) return true;
		if (b1 > hgt || b2 > hgt) return true;
		if (l1 < 0 || l2 < 0) return true;
		if (r1 > wid || r2 > wid) return true;
		if (!(l1 > r2 || r1 < l2 || t1 > b2 || b1 < t2)) {
			return true;
		}
		return false;
	};
	const intersects_any = w1 => {
		for (let w2 of arr) {
			if (w1.win === w2.win) continue;
			if (intersects(w1, w2)) return true;
		}
		return false;
	};
	for (let w of windows) {
		if (!w.is_minimized) {
			if (w.is_layout) do_toggle_win_layout(w);
			let r = w.gbcr();
			arr.push({
				win: w,
				t: r.top,
				b: r.bottom,
				l: r.left,
				r: r.right
			});
			if (w.no_chrome_mode) do_toggle_win_chrome(w);
			if (isFinite(w.tileholdw) && isFinite(w.tileholdh) && isFinite(w.tileholdx) && isFinite(w.tileholdy)) {
				has_tile_holds = true;
				w.main.w = w.tileholdw;
				w.main.h = w.tileholdh;
				w.x = w.tileholdx;
				w.y = w.tileholdy;
			} else if (w.is_tiled) has_tile_holds = true;
			w.obj.onresize();
			delete w.tileholdw;
			delete w.tileholdh;
			delete w.tileholdx;
			delete w.tileholdy;
			delete w.is_tiled;
		}
	}
	if (has_tile_holds) {
		window_boxshadow = window_boxshadow_hold;
		return;
	}
	if (!arr.length) return popup("Nothing to do!");
	if (arr.length == 1) return popup("The max button should work,\x20no?");
	OUTERLOOP1: for (let j = 0; j < arr.length; j++) {
		let w1 = arr[j];
		for (let i = j + 1; i < arr.length; i++) {
			let w2 = arr[i];
			if (intersects(w1, w2)) {
				if_intersects = true;
				break OUTERLOOP1;
			}
		}
	}
	if (if_intersects) {
		poperr("Can't do window tiling!\x20(Overlapping windows detected)");
		return;
	}
	const do_step = () => {
		for (let w of arr) {
			if (w.is_maxed) continue;
			let got_change = false;
			for (let i = 0; i < 4; i++) {
				if (i == 0) {
					if (!intersects_any({
							win: w.win,
							l: w.l - 1,
							r: w.r,
							t: w.t,
							b: w.b
						})) {
						w.l--;
						got_change = true;
					}
				} else if (i == 1) {
					if (!intersects_any({
							win: w.win,
							l: w.l,
							r: w.r + 1,
							t: w.t,
							b: w.b
						})) {
						w.r++;
						got_change = true;
					}
				} else if (i == 2) {
					if (!intersects_any({
							win: w.win,
							l: w.l,
							r: w.r,
							t: w.t - 1,
							b: w.b
						})) {
						w.t--;
						got_change = true;
					}
				} else if (i == 3) {
					if (!intersects_any({
							win: w.win,
							l: w.l,
							r: w.r,
							t: w.t,
							b: w.b + 1
						})) {
						w.b++;
						got_change = true;
					}
				}
			}
			if (!got_change) w.is_maxed = true;
		}
	};
	let n = 0;
	OUTERLOOP2: for (; n < MAX_TILING_STEPS; n++) {
		let got_all_maxed = true;
		for (let w of arr) {
			if (!w.is_maxed) {
				got_all_maxed = false;
				break;
			}
		}
		if (!got_all_maxed) do_step();
		else break OUTERLOOP2;
	}
	for (let w of arr) {
		let win = w.win;
		let r = win.gbcr();
		let main = win.main;
		let dl = TILING_OVERLAP + r.left - w.l;
		let dr = TILING_OVERLAP + w.r - r.right;
		let dt = TILING_OVERLAP + r.top - w.t;
		let db = TILING_OVERLAP + w.b - r.bottom;
		win.tileholdw = main.w;
		win.tileholdh = main.h;
		win.tileholdx = win.x;
		win.tileholdy = win.y;
		main.w += (dl + dr);
		win.x -= dl;
		main.h += (dt + db);
		win.y -= dt;
		win.is_tiled = true;
		win.style.boxShadow = "";
		if (!win.no_chrome_mode) do_toggle_win_chrome(win);
		else win.obj.onresize();
	}
	window_boxshadow_hold = window_boxshadow;
	window_boxshadow = "";
};//»
const do_toggle_win_chrome = w => {//«
	if (!w || w.is_fullscreen || w.is_maxed || w.is_minimized) return;
	w.no_chrome_mode = !w.no_chrome_mode;
	let bar = w.titlebar;
	let foot = w.footer;
	let m = w.main;
	if (w.no_chrome_mode) {
		let h = bar.gbcr().height + foot.gbcr().height;
		w.bor_hold = w.bor;
		w.bor = "";
		m.diff_h = h;
		bar.dis = "none";
		foot.dis = "none";
		m.h += h;

	} else {
		bar.dis = "block";
		foot.dis = "flex";
		w.bor = w.bor_hold;
		delete w.bor_hold;
		m.h -= m.diff_h;
	}
	w.status_bar.resize();
	w.obj.onresize();
	return true;
}//»
const toggle_win_chrome=()=>{return do_toggle_win_chrome(Desk.CWIN);}
const toggle_win_layout_mode = () => {//«
	let wins = filter_windows();
	if (!layout_mode) {
		for (let w of wins) {
			if (!w.is_layout) do_toggle_win_layout(w);
		}
	} else {
		for (let w of wins) {
			if (w.is_layout) do_toggle_win_layout(w);
		}
	}
	layout_mode = !layout_mode;
};//»
const do_toggle_win_layout = (winarg) => {//«
	let w = winarg || Desk.CWIN;
	if (!w) return;
	if (w.is_maxed || w.is_minimized) return;
	w.is_layout = !w.is_layout;
	if (w.is_layout) {
		let odiv;
		let mkhandle = (w, h, x, y) => {
			let div = make('div');
			div.bor = "1px solid black";
			div.pos = "absolute";
			div.w = w;
			div.h = h;
			if (x) div.x = 0;
			else div.r = 0;
			if (y) div.y = 0;
			else div.b = 0;
			odiv.add(div);
		};
		let dsty = document.body.style;
		let rect = w.getBoundingClientRect();
		odiv = make('div');
		let osty = odiv.style;
		let get_cursor = (e, r) => {
			let lr_pad = r.width * 0.25;
			let tb_pad = r.height * 0.25;
			let lhit = false;
			let rhit = false;
			let thit = false;
			let bhit = false;
			let ret;
			if (e.clientX < r.left + lr_pad) lhit = true;
			else if (e.clientX > r.right - lr_pad) rhit = true;
			if (e.clientY < r.top + tb_pad) thit = true;
			else if (e.clientY > r.bottom - tb_pad) bhit = true;;
			if (rhit && bhit) ret = ["nwse-resize", "se"];
			else if (lhit && thit) ret = ["nwse-resize", "nw"];
			else if (rhit && thit) ret = ["nesw-resize", "ne"];
			else if (lhit && bhit) ret = ["nesw-resize", "sw"];
			else if (rhit) ret = ["ew-resize", "e"];
			else if (lhit) ret = ["ew-resize", "w"];
			else if (thit) ret = ["ns-resize", "n"];
			else if (bhit) ret = ["ns-resize", "s"];
			else ret = ["move"];
			return ret;
		};
		odiv.pos = "absolute";
		odiv.w = rect.width;
		odiv.h = rect.height; 
		odiv.bgcol=Core.api.randCol(0.25);
//		odiv.bgcol = "rgba(0,0,0,0.25)";
		odiv.x = 0;
		odiv.y = 0;
		odiv.z = 10000000;
		odiv.class = "titlebar";
		odiv.win = w;
		odiv.onmousemove = (e) => {
			if (CDICN || CRW) return;
			osty.cursor = get_cursor(e, odiv.getBoundingClientRect())[0];
		};
		odiv.onmousedown = (e) => {
			e.stopPropagation();
			let arr = get_cursor(e, odiv.getBoundingClientRect());
			let sty = arr[0];
			osty.cursor = sty;
			if (sty == "move") {
				CDW = w;
				DDX = e.clientX - pi(w.offsetLeft);
				DDY = e.clientY - pi(w.offsetTop);
				return;
			}
			CRW = w;
			CRW.startx = e.clientX;
			CRW.starty = e.clientY;
			CRW.startw = w.main.w;
			CRW.starth = w.main.h;
			CRW.rs_dir = arr[1];
			CRW.startl = w.x;
			CRW.startt = w.y;
			if (CRW != Desk.CWIN) window_on(CRW);
		};
		odiv.onmouseup = e => {
			if (CRW && CRW.obj) CRW.obj.onresize();
			CRW = null;
			CDW = null
		};
		w.add(odiv);
		w.movediv = odiv;
		let statdiv = make('div');
		statdiv.fs = 21;
		statdiv.tcol = "#fff";
		statdiv.bgcol = "#000";
		statdiv.vcenter();
		statdiv.ta = "center";
		statdiv.marr = statdiv.marl = 20;
		odiv.update = () => {
			let r = w.gbcr();
			odiv.w = r.width;
			odiv.h = r.height;
			statdiv.innerHTML = r.width + "x" + r.height + "+" + r.left + "+" + r.top;
			statdiv.w = odiv.w - 40;
		};
		odiv.add(statdiv);
		odiv.update();
		mkhandle("100%", "25%", 1, 1);
		mkhandle("100%", "25%", 1, 0);
		mkhandle("25%", "100%", 1, 1);
		mkhandle("25%", "100%", 0, 1);
	} else {
		desk.style.cursor = "default";
		w.movediv.del();
		delete w.movediv;
		delete w.rs_dir;
	}
	return true;
}//»
const get_wins_by_path_and_ext = (patharg, ext) => {//«
	let ret = [];
	for (let i = 0; i < windows.length; i++) {
		let win = windows[i];
		if (!(win.path && win.name)) continue;
		if (win.ext != ext) continue;
		if ((win.path + "/" + win.name).regpath() == patharg.regpath()) ret.push(win);
	}
	return ret;
}//»
const filter_windows = () => {//«
	let wins = [];
	for (let i = 0; i < windows.length; i++) {
		let w = windows[i];
		if (w.killed) {
			windows.splice(i, 1);
			i--;
		} else {
			if (!(w.is_minimized)) wins.push(w);
		}
	}
	return wins;
}//»
const get_newwin_obj = (app) => {//«
	const map={
		"sys.Login":{WID:650,HGT:400, CENTER: true}
	};
	let usew = winw() - 50;
	if (usew < 0) usew = winw();
	let useh = winh() - 100;
	if (useh < 0) useh = winh();
	let obj;
	if (app) obj = map[app];
	if (!obj) {
		obj={};
		obj.X = 15;
		obj.Y = 35;
		obj.WID = usew;
		obj.HGT = useh;
	}
	return obj;
}//»
const get_window_stack = (if_all) => {//«
	if (if_all) return windows;
	let wins = filter_windows();
	return wins.sort(z_compare);
};
this.get_windows = get_window_stack;
//»

const window_cycle = ()=>{//«

	if (tilde_press) return;

	let wins = windows;
	let len = wins.length;
	if (!len) return;

	if (!num_win_cycles){
		CWIN_HOLD = Desk.CWIN;
		wins.sort((a,b)=>{
			if (pi(a.style.zIndex) > pi(b.style.zIndex)) return 1;
			else if (pi(a.style.zIndex) < pi(b.style.zIndex)) return -1;
			return 0;
		});
		CG.on(WIN_CYCLE_CG_OP);
	}

	if (CWCW){
		CWCW.z = CWCW.z_hold;
		delete CWCW.z_hold;
		window_off(CWCW);
		CWCW = null;
	}

	let w = wins[num_win_cycles%len];

/*To include a "show desktop during window cycle" behaviour, uncomment the following
/*«
let win_cycle_wins_hidden = false; // put this at the top of the file in Flags/Modes and uncomment it in dokeydown
if (!win_cycle_wins_hidden){ 
	if ((w===CWIN_HOLD) || (num_win_cycles && (!(num_win_cycles%len)))){
		if (w===CWIN_HOLD) num_win_cycles++;
		CWIN_HOLD=null;
		have_window_cycle = true;
		win_cycle_wins_hidden = true;
		toggle_show_windows();
		CG.off();
		return;
	}
}
if (win_cycle_wins_hidden){
	win_cycle_wins_hidden = false;
	toggle_show_windows();
	CG.on(WIN_CYCLE_CG_OP);
}
»*/

	CWCW = w;
	CWCW.z_hold = CWCW.z;
	CWCW.z = CGZ+1;
	window_on(CWCW,true);

	num_win_cycles++;

}//»

const check_win_visible = (win) => {//«
	let rect = win.getBoundingClientRect();
	if (!rect) return;
	if ((rect.left > winw()) || (rect.right < 0) || (rect.top > winh()) || rect.bottom < 0) {
		cwarn("WINDOW IS OFFSCREEN... moving it to 0,0!");
		win.loc(0, 0);
	}
}//»
const check_win_loc = (win) => {//«
	let r = win.gbcr();
	let w = r.width,
		h = r.height;
	let miny = 0;
	if (win.x < 0) {
		if (!win_overflow.l) win.x = 0;
		else if (win.x + w < 0) win.x += 2 * win_move_inc;
	} else if (win.x + w > winw()) {
		if (!win_overflow.r) win.x = winw() - w;
		else if (win.x > winw()) win.x -= 2 * win_move_inc;
	}
	if (win.y < miny) {
		if (!win_overflow.t) win.y = miny;
		else if (win.y + h < 0) win.y += 2 * win_move_inc;
	} else if (win.y > miny && win.y + h > winh()) {
		if (!win_overflow.b) {
			let usey = winh() - h;
			if (usey < miny) usey = miny;
			win.y = usey;
		} else if (win.y > winh()) win.y -= 2 * win_move_inc;
	}
}//»
const check_win_size = (win) => {//«
	if (!win) return;
	if (win.main.w < min_win_width) win.main.w = min_win_width;
	else if (win.x + win.clientWidth > winw()) {
		if (!win_overflow.r) win.main.w = winw() - win.x;
	}
	if (win.h < 1) win.h = 1;
	else if (win.y + win.clientHeight > winh()) {
		if (!win_overflow.b) {
			let menu_hgt = 0;
			let winfrills = win.titlebar.h + 15;
			if (win.nowindecs) winfrills = 0;
			let calc_hgt = winh() - win.y - winfrills - 3;
			if (calc_hgt < 1) calc_hgt = 1;
			win.main.h = calc_hgt;
		}
	}
}//»
const check_all_wins = () => {//«
	for (let i = 0; i < windows.length; i++) {
		let win = windows[i];
		check_win_loc(win);
		check_win_size(win);
	}
}//»
const check_move_rs_timer = (if_resize) => {//«
	if (move_rs_timer) clearTimeout(move_rs_timer);
	move_rs_timer = setTimeout(() => {
		move_rs_timer = null;
		let w = Desk.CWIN;
		if (if_resize && w && w.obj && w.obj.onresize) {
			w.status_bar.resize();
			w.obj.onresize();
		}
	}, MOVE_RS_TIMEOUT);
}//»
const move_window = (which, if_small) => {//«
	let w = Desk.CWIN;
	if (!w) return;
	if (w.is_minimized) {} else if (w.is_maxed) w.maximize_button.reset();
	let useinc;
	if (if_small) useinc = win_move_inc_small;
	else useinc = win_move_inc;
	if (which == "R") w.x = w.x + useinc;
	else if (which == "L") w.x = w.x - useinc;
	else if (which == "D") w.y = w.y + useinc;
	else if (which == "U") w.y = w.y - useinc;
	check_win_loc(w);
	if (w.overdiv) w.overdiv.loc(w.x, w.y);
	if (w.movediv) w.movediv.update();
	if (w.is_minimized) {
		w.last_min_x = w.x;
		w.last_min_y = w.y;
	}
	check_move_rs_timer();
}//»
const resize_window = (which, if_reverse, if_small) => {//«
	const w2r = () => {
		w.main.w = w.main.w - useinc;
		w.x += useinc;
	};
	const w2l = () => {
		let dx = w.x - useinc;
		if (dx < 0) useinc += dx;
		w.main.w = w.main.w + useinc;
		w.x -= useinc;
	};
	const n2d = () => {
		w.main.h = w.main.h - useinc;
		w.y += useinc;
	};
	const n2u = () => {
		let dy = w.y - useinc;
		if (dy < 0) useinc += dy;
		w.main.h = w.main.h + useinc;
		w.y -= useinc;
	};
	const e2r = () => {
		let dx = w.x + w.gbcr().width + useinc - winw();
		if (dx > 0) useinc -= dx;
		w.main.w = w.main.w + useinc;
	};
	const e2l = () => {
		w.main.w = w.main.w - useinc;
	};
	const s2d = () => {
		let dy = w.y + w.gbcr().height + useinc - winh();
		if (dy > 0) useinc -= dy;
		w.main.h = w.main.h + useinc;
	};
	const s2u = () => {
		w.main.h = w.main.h - useinc;
	};
	let w = Desk.CWIN;
	if (w.dialog) return;
	if (w.is_minimized) return;
	if (w.is_maxed) w.maximize_button.reset();
	let useinc;
	if (if_small) useinc = win_resize_inc_small;
	else useinc = win_resize_inc;
	if (if_reverse) {
		if (which == "R") e2l();
		else if (which == "L") w2r();
		else if (which == "D") s2u();
		else if (which == "U") n2d();
	} else {
		if (which == "R") e2r();
		else if (which == "L") w2l();
		else if (which == "D") s2d();
		else if (which == "U") n2u();
	}
	check_win_loc(w);
	check_win_size(w);
	check_move_rs_timer(true);
	if (w.movediv) w.movediv.update();
}//»
const top_win_on = dont_use_win => {//«
	let gothi = -1;
	let gotwin = null;
	let wins = filter_windows();
	for (let i = 0; i < wins.length; i++) {
		let w = wins[i];
		if (w.is_minimized || (dont_use_win && w === dont_use_win)) continue;
		if (w.z > gothi) {
			gothi = w.z;
			gotwin = w;
		}
	}
	if (!gotwin && dont_use_win) gotwin = dont_use_win;
	if (gotwin) window_on(gotwin);
	else {
		Desk.CWIN = null;
		CUR.todesk();
	}
}//»
const window_on = (win, if_no_zup) => {//«
//log(win);
//throw new Error("ZZZZZZZZZz");
	if (win.is_chrome || win.killed) return;
	if (!windows_showing) toggle_show_windows();
	if (Desk.CPR) return;
	if (Desk.CWIN) {
		if (win === Desk.CWIN) return;
		window_off(Desk.CWIN);
	} else {
		if (CUR.parentNode === desk) {
			desk.lastcurpos = CUR.getpos();
			CUR.off();
		}
	}
	if (!windows.includes(win)) windows.push(win);
	win.dis = "block";
	if (win.app == "sys.Explorer" && !win.is_minimized) {
		win.main.focus();
//		CUR.bor = `${CURBORWID}px solid #000`;
		CUR.icon_div = win.main.icon_div;
		CUR.main = win.main;
		win.main.add(CUR);
		CUR.set();
		CUR.on();
	}
	if (if_no_zup){}
	else if (win.z && win.z < 10000000) win.zup();

	Desk.CWIN = win;
	
	win.zhold = null;
	win.style.boxShadow = window_boxshadow;
	document.activeElement.blur();
	win.img_div.op = 0.75;
	win.namespan.fw = "bold";
	win.namespan.tcol = win.namespan["tcol.on"];
	win.bgcol = win["bgcol.on"];
	if (win.butdiv) win.butdiv.on();
	if (win.overdiv) win.overdiv.on();
	if (win.obj.onfocus&&!win.popup) win.obj.onfocus();
	if (win.is_minimized) win._button.onmousedown();
	if (Desk.CWIN.child_win) window_on(Desk.CWIN.child_win);

};
this.window_on = window_on;
//»
const window_off = (win) => {//«
	if (!win) return;
	if (win.is_chrome) return;
//	if (win.app == "sys.Explorer") win.lastcurpos = CUR.getpos();
	win.img_div.op = 0.5;
	win.namespan.fw = "";
	win.namespan.tcol = win.namespan["tcol.off"];
	win.bgcol = win["bgcol.off"];
	if (win.butdiv) win.butdiv.off();
	if (win.overdiv) win.overdiv.off();
	if (win.area) {
		win.area.selectionEnd = win.area.selectionStart;
		win.area.blur();
	}
	win.style.boxShadow = "";
	if (win.obj && win.obj.onblur) win.obj.onblur();
	if (win == Desk.CWIN) Desk.CWIN = null;
	desk.area.focus();
	if (win.is_minimized) {
		win._button.onmouseup();
		win.dis="none";
	}
};
this.window_off = window_off;
//»
const set_window_name_of_icon=(icon,name)=>{let win=icon.win;if(win){win.namespan.html(" "+name);win.name=name;if(win.min_icon)win.min_icon.name=name;}}
this.get_wins_by_path=(path,extarg)=>{return get_win_by_path(path,extarg,true)}

//»
//Icons«
this.set_icons=arg=>{
ICONS=arg;
};
const select_first_visible_folder_icon=(win)=>{//«
	if (!(win.main)) return;
	let r = win.main.getBoundingClientRect();
	let x = r.left+folder_grid_start_x+IGSX/2;
	let y = r.top+folder_grid_start_y;
	let el = document.elementsFromPoint(x,y+0.75*IGSY)[0];
	if(!(el && el.icon)) el = document.elementsFromPoint(x,y+0.5*IGSY)[0];
	if(!(el && el.icon)) el = document.elementsFromPoint(x,y+0.25*IGSY)[0];
	if(!(el && el.icon)) {
		return;
	}
	let icn;
	if (el.className=="icon") icn = el;
	else icn = el.icon;
	if (NUM(icn.col)&&NUM(icn.row)) CUR.setpos(icn.col, icn.row, icn);
	else CUR.setpos(0,0,icn);
};//»
const remove_icon_from_icons=icn=>{let pos=ICONS.indexOf(icn);if(pos>-1){ICONS.splice(pos,1);icon_off(icn);}};
const make_icon = arg => {//«
	const get_icon_id = () => {
		icon_num++;
		return "icon_"+icon_num + "";
	};
	let icon = make("div");
	icon.save=()=>{
		if (icon.parwin!==desk) return;
		localStorage[icon.fullpath()]=`${icon.col} ${icon.row}`;
	};
	Object.defineProperty(icon,"path",{get:function(){return this.parwin.fullpath();}});
	Object.defineProperty(icon, "fullname", {
		get: function() {
			let name = this.name;
			if (this.ext) name = name + "." + this.ext;
			return name;
		}
	});

	let id = get_icon_id();
	icon.z=1;
	icon.id = id;
	icon.op = 0;
	icon.over="hidden";
	icon.style.maxHeight = 88;
//	icon.h="96px";
//	icon.w="100px";
	icon.style.transition = `opacity 0.${ICON_OP_MS}s`;
	icon._self = icon;
	let imgdiv = make("div");
	imgdiv.id = "imgdiv_"+id;
	imgdiv.pos = "relative";
	let obj = {};
	let app = arg.APP;
	if (!app) {
		if (arg.EXT) {
			app = ext_to_app(arg.EXT);
			icon.ext = arg.EXT;
		} else app = DEF_BIN_OPENER;
	} else if (app == "Link") {
		if (arg.EXT) {
//			cwarn("Make_icon():\x20have link,we have an extension too! " + arg.EXT);
		}
	}
	icon.className = "icon";
	icon.style.perspective = "1000px";
	icon.style.backfaceVisibility = "hidden";
	icon.shake = () => {
		icon.style.animation = "shake 0.82s cubic-bezier(.36,.07,.19,.97)\x20both";
		icon.addEventListener("animationend", () => {
			icon.style.animation = "";
		});
	};
	icon.app = app;
	icon.type = "icon";
	icon.style.textAlign = "center";
//	icon.pos = "absolute";
	icon.padb=5;
	let name;
	if (icon.app == "appicon") name = arg.LABEL;
	else name = arg.APP;
	let iconobj = {
		PAR: imgdiv
	};
	let opts = {};
	iconobj.TYPE = "appicon";
	iconobj.APP = app;
	iconobj.EXT = arg.EXT;
	let tit = app.split(".").pop();
	if (arg.EXT) tit += "\xa0(" + arg.EXT + ")";
	icon.title = tit;
	if (app == "sys.Explorer" && arg.LABEL == "Applications") opts.APPFOLDER = true;
//	if (arg.LINK) opts.LINK = arg.LINK;
	iconobj.OPTS = opts;
	imgdiv.icon = icon;
	igen.attach(iconobj);
	imgdiv.img.icon=icon;
	imgdiv.bor = "2px solid transparent";
//	imgdiv.marl = "auto";
//	imgdiv.marr = "auto";
	imgdiv.marl=4;
	imgdiv.padl = 5;
	imgdiv.padr = 5;
	imgdiv.marb = 4;
	imgdiv.padt = 2;
	imgdiv.padb = 4;
	let wrapper = imgdiv.wrapper;
	icon.wrapper=wrapper;
	wrapper.icon=icon;
	wrapper.id="wrapper_"+id;
	let label_div = make("div");
	label_div.w = 92;
	let label = make_icon_label(arg.LABEL);
	label.mart=3;
	label_div.style.maxHeight="17px";
	label.id = "label_"+id;
	label.div.id = "labeldiv_"+id;
	label.div.icon = icon;
	label.icon = icon;
	label_div.add(label);
	icon.add(imgdiv);
	icon.add(label_div);
	icon.name = arg.NAME;
	icon.imgdiv = imgdiv;
	icon.icon = wrapper.childNodes[0];
	icon.label_div = label_div;
	icon.label = label;
	label.marl=4;
	icon.roottype = arg.ROOTTYPE;
	no_select(icon);
//	icon_styler(icon);
	icon.label.bgcol = icon.label["bgcol.off"];
	label_font_color(icon, icon.label["tcol.off"]);

	icon.add_link = if_broken => {//«
		let link_str = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128"><g style="opacity:1;" transform="translate(0 0)"><rect style="fill:#fff;stroke:#000;stroke-width:3.5;" x="68" y="68" height="60" width="60" /><g style="fill:none;stroke:#000;stroke-width:3.234;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="134.24921" y="-51.794231" transform="matrix(0.36548997,0.93081528,-0.93081528,0.36548997,0,0)" /><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="143.13367" y="-16.949551" transform="matrix(0.6743771,0.73838711,-0.73838711,0.6743771,0,0)" /><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="137.76695" y="21.29994" transform="matrix(0.90331408,0.42897981,-0.42897981,0.90331408,0,0)" /></g></g>';
		let broken_str = '<g style="fill:none;stroke:red;stroke-width:8px"><path d="M 128,128 70,78" /></g>';
		if (if_broken) link_str += broken_str;
		link_str += "</svg>";
		let img = util.make('img');
		img.icon = icon;
		let link_div = make('div');
		wrapper.add(link_div);
		link_div.add(img);
		link_div.pos = "absolute";
		link_div.x = imgdiv.img.offsetLeft;
		link_div.y = 0;
		img.src = 'data:image/svg+xml;base64,' + btoa(link_str);
		img.style.maxWidth = ICON_DIM;
	};//»
	icon.add_sys=()=>{//«
		let sysdiv = mkdv();
		sysdiv.innerHTML="\u2699";
		sysdiv.fs=0.5*ICON_DIM;
		sysdiv.pos="absolute";
		sysdiv.bgcol="#000";
		sysdiv.bgcol="rgba(0,0,0,0.75)";
		wrapper.add(sysdiv);
		center(sysdiv,wrapper);
	};//»
	wrapper.draggable=true;
	wrapper.ondragstart = e => {//«
		e.preventDefault();
		e.stopPropagation();
		let par = icon.parentNode;
		CDICN = icon;
		CDL = make_cur_drag_img();
		if (par !== desk) par = par.parentNode; /*Sad but true(for now):origins are always the mainwin,NOT topwin OR icon_div*/
		desk.style.cursor = "grabbing";
		CDL.loc(e.clientX + CDL_OFFSET - winw(), e.clientY + CDL_OFFSET - winy());
		desk.add(CDL);
	};//»
	wrapper.onmousedown = e => {//«
		e.stopPropagation();
		if (e.button != 0) return;
		let par = icon.parwin;
		if (par === desk) {
			window_off(Desk.CWIN);
			desk.area.focus();
		}
		else window_on(par);
		if (e.ctrlKey&&ICONS.includes(icon)) icon_off(icon,true);
		else if (!ICONS.includes(icon)) {
			if (!e.ctrlKey) icon_array_off();
			icon_on(icon,true);
		}
	};//»
	wrapper.onclick = e => {//«
		e.stopPropagation();
	};//»
	wrapper.oncontextmenu = e => {//«
		if (!e.isFake) nopropdef(e);
		if (have_window_cycle) return;
		deskcontext({
			x: e.clientX,
			y: e.clientY
		}, {
			items: ["Rename", () => {
				setTimeout(() => {
					init_icon_editing(icon);
				}, 25);
			}, "Delete", () => {
				delete_icons(icon);
			}]
		});
	};//»
	wrapper.ondblclick = e => {//«
		e.stopPropagation();
		icon.dblclick = true;
		icon_dblclick(icon, e);
	};//»
	if (icon.app == "sys.Explorer") {//«
		let didleave;
		let isopen = false;
		let in_transit = false;
		let not_allowed = false;
		let on = () => {//«
			isopen = true;
			wrapper.style.cursor = "copy";
			if (!CDL) return;
			CDL.into(icon.name); /*icon.style.boxShadow="0px 0px 20px 7px #5f5";*/
		};//»
		let off = () => {//«
			if (in_transit) return;
			not_allowed=false;
			isopen = false;
			icon.style.cursor = "";
			wrapper.style.cursor="";
			if (!CDL) return;
			CDL.reset();
		};//»
		wrapper.onmouseover = e => {//«
			e.stopPropagation();
			if (!CDICN) return;
			if (CDICN === icon) return;
			if ((CDICN.path === icon.fullpath(true)) || (check_if_newpath_is_in_itself(CDICN.fullpath(), icon.fullpath(true) + "/" + CDICN.name))) {
				not_allowed = true;
			}
			didleave = false;
			if (!CDICN) return;
			if (not_allowed) CDL.nogo(wrapper);
			else if (!didleave) on();
		};//»
		wrapper.onmouseout = e => {//«
			off();
			if (CDICN === icon) return;
			e.stopPropagation();
			if (!CDICN) return;
			didleave = true;
		};//»
		wrapper.onmouseup = e => {//«
			e.stopPropagation();
			if (CDICN) {
				remove_icon_from_icons(icon);
				if (!ICONS.length) return;
				desk.style.cursor = "";
				if (not_allowed) {
					if (IA.length) {
						for (let icn of IA) icn.shake();
					} else CDICN.shake();
				}
				if (!isopen) {
					CDICN = null;
					off();
					cldragimg();
					return;
				}
				let r = icon.gbcr();
				in_transit = true;
				move_icons(icon.fullpath(), rv => {
					in_transit = false;
					off();
					if (Desk.CWIN) window_off(Desk.CWIN);
					if (icon.parwin !== desk) window_on(icon.parwin);
//					icon_on(icon);
					CDICN = null;
					cldragimg();
for (let icn of ICONS) icon_off(icn);
ICONS=[];
if (icon.win) icon.win.obj.reload();
				}, null, null, {
					x: r.left,
					y: r.top
				});
				return;
			}
			if (DDIE) {
				DDIE = null;
				DDD.loc(-1, -1);
				DDD.w = 0;
				DDD.h = 0;
			}
			if (icon.parwin === desk) return;
			icon.parwin.main.clear_drag();
		};//»
	}//»

	return icon;
};//»

const move_icon = (icon, want_x, want_y, opts={}) => {//«
//const move_icon = (icon, want_x, want_y, scale_fac, if_fade_out) => {
let scale_fac = opts.scale;
let if_fade_out = opts.fade;
let cb = opts.cb;
if (!cb) cb=()=>{};
	return new Promise((res, rej) => {
		const transend = e => {
			icon.style.transition = "";
			icon.style.transform = "";
			icon.loc(want_x, want_y);
			icon.z = ICON_Z;
			if (if_fade_out) {
				setTimeout(() => {
					icon.op = 1;
				}, 100);
			}
			res();
			delete icon.ontransitionend;
			cb();
		};
		if (Desk.automate_mode) return transend();
		let fromx = pi(icon.style.left);
		let fromy = pi(icon.style.top);
		let diffx = want_x - fromx;
		let diffy = want_y - fromy;
		let d = Math.sqrt(Math.pow(diffx, 2) + Math.pow(diffy, 2));
		let factor = ICON_MOVE_FACTOR;
		let time = d * 1 / factor;
		if (time > 0.5) time = 0.5;
		else if (time < 0.15) time = 0.15;
		icon.style.transform = "";
		let str = `transform ${time}s ease 0s`;
		if (if_fade_out) str += `,opacity ${time}s ease 0s`;
		icon.style.transition = str;
		requestAnimationFrame(() => {
			icon.ontransitionend=transend;
			let str = `translate(${diffx}px,${diffy}px)`;
			if (NUM(scale_fac)) str += ` scale(${scale_fac})`;
			icon.z = CGZ - 1;
			if (if_fade_out) icon.op = 0.5;
			icon.style.transform = str;
		});
	});
};
//»
const move_icons = async (destpath, cb, e, usewin, loc) => {//«
	let didnum=0;
	const do_end=()=>{//«
		if (usewin) {
			if (usewin === desk) {
				for (let icn of ICONS) icn.parwin = desk;
			}
			else {
				for (let i = 0; i < ICONS.length; i++) {
					let icn = ICONS[i];
					icn.parwin = usewin;
				}
				let wins = get_win_by_path(usewin.fullpath(), null, true);
				for (let w of wins) w.obj.update(didnum);
			}
		}
		else {
			for (let icn of del_icons) icn.del();
			let wins = get_win_by_path(destpath, null, true);
			for (let w of wins) w.obj.update();
		}

		if (origwin && origwin.app == "sys.Explorer") {
			let wins = get_win_by_path(origwin.fullpath(), null, true);
			for (let w of wins) {
				if (do_copy) w.obj.reload();
				else w.obj.update(-didnum);
			}
		}
		icon_array_off();
		if (cb) cb(true);
	};//»
	if (loc){
		if(!(dev_env&&dev_mode)) return;
	}
	let do_copy = false;
	let paths = [];
	let good = [];
	if (e && destpath === desk_path) usewin = desk;
	for (let icn of ICONS) {
		icon_off(icn);
		let usename = icn.name;
		if (icn.ext) usename += "." + icn.ext;
		if (await pathToNode(destpath + "/" + usename)) {
			icn.shake();
			continue;
		}
		if (icn.path === destpath) {
			if (icn.parwin === desk && usewin == desk) {} else icn.shake();
			continue;
		}
		let fullpath = icn.fullpath();
		if (check_if_newpath_is_in_itself(fullpath, destpath + "/" + usename)) {
			icn.shake();
			continue;
		}
		paths.push(fullpath);
		good.push(icn);
	}
	if (!paths.length) {
		let icons = ICONS.slice();
		ICONS=[];
		for (let icn of icons) icon_on(icn, true);
		if (cb) cb(false);
		return;
	} /*Fake parser.shell_exports object for fs.com_mv:serr cbok werr wclerr path2obj cwd is_root term.kill_register get_var_str*/

	ICONS=good;
	didnum = ICONS.length;

	let shell_exports = {//«
		dsk:DSK,
		cbok: do_end,
		serr: arg => {
			cerr(arg);
			if (cb) cb();
		},
		werr: s => {
			cerr("[ERR] " + s);
		},
		cberr: () =>{
			poperr("There was a problem moving the icon(s)!");
			if (cb) cb();
		},
		wclerr: log,
		cwd: "/",
		path_to_obj: (str, cb, if_getlink) => {
			path_to_obj(str, cb, false, if_getlink);
		},
		is_root: false,
		termobj: {
			kill_register: func => {
				cwarn("Got kill_register call");
			},
			kill_unregister: func => {
				cwarn("Got kill_unregister call");
			}
		},
		get_var_str: () => {
			return null;
		}
	};//»

	paths.push(destpath);
	let icon_obj = {};
	for (let icn of ICONS) {
		icon_obj[icn.fullpath()] = icn;
	}
/*
If this is from "local" and to "to", then it is a copy operation!
*/
///*TODO When things get working again, put this back in...
	let dest = await fsapi.pathToNode(destpath);
	if (dest.root.TYPE=="fs"){
		let orig = await fsapi.pathToNode(ICONS[0].fullpath());
		if (orig && orig.root && orig.root.TYPE=="local"){
			do_copy = true;
		}
	}
//*/

	if (do_copy){//«
		let NEWICNS=[];
		let newpaths = [];
		for (let icn of ICONS){
			if (icn.app!="sys.Explorer") {
				NEWICNS.push(icn);
				newpaths.push(icn.fullpath());
			}
			else{
cwarn("Skipping icn.app=='sys.Explorer'", icn.fullpath());
			}
		}
		paths = newpaths;
		if (!paths.length){
			if (cb) cb();
//			CG.off();
			return;
		}
		paths.push(destpath);
		ICONS = NEWICNS;
		icon_obj = {};
		for (let icn of ICONS) icon_obj[icn.fullpath()] = icn;
	}//»

	let origwin = ICONS[0].parwin;
	let real_locs = [];
	let del_icons = [];
	let proms = [];
	for (let icn of ICONS) {
if (icn.move_cb) {
icn.move_cb();
}
		icn.op=0.5;
		icn.disabled = true;
		icn.pos="absolute";
		let r = icn.gbcr();
		let scrdiff=0;
		if (icn.parwin!==desk) {
			let mn = icn.parwin.main;
			if (mn.scrollTop > 0) scrdiff = mn.scrollTop + r.height;
		}
		if (loc) { /*Onto a folder icon's dropzone*/
			vacate_icon_slot(icn);
			icn.loc(r.left, r.top+scrdiff);
			desk.add(icn);
			move_icon(icn, loc.x-winx(), loc.y-winy(), {scale:0.25, fade:true, cb:()=>{icn.del();}});
		} else if (usewin == desk) { /*Onto the desktop:get location from 'e',passed into the desktop's ondrop event handler*/
			icn.loc(r.left, r.top+scrdiff);
			desk.add(icn);
			place_in_icon_slot(desk,icn,{X:e.clientX-winx(),Y:e.clientY-winy()});
		}
		else { /*Onto a folder main window,from the desktop or another folder. The folder automatically places it*/
			const movecb=()=>{
				let name = icn.name;
				let ext = icn.ext;
				if (ext) name += `.${ext}`;
				let icns = Array.from(usewin.icon_div.children);
				for (let ic of icns){
					let ext = ic.ext;
					let nm = ic.name;
					if (ext) nm += `.${ext}`;
					if (nm==name){
						icn.del();
						return;
					}
				}
				icn.style.transform = "";
				icn.style.transition = "";
				icn.pos="";
				usewin.icon_div.add(icn);
			};
			vacate_icon_slot(icn);
			if (icn.parwin !== desk) {
				icn.loc(r.left, r.top+scrdiff);
				desk.add(icn);
			} /*Lesson learned:isFinite(null)==true but Number.isFinite(null)==false*/
			let icons=Array.from(usewin.getElementsByClassName("icon"));
			usewin.main.scrollTop = usewin.main.scrollHeight;
			let last = icons.pop();
			let wr;
			if (last) {
				wr = last.gbcr();
				let fake = mkdv();fake.op=0;fake.dims(100,100);
				usewin.icon_div.add(fake);
				let r2 = fake.gbcr();
				fake.del();
				move_icon(icn, r2.left, r2.top, {cb:movecb});
			}
			else {
				wr = usewin.gbcr();
				move_icon(icn, wr.left, wr.top+usewin.titlebar.clientHeight, {cb:movecb});
			}
		}
	}
	fs.com_mv(shell_exports, paths, do_copy, {
		WIN: usewin,
		ICONS: icon_obj
	});
};//»

const IGen=function(){//«

const ICONS={//«
Explorer:"\u{1f5c2}",
Synth:"\u{1f39b}",
XSynth:"\u{1f39a}",
Arcade:"\u{1f579}",
Unzip:"\u{1f5dc}",
BinView:"\u{1f51f}",
TextView:["\u{1f4dd}",100,76],
Mail:"\u{1f4ec}",
Help:"\u{26a1}",
About:"\u{1f4ca}",
Login:"\u{1f464}",
Forum:"\u{1f5e3}",
Hello:"\u{1f64b}",
MediaPlayer:"\u{1f3a6}",
HelloWorld:"\u{270b}",
ImageView:"\u{1f304}"
}//»

/*«
<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128">
</svg>
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128"></svg>',
const ICONS={
Explorer:"🔍",
Settings: ["\u2699",100,64],
Help:["\u2753",100,64],
Recorder:"🎤",
MicPlayer:"📢",
DerbyCar:["🚗",80,64,115],
Volume:"🎛",
Toolbox:"🔨",
Launcher:"🚀",
Clock:"🕰",
Iconator:"🖼",
Breaker:"💥",
Mario:"\u{1f9d9}",
Background:"🌌",
CrazyTalk:"👅",
Face:"\u{1f9d1}",

StartButton:"\u{1f518}",
ImagePaste:"\u{1f4cb}",
VoxFX:"🎚"
};»*/
//Used to create another image of the open folder that was turned on while the icon was being hovered//«
//let fold_open = '<path style="fill:#bcbda7;fill-opacity:1;stroke:#636555;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"  d="m 4.3140235,38.796086 -3.5336837,-11.938809 17.5291782,0 1.655381,-2.207175 31.602731,0 -3.210436,14.246311 z" />';
//»

const make_rect = col =>{return `<rect width="128" height="128" x="0" y="0" style="fill:${col};" />`;};
const make_text = col =>{return `<text text-anchor="middle" x="64" y="87.34375" xml:space="preserve" style="font-size:72px;font-weight:bold;line-height:125%;letter-spacing:0px;word-spacing:0px;fill:${col};stroke:#fff;font-family:Times New Roman;"><tspan y="87.34375">`;};

let fold_back = '<g transform="matrix(2.4716489,0,0,2.4716489,-0.69290156,15.625899)"><path style="fill:#868876;fill-opacity:1;stroke:#636555;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 4.315197,0.7879925 0,37.8986865 43.902439,0 0,-33.5834895 -22.326454,0 -3.752345,-3.7523452 z" />';
let fold_closed = '<path style="fill:#c0c1ac;fill-opacity:1;stroke:#636555;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 4.3626238,38.700495 0,-25.278499 12.5731272,0 4.759317,-4.759317 26.392576,0 0,29.853898 z" />';
let folder_str = fold_back+fold_closed+"</g>";

let svg_open = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128">';
let rect_beg = '<rect style="fill:';
let rect_end = '" width="128" height="128" x="0" y="0" />';
let link_g = '<g style="opacity:1;"><rect style="fill:#fff;stroke:none;" x="68" y="68" height="60" width="60" /><g style="fill:none;stroke:#000;stroke-width:3.234;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="134.24921" y="-51.794231" transform="matrix(0.36548997,0.93081528,-0.93081528,0.36548997,0,0)" /><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="143.13367" y="-16.949551" transform="matrix(0.6743771,0.73838711,-0.73838711,0.6743771,0,0)" /><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="137.76695" y="21.29994" transform="matrix(0.90331408,0.42897981,-0.42897981,0.90331408,0,0)" /></g></g>';
let link_x = '<g style="fill:none;stroke:red;stroke-width: 8px"><path d="M 128,128 70,78"></g>'
let svg_close = '</svg>';

let black_rect = make_rect("#000");
let white_rect = make_rect("#e7e7e7");
let blue_rect = make_rect("#55f");
let red_rect = make_rect("#b33");


const appmap = {
	Unknown: white_rect,
	Link: white_rect,
	BrokenLink: white_rect,
	LinkObject: red_rect,
	www: blue_rect,
	Terminal:'<rect width="122.74" height="108.39" rx="12.5" ry="12.515" x="2.52" y="13.85" style="color:#000;fill:#777;stroke:#636555;stroke-width:0.8;" /><rect width="122.74" height="108.39" rx="12.5" ry="12.5" x="2.52" y="13.85" style="color:#000;fill:#777;stroke:#636555;stroke-width:0.807;" /><rect width="90.62" height="80.029" rx="9.24" ry="9.24" x="19.4" y="28.43" style="color:#000;fill:#000;fill-opacity:1;stroke:#141414;stroke-width:1.84;" /><rect width="90.63" height="80" rx="9.24" ry="9.24" x="19.4" y="28.43" style="color:#000;fill:black;stroke:#141414;stroke-width:1.84;" /><text x="29.6" y="53" xml:space="preserve" style="font-size:24px;font-weight:bold;text-align:start;line-height:125%;letter-spacing:0px;text-anchor:start;fill:#ddd;fill-opacity:1;stroke:none;font-family:Monospace;"><tspan x="29.629631" y="53">$_</tspan></text>',
//	BinView:'<rect width="128" height="128" x="0"  y="0" style="color:#000;fill:#000;stroke:#aaa;stroke-width:4;" /><g style="font-size:36px;font-weight:bold;line-height:100%;letter-spacing:0px;word-spacing:0px;fill:#f0f0f0;stroke:#fff;font-family:monospace;"><text text-anchor="middle" x="64" xml:space="preserve"><tspan y="35">0100</tspan></text><text text-anchor="middle" x="64" y="75" xml:space="preserve"><tspan y="75">1001</tspan></text><text text-anchor="middle" x="64" y="120" xml:space="preserve"><tspan y="120">1011</tspan></text></g>',
//	Explorer: folder_str,
	Folder: folder_str
};

const make_appicon_str=(appname, extarg, opts={})=>{//«
	let testlet;
	let testlet_col = opts.TCOL||"black";
	let testlet_op = 1;
	let testlet_x = 64;
	let testlet_y = 100;
	let testlet_sz = 100;
	let marr;
	let subtle_let = false;
	let gotstr, pathstr;
	let icn = ICONS[appname];
	let str = svg_open;

	if (icn) {//«
		if (isarr(icn)) {
			testlet = icn[0];
			if (icn[1]) {
				testlet_y = icn[1];
				if (icn[2]) {
					testlet_x = icn[2];
					if (icn[3]) {
						testlet_sz = icn[3];
					}
				}
			}
		} 
		else if (isobj(icn)&&isstr(icn.sym)){
			testlet = icn.sym;
			if (icn.col)testlet_col=icn.col;
			if (icn.sz) testlet_sz=icn.sz;
		}
		else {
			if (appname === "Unzip") {
				str += `<rect width="96" height="116" x="16"  y="6" rx="8" ry="8" style="color:#000;fill:#e3e3e3;"/>`;
				testlet_sz = 80;
				testlet_y = 90;
			}
			testlet = icn;
		}
		return `${str}<text text-anchor="middle" x="${testlet_x}" xml:space="preserve" style="fill-opacity:${testlet_op};fill:${testlet_col};font-size:${testlet_sz}px;"><tspan y="${testlet_y}">${testlet}</tspan></text></svg>`;
	}//»

	if (appname == "Unknown") testlet = "?";
	else if (appname == "LinkObject" || appname == "www") {//«
		testlet_sz = 50;
		if (appname == "www") {
			testlet = "www";
			testlet_y = 50;
			testlet_col = "#ff5";
		} else {
			testlet = "Link";
			testlet_y = 80;
			testlet_col = "#ccf";
		}
	}//»
	pathstr = appmap[appname];
	let arr = appname.split(".");
	let name = arr.pop();
	if (!pathstr) {
		let open = (opts.BGCOL&&make_rect(opts.BGCOL)||black_rect) + make_text(opts.TCOL||"#CC0");
		if (testlet) pathstr=`${open}</tspan></text>`;
		else pathstr = `${open}${opts.LETS||name.slice(0, 2)}</tspan></text>`;
	}
	str += pathstr;
	if (testlet) {
		str += `<text text-anchor="middle" x="${testlet_x}" xml:space="preserve" style="font-size:${testlet_sz}px;font-style:normal;font-weight:bold;line-height:125%;letter-spacing:0px;word-spacing:0px;fill:${testlet_col};fill-opacity:${testlet_op};stroke:#fff;stroke-width:0px;"><tspan y="${testlet_y}">${testlet}</tspan></text>`;
	}
	str += '</svg>';

	return str;

};//»

this.attach = (obj, cb)=>{//«
	let appname = obj.APP.split(".").pop();
	let par = obj.PAR;
	let icn = par.icon;
	let wrapper;
	if (icn&&icn.wrapper) wrapper = icn.wrapper;
	else wrapper=mksp();
	wrapper.bor="1px dotted #aaa";
	wrapper.dis="inline-block";
	wrapper.pos="relative";
	return new Promise((Y,N)=>{
		let loadcb = ()=>{
			if (par.onload) par.onload();
			if (cb) cb();
			if (icn){
				icn.op=1;
//				icn.marl = (IGSX - icn.clientWidth)/2;
			}
			Y();
		};
		const geturl = str => {
			return URL.createObjectURL(new Blob([str], {
				type: "image/svg+xml;charset=utf-8"
			}));
		}
		const make_str = () => {
			img.onload = loadcb;
			let ret = make_appicon_str(appname, obj.EXT, obj.OPTS);
			img.src = geturl(ret);
		};
		let which_fs = globals.use_fs_type || globals.fs_type;

		let img = new Image();
		if (par.icon) img.id = "img_"+par.icon.id;
		img.style.maxWidth=ICON_DIM;
		par.add(wrapper);
		wrapper.add(img);
		par.img = img;
		par.wrapper = wrapper;
		img.wrapper = wrapper;
		make_str();
	});
}//»

}
const igen = new IGen();
Desk.iconGen=igen;
//»

const icon_dblclick = (icon, e, win_cb) => {//«
	if (icon.disabled) return;
//	if (icon.app=="sys.Explorer" && e) return;
	icon.ready={};
	icon.ready.state="Triggered";
	if (!windows_showing) toggle_show_windows();
	icon_off(icon, true);
	let win;
	let try_force_open = false;
	if (e && e.ctrlKey) try_force_open = true;
	icon.ready.state="Seeking file";
	let app=icon.app;
	if (!icon.win || try_force_open) {
		if (app == "Folder"|| app=="sys.Explorer") {
			win = open_new_window(icon);
			winon(win);
/*«
			path_to_obj(path, obj => {
				if (!obj) {
					rm_icon(icon);
					icon.ready.error="Folder does not exist:\x20"+path;
					poperr("The folder doesn't exist removing the icon:\x20"+path);
					return;
				}
				if (!obj.done) {
					let typ = obj.root.TYPE;
					if (typ=='fs'){
//						win = open_new_window(icon);
						populate_fs_dirobj(path, ret => {
							obj.done = true;
							if (win_cb) {
								win = open_new_window(icon,null,{hidden: true});
								win_cb(win);
							}
							else {
								win = open_new_window(icon);
								winon(win);
							}
						}, obj);
					}
					else if (typ=='local'){
						populate_rem_dirobj(path, ()=>{
							obj.done = true;
							win = open_new_window(icon);
							winon(win);
						}, obj, {LOCAL:true});
					}
					else{
						poperr(`Not (currently) handling type: ${typ}`);
						return;
					}
				} else {
					if (win_cb) {
						win = open_new_window(icon,null,{hidden: true});
						win_cb(win);
					}
					else {
						win = open_new_window(icon);
						winon(win);
					}
//					win = open_new_window(icon);
//					winon(win);
				}
			});
»*/
		}
		else if (app == "FIFO") WDG.popup("Sorry,you cannot open FIFO's!");
		else {
			let fullpath = (icon.path + "/" + icon.name).regpath();
			let gotext = icon.ext;
			let link = icon.link;
			let doopen = () => {//«
				path_to_obj(icon.path, parobj => {
					const noopen = (mess) => {
						icon.ready.error = "File not found";
						let str = "The file could not be opened:&nbsp;" + fullpath;
						if (mess) str += "<br><br>Additional message:&nbsp;" + mess;
						poperr(str);
					};
					if (gotext) fullpath = fullpath + "." + gotext;
					let roottype = parobj.root.TYPE;
					if (roottype == "fs") {
if (MEDIAPLAYER_EXTENSIONS.includes(gotext)){
open_app("media.MediaPlayer", null, false, null, {file: fullpath});
return;
}
						fs.get_fs_data(fullpath, (ret, mess) => {
							if (!ret) return noopen(mess);
							icon.ready.state = "File loaded";
							open_icon_app(icon, ret, gotext, null, try_force_open);
						},null,null,DSK);
					}
					else if (roottype == "remote") {
						fs.get_rem_file(fullpath, async ret => {
							if (!ret) return noopen();
							icon.ready.state = "File loaded";
							open_icon_app(icon, ret, gotext, null, try_force_open);
						},{ASBYTES:true});
					}
					else if (roottype == "local") {
						try{
							let name = icon.name;
							if (icon.ext) name = `${name}.${icon.ext}`;
							let sz = parobj.KIDS[name].SZ;
							if (!Number.isFinite(sz)) return poperr("The size of the file could not be determined");
							if (sz > MAX_FILE_SIZE) return poperr(`The size of the file is > MAX_FILE_SIZE (${MAX_FILE_SIZE})`);
						}
						catch(e){
console.error(e);
							return noopen();
						}
//						Core.xget(fullpath.replace(/^\/loc/,"/local"),(ret)=>{
						Core.xget(Core.loc_url(fullpath)+"&range=0-end",(ret)=>{
							if (!ret) return noopen();
							icon.ready.state = "File loaded";
							open_icon_app(icon, ret, gotext, null, try_force_open);
						},
						null,
						null,
						(rv)=>{
						});
					}
					else {
						icon.ready.error = "Cannot open filesystem type:\x20"+roottype;
						poperr("Cannot open type:\x20" + roottype);
					}
				});
			};//»
			doopen();
/*«
			if (link) {
				let usepath;
				let marr;
				if (link.match(/^\//)) usepath = link;
				else usepath = icon.path + "/" + link;
				icon.ready.state="Dereferencing link";
				path_to_obj(usepath, obj => {
					let gotwin = get_win_by_path(usepath);
					if (gotwin && gotwin !== desk && !try_force_open) return winon(gotwin);
					if (obj && obj.APP == "sys.Explorer") return open_folder_win(obj.NAME, fs.get_path_of_obj(obj.par), icon);
					if (!obj) {
						icon.ready.error = "Broken link:\x20" + usepath;
						return poperr(`${usepath}:\x20Not found`,{title:"Broken Link!"});
					}
					let arr = fullpath_to_path_and_ext(usepath);
					fullpath = arr[0];
					gotext = arr[1];
					doopen();
				});
			}
			else doopen();
»*/
		}
	} else {
		if (icon.win.is_minimized) {
			if (icon.win.parentNode === desk) {
				icon.ready.state="Unminimizing";
				icon.win.unminimize();
			}
			else{
				icon.ready.error="Cannot find the minimized window";
				cerr("Where is the minimized window?");
			}
		}
		else {
			winon(icon.win);
			icon.ready.state=true;
		}
	}
}//»
const cldragimg=if_hard=>{if(if_hard){let arr=desk.getElementsByClassName("dragimg");for(let d of arr)d.del();}else CDL&&CDL.del();CDL=null;};
const make_cur_drag_img = () => {//«
	let d = mkdv();
	d.className = "dragimg";
	let s = mksp();
	d.pos = "absolute";
	d.z = CGZ - 1;
	ICONS = ICONS.uniq();
	let numarg = ICONS.length || 1;
	let base_str = '<b>' + numarg + '</b>\xa0items\xa0\u2ba9\xa0';
	d.into = name => {
		s.innerHTML = base_str + '"<b><i>' + name + '</i></b>"';
		d.op = 1;
		d.bor = "2px ridge #0f0";
	};
	d.reset = () => {
		s.innerHTML = base_str + "...";
		d.op = DRAG_IMG_OP;
		d.bor = "2px ridge #999";
	};
	d.nogo = elm => {
		elm.style.cursor = "not-allowed";
		d.bor = "2px ridge #f00";
	};
	d.padl = 10;
	d.padt = d.padb = d.padr = 5;
	d.bgcol = "#fff";
	d.tcol = "#000";
	d.fs = "16px";
	d.reset();
	d.add(s);
	return d;
};//»
const get_icons_by_path = (patharg, extarg) => {//«
	let arr = desk.getElementsByClassName("icon");
	let ret = [];
	patharg = patharg.regpath();
	for (let icn of arr) {
		let ext = icn.ext;
		let namepath = (icn.path + "/" + icn.name).regpath();
		if (namepath == patharg) {
			if (extarg) {
				if (ext === extarg) ret.push(icn);
			} else if (!ext) ret.push(icn);
		}
	}
	return ret;
};
this.get_icons_by_path = get_icons_by_path;
//»
const focus_editing=e=>{if(e)nopropdef(e);if(CEDICN)CEDICN.label_div.area.focus()}
const check_if_newpath_is_in_itself = (oldpath, newpath) => {//«
	if (newpath.length > oldpath.length && newpath.slice(0, oldpath.length) === oldpath && newpath[oldpath.length] === "/") {
		return true;
	}
	return false;
}//»
const make_icon_label = str => {//«
	let label = mkdv();
	label.name = str;
	label.style.overflowWrap = "break-word";
	let div = mkdv();
	label.div = div;
	div.innerText = str;
	div.bgcol = "#000";
	div.tcol = "#ddd";
	label.add(div);
	label.padt = 2;
	label.padb = 2;
	label.padl = 4;
	label.padr = 4;
	return label;
};//»

const init_icon_editing = icon => {//«
	CEDICN = icon;
	if (icon.parentNode===desk && windows_showing) toggle_show_windows();
	CG.on();
	let label = icon.label;
	let area = make('textarea');
	area.id="edit_icon_textarea";
	area.value = label.name;
	let usediv = label.parentNode;
	usediv.html("");
	area.style.resize = "none";
	area.w = 65;
	area.h = 45;
	area.marl = "auto";
	area.marr = "auto";
	area.over = "hidden";
	usediv.add(area);
	usediv.area = area;
	area.ael('mousedown', e => {
		e.stopPropagation();
		area.focus();
	});
	area.ael('mouseup', e => {
		e.stopPropagation();
	});
	area.ael('dblclick', e => {
		e.stopPropagation();
		area.select();
	});
	area.select();
};//»
const add_drop_icon_overdiv = icon => {//«
	let oncontext = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (overdiv.context_menu) return;
		let canfunc = overdiv.cancel_func;
		deskcontext({
			x: e.clientX,
			y: e.clientY
		}, {
			items: ["Stop File Transfer", canfunc]
		});
	};
	let overdiv = make('div');
	icon.imgdiv.onload = () => {
		let rect = icon.imgdiv.getBoundingClientRect();
		overdiv.w = rect.width;
		overdiv.h = rect.height;
	};
	let od = overdiv;
	icon.overdiv = od;
	od.dis = "flex";
	od.style.alignItems = "center";
	od.style.justifyContent = "center";
	od.style.flexDirection = "column";
	od.bgcol = "#000";
	od.op = 0.66;
	od.tcol = "#fff";
	od.ta = "center";
	od.fs = 21;
	od.pos = "absolute";
	od.loc(0, 0);
	icon.add(overdiv);
	icon.activate = () => {
		overdiv.del();
		delete icon.disabled;
	};
	overdiv.oncontextmenu = oncontext;
	return overdiv;
};
this.add_drop_icon_overdiv = add_drop_icon_overdiv;
//»
const make_drop_icon=(extarg,where,name_arg)=>{let icon=automake_icon(extarg,name_arg,where);icon.off();icon.disabled=true;add_drop_icon_overdiv(icon);return icon;};
const icon_styler=icn=>{icn.label["tcol.on"]="#ddd";icn.label["tcol.off"]="#ddd";icn.label["bgcol.on"]="#ddd";icn.label["bgcol.off"]="#000";icn.imgdiv["bor.on"]="1px solid #ccc";icn.imgdiv["bor.off"]="1px solid transparent";};
const set_icon_name = (icon, namearg, if_link) => {//«
	let oldext = icon.ext;
	let name;
	if (if_link) name = namearg;
	else {
		let arr = getNameExt(namearg);
		name = arr[0];
		icon.ext = arr[1];
	}
	icon.name = name;
	let label = make_icon_label(name);
	icon.label = label;
	label.icon = icon;
	label.bor = "0px solid white";
	label.padb = 5;
	icon.label_div.innerHTML = "";
	icon.label_div.add(label);
	icon.label.bgcol = icon.label["bgcol.off"];
	label_font_color(icon, icon.label["tcol.off"]);
	icon_styler(icon);
	icon_off(icon);
	if (icon.app == "sys.Explorer") return;
	if (icon.ext != oldext) {
		delete icon.wrapper;
		icon.imgdiv.innerHTML = "";
		let newapp = ext_to_app(icon.ext);
		icon.app = newapp;
		let iconobj = {
			TYPE: "appicon",
			PAR: icon.imgdiv,
			APP: newapp,
			EXT: icon.ext
		};
		igen.attach(iconobj);
	}
};
this.set_icon_name = set_icon_name;
//»
const rm_icon = icon => {//«
	if (!icon.parentNode) return;
	let icons = get_icon_array(icon.parwin);
	if (icons) {
		for (let i = 0; i < icons.length; i++) {
			let ico = icons[i];
			if (ico && ((ico.name == icon.name) && (ico.ext == icon.ext))) {
				icons[i] = undefined;
				break;
			}
		}
	}
	icon.del();
};
this.rm_icon = rm_icon;
//»
const delete_icons = which => {//«
	let arr = [];
	let usewin = desk;
	if (Desk.CWIN && Desk.CWIN.app == "sys.Explorer") usewin = Desk.CWIN;
	if (which) arr = [which.fullpath()];
	else if (ICONS) {
		for (let icon of ICONS) arr.push(icon.fullpath());
		icon_array_off();
	}
	arr = arr.uniq();
	if (arr.length) {
		WDG.popyesno("Delete " + arr.length + " icons?", ret => {
			if (!ret) return;
			fs.do_fs_rm(arr, errmess => {
				cwarn(errmess);
			}, ret => {
				if (!ret) return console.error("do_fs_rm:failure");
				icon_array_off();
			},{DSK:DSK});
		});
	}
	return true;
}//»
const no_move_all_icons=()=>{for(let icn of IA)icon_off(icn);IA=[];CDICN=null;}
this.make_icon_cb = (path, app, winarg) => {//«
	if (app == "sys.Explorer") {
		make_folder_icon_cb(null, path, null, true);
	}
	else if (app == "Text") {
		WDG.popinarea("Paste text", (val) => {
			if (!val) return;
			if (CG.dis != "none") return;
			CG.on();
			let usewin = winarg || desk;
			let usepath = path;
			let usepos = null;
			let num = 0;
			let name = "New_File";
			let iter = 0;
			while (check_name_exists(name + ".txt", null, usepath)) {
				name = "New_File_" + (++num);
				iter++;
				if (iter == 50) {
					cerr("infinite loop detected");
					return;
				}
			}
			path_to_obj(usepath, parobj => {
				if (!parobj) return;
				let rtype = parobj.root.TYPE;
				if (rtype == "remote") {
					if (!fs.check_user_perm(parobj)) return poperr("Permission denied");
				} else if (rtype != "fs") return poperr("Not making a directory of type:\x20" + rtype);
				let obj;
				let arg = {
					PATH: usepath,
					NAME: name,
					X: 0,
					Y: 0,
					LABEL: name,
					APP: "",
					ROOTTYPE: rtype,
					EXT: "txt"
				};
				arg.TYPE = "icon";
				let icon = make_icon(arg);
				icon._savetext = val;
				place_in_icon_slot(usewin, icon, null, true);
				setTimeout(() => {
					init_icon_editing(icon);
				}, 0);
				icon.isnew = true;
			});
			return true;
		});
	}
};//»

const make_folder_icon_cb = (winarg, winpath, namearg, if_autopos, roottype) => {//«
	if (CG.dis != "none") return;
	if (!(namearg && if_autopos)) CG.on();
	let usewin = desk;
	let usepath = desk_path;
	let usepos;
	let retwin = null;
	if (ev) usepos = {
		X: ev.clientX,
		Y: ev.clientY
	};
	else usepos = null;
	if (winpath && (winpath != desk_path)) {
		let gotwin = get_win_by_path(winpath);
		if (gotwin) winarg = gotwin;
		else if (namearg) {
			winarg = open_window(winpath);
			if (!winarg) return null;
			retwin = winarg;
		} else {
			throw new Error("!gotwin && no namearg given");
		}
	}
	if (winarg) {
		if (winarg.app == "sys.Explorer") {
			usewin = winarg.main;
			usepath = winarg.path + "/" + winarg.name;
			usepos = null;
		} else return;
	}
	let name;
	if (namearg) name = namearg;
	else name = "New_Folder";
	let num = 0;
	if (!namearg) {
		let iter = 0;
		while (check_name_exists(name, null, usepath)) {
			name = "New_Folder_" + (++num);
			iter++;
			if (iter == 50) {
				cerr("infinite loop detected");
				return;
			}
		}
	}
	path_to_obj(usepath, parobj => {
		if (!parobj) return;
		let rtype = parobj.root.TYPE;
		if (rtype == "remote") {
			if (!fs.check_user_perm(parobj)) return poperr("Permission denied");
		} else if (rtype != "fs") return poperr("Not making a directory of type:\x20" + rtype);
		let obj;
		let arg = {
			PATH: usepath,
			NAME: name,
			X: 0,
			Y: 0,
			LABEL: name,
			APP: "sys.Explorer",
			ROOTTYPE: rtype
		};
		if (!if_autopos) {
			arg.X = ev.clientX;
			arg.Y = ev.clientY;
		}
		arg.TYPE = "icon";
		let icon = make_icon(arg);
		if (if_autopos) place_in_icon_slot(usewin, icon, null, true);
		else place_in_icon_slot(usewin, icon, usepos, true);
		if (namearg) {} else {
			setTimeout(() => {
				init_icon_editing(icon);
			}, 0);
		}
		icon.isnew = true;
	});
	if (retwin) return retwin;
	return true;
}
this.make_folder_icon_cb=make_folder_icon_cb;
//»
const desk_drag_off=()=>{DDIE=null;DDD.loc(-1,-1);DDD.w=0;DDD.h=0;}
const icon_array_add = icon => {
	if (ICONS.length && ICONS[0].parentNode !== icon.parentNode) icon_array_off();
	ICONS.push(icon);
}
const create_new_folder = () => {//«
	let icon;
	if (Desk.CWIN && Desk.CWIN.app == "sys.Explorer") {
		make_folder_icon_cb(Desk.CWIN, null, null, true);
		Desk.CWIN.obj.update();
	} else {
		if (windows_showing) toggle_show_windows();
		make_desk_folder(desk_path);
	}
	return true;
}//»
const make_desk_folder=(parpath,name,roottype)=>{return make_folder_icon_cb(null,parpath,name,true,roottype);};
this.make_desk_folder = make_desk_folder;
const update_all_paths = (oldpath, newpath) => {//«
	let app_has_ext = (app) => {
		if (app === "sys.Explorer" || app === "FIFO" || app === "Link") return false;
		return true;
	};
	oldpath = oldpath.regpath();
	newpath = newpath.regpath();
	let re = new RegExp("^" + oldpath + "/");
	for (let w of windows) {
		if (w.fullpath() === oldpath) {
			let newarr = newpath.split("/");
			let fname = newarr.pop();
			let ext = "";
			if (app_has_ext(w.app)) {
				let marr = getNameExt(fname);
				fname = marr[0];
				ext = marr[1];
			}
			w.name = fname;
			w.ext = ext;
			w.title = fname;
			w.path = newarr.join("/");
		} else {
			let gotpath = w.path;
			if (gotpath == oldpath || re.exec(gotpath)) w.replacepath(oldpath, newpath);
		}
	}
};
this.update_all_paths = update_all_paths;
//»
const save_icon_editing = () => {//«
	const abort=mess=>{
		if (!mess) mess="There was an error";
		CEDICN.del();
		CEDICN = null;
		poperr(mess);
		CG.off();
	};
	const doend = async (oldnamearg, newvalarg) => {
		let oldname = getNameExt(oldnamearg)[0];
		let newval;
		if (newvalarg) {
			if (CEDICN.app == "sys.Explorer" || CEDICN.app == "FIFO") newval = newvalarg;
			else newval = getNameExt(newvalarg)[0];
		}
		if (newval) {
//			if (CEDICN.app == "sys.Explorer") fs.move_fifos_and_links_of_dir((CEDICN.path + "/" + oldnamearg), (CEDICN.path + "/" + newvalarg), DSK && DSK.fspref);
			update_all_paths(CEDICN.path + "/" + oldname, CEDICN.path + "/" + newval);
			CEDICN.name = newval;
			set_window_name_of_icon(CEDICN, newval);
		} else newval = oldname;
		CEDICN.label_div.html("");
		icon_styler(CEDICN);
		let label = make_icon_label(newval);
		CEDICN.label = label;
		label.icon = CEDICN;
		label.bor = "0px solid white";
		label.padb = 5;
		CEDICN.label_div.add(label);
		CEDICN.dblclick = null;
		icon_off(CEDICN);
		CEDICN.name = newval;
		if (CEDICN._savetext) {
			let rv = await fsapi.writeFile(CEDICN.fullpath(), CEDICN._savetext, {NOMAKEICON: true, DSK:DSK});
			if (!rv) return abort("The file could not be created");
			delete CEDICN._savetext;
		}
		CEDICN.save();
		CEDICN = null;
		CG.off();
	};
	let ifnew;
	if (CEDICN) {
		if (CEDICN.isnew) ifnew = true;
		let val = CEDICN.name;
		let holdname = val;
		let checkit = CEDICN.label_div.area.value.trim().replace(RE_SP_PL, " ").replace(RE_SP_G, "\u00A0");
		if (CEDICN.ext) {
			checkit += "." + CEDICN.ext;
			holdname += "." + CEDICN.ext;
		}
		if (ifnew || (checkit != CEDICN.fullname)) {
			let srcpath = CEDICN.path + "/" + holdname;
			let destpath = CEDICN.path + "/" + checkit;
			if (!check_name_exists(checkit, CEDICN.parwin) || (ifnew && (srcpath == destpath))) {
				if (ifnew) {
					path_to_obj(CEDICN.path, async parobj => {
						if (!parobj) {
							doend(holdname);
							console.error("path_to_obj(): parpath not found:" + CEDICN.path);
							return;
						}
						let rtype = parobj.root.TYPE;
						if (rtype == "fs") {
							if (CEDICN._savetext) doend(holdname, checkit);
							else {
								fs.get_or_make_dir(CEDICN.path, checkit, mkret => {
									if (mkret) doend(holdname, checkit);
									else abort("Could not create the new directory");
								},null, null, DSK);
							}
						} else if (rtype == "remote") {
							fs.mk_rem_file(parobj, checkit, (mkret, err) => {
								if (mkret) doend(holdname, checkit);
								else doend(holdname);
							});
						} else {
							doend(holdname);
							console.error("Unknown root type:" + rtype);
						}
					});
				} else {
					let app = CEDICN.app;
					if (app == "Link" || app == "FIFO") {
						fs.move_kids(srcpath, destpath, ret => {
							if (!ret) {
								poperr("The icon could not be renamed.");
								doend(holdname);
								return;
							}
							doend(checkit);
						}, false,null,DSK);
					} else {
						fs.get_fs_ent_by_path(srcpath, ret1 => {
							if (ret1) {
								fs.mv_by_path(srcpath, destpath, app, ret2 => {
									if (ret2) doend(holdname, checkit);
									else {
										cerr("fs.mv_by_path returned nothing");
										doend(holdname);
									}
								},null ,null, DSK);
							} else {
								fs.get_fs_ent_by_path(destpath, ret3 => {
									if (ret3) doend(checkit);
									else {
										cerr("fs.get_fs_ent_by_path returned nothing");
										doend(holdname);
									}
								}, app, true, null, DSK);
							}
						}, app, null, null, DSK);
					}
				}
			} 
			else {
				if (ifnew) abort("The name '" + checkit + "' is already taken!!");
				else doend(holdname);
			}
		} else doend(holdname);
	}
}//»
const icon_array_off=()=>{for(let i=0;i<ICONS.length;i++)icon_off(ICONS[i]);ICONS=[];}
const icon_off = (icon, do_vacate) => {//«
	if (!(icon && icon.imgdiv)) return;
	if (do_vacate && ICONS.includes(icon)) ICONS.splice(ICONS.indexOf(icon), 1);
	icon.bor = "2px solid transparent";
	icon.bgcol="";
}//»
const icon_on = (icon, do_add) => {//«
	if (!(icon && icon.imgdiv)) return;
	if (do_add && !ICONS.includes(icon)) {
		if (ICONS.length && (icon.parwin !== ICONS[0].parwin)) icon_array_off();
		ICONS.push(icon);
	}
	if (icon.parentNode === desk) {
		icon.bor = DESK_ICON_BOR;
		icon.bgcol = DESK_ICON_BG;
	}
	else {
		icon.bor = FOLDER_ICON_BOR;
		icon.bgcol = FOLDER_ICON_BG;
	}
}//»
const label_font_color=(icon,color)=>{icon.label.tcol=color;}
const make_icon_if_new = (path, appwinarg, fent) => {//«
	let parts = Core.api.pathParts(path);
	let dirpath = parts[0];
	let fname = parts[1];
	let ext = parts[2];
	let icons = desk.getElementsByClassName("icon");
	for (let icn of icons) {
		if (icn.path == dirpath && icn.name == fname && icn.ext == ext) return;
	}
	if (dirpath === desk_path) {
		make_icon_by_path(path, appwinarg, fent);
		return;
	}
	for (let w of get_wins_by_path_and_ext(dirpath)) automake_icon(ext, fname, w, null, appwinarg);
	return true;
};
this.make_icon_if_new = make_icon_if_new;
//»
const make_icon_by_path = (path, appwinarg, fent) => {//«
	let arr = path.split("/");
	if (!arr[arr.length - 1]) arr.pop();
	let fname = arr.pop();
	let name_arr = getNameExt(fname);
	let name = name_arr[0];
	let ext = name_arr[1];
	let winpath = arr.join("/");
	let win = get_win_by_path(winpath);
	if (win) {
		let icons = get_icon_array(win, true);
		for (let i = 0; i < icons.length; i++) {
			let icon = icons[i];
			if (icon.name === name) {
				if (!ext && !icon.ext) return;
				if (ext === icon.ext) return;
			}
		}
	}
	if (!win && winpath === desk_path) win = desk;
	fs.add_new_kid(winpath, fname, ret => {
		if (win) automake_icon(ext, name, win, {fent:fent}, appwinarg);
	}, null, DSK);
};//»
const save_hook = (path,fent) => {//«
	path_to_obj(path, obj => {
		if (obj) {
			fs.get_file_len_and_hash_by_path(path, (lenret, sha1ret, bytes) => {
				if (check_open_files(path, null, lenret, sha1ret, bytes)) return;
				make_icon_if_new(path,null,fent);
			}, DSK);
		} else make_icon_by_path(path,null,fent);
	});
};
this.save_hook = save_hook;
//»
const automake_icon = (ext, name, wherearg, opts={}, appwinarg) => {//«
	if (!opts) opts={};
	let use_link, if_fifo, if_folder;
	if (opts.ICON) {
		let icn = opts.ICON;
		ext = icn.ext;
		name = icn.name;
		if (icn.app === "Link") use_link = icn.link;
		if_fifo = icn.app === "FIFO";
		if_folder = icn.app == "sys.Explorer";
	}
	else if (opts.fent && opts.fent._fileObj) {
		let fobj = opts.fent._fileObj;
		use_link = fobj.LINK;
	}
	else {
		use_link = opts.LINK;
		if_fifo = opts.FIFO;
		if_folder = opts.FOLDER;
	}
	let where;
	let usepath;
	if (use_link){
		ext="lnk";
	}
	else if (if_fifo || if_folder) {
	}
	else if (!ext) {
		let arr = getNameExt(name);
		if (arr[0] && arr[1]) {
			name = arr[0];
			ext = arr[1];
		}
	}

	let fullname = name;
	if (ext) fullname = `${name}.${ext}`;

	if (!wherearg) {
		where = desk;
		usepath = desk_path;
	} else {
		if (typeof wherearg == "string") {
			where = get_win_by_path(wherearg);
			if (!where) return;
		} else where = wherearg;
		if (where == desk) usepath = desk_path;
		else usepath = where.path + "/" + where.name;
	}
	let obj = {
		PATH: usepath,
		NAME: name,
		X: 0,
		Y: 0,
		LABEL: name,
		EXT: ext
	};
	if (use_link) obj.APP = "Link";
	else if (if_fifo) obj.APP = "FIFO";
	else if (if_folder) obj.APP = "sys.Explorer";
	obj.TYPE = "icon";
	let icon = make_icon(obj);
	if (use_link) {
		icon.link = use_link.regpath();
		icon.ext="lnk";
	}
	let fullpath = `${usepath}/${name}`;
	if (ext) fullpath+=`.${ext}`;
//	for (let icn of where.icons){
//		if (icn&&icn.fullpath()==fullpath) {
//			return;
//		}
//	}
	if (where===desk) place_in_icon_slot(where, icon, null, true);
	else {
		icon.parwin=where;
//		where.icon_div.add(icon);
//		where.obj.add_icon(icon);
		where.obj.add_icon(fullname);
	}
	if (ext && ext_to_app(ext) == "Application") icon.deref_appicon();
	if (use_link) icon.deref_link();
	icon_off(icon);
	if (appwinarg) {
		icon.win = appwinarg;
		appwinarg.icon = icon;
	}
	return icon;
};
this.automake_icon = automake_icon;
//»


const select_icons_in_drag_box_win = (e, win, scrld, scrtd) => {//«
	if (!WDIE) return icon_array_off();
	let icons = win.main.getElementsByClassName("icon");
	let hix = null,
		lox;
	let hiy = null,
		loy;
	let r = win.getBoundingClientRect();
	let wl = r.left;
	let wt = r.top;
	let mn = win.main;
	let scrl = mn.scrollLeft;
	let scrt = mn.scrollTop;;
	if (WDIE.clientX < e.clientX) {
		hix = e.clientX - wl + scrl;
		lox = WDIE.clientX - wl - scrld + scrl;
	} else {

		hix = WDIE.clientX - wl - scrld + scrl;
		lox = e.clientX - wl + scrl;
	}
	if (WDIE.clientY < e.clientY) {

		hiy = e.clientY - wt + scrt;
		loy = WDIE.clientY - wt - scrtd + scrt;
	} else {

		hiy = WDIE.clientY - wt - scrtd + scrt;
		loy = e.clientY - wt + scrt;

	}
	if (hix == null || hiy == null) return;
	hix-=winx();
	hiy-=winy();
	lox-=winx();
	loy-=winy();
	let OK=[];
	for (let icn of icons) {
		let wrap = icn;
		let left = wrap.offsetLeft;
		let right = left+wrap.offsetWidth;
		let top = wrap.offsetTop;;
		let bot = top+wrap.offsetHeight;;
		if (!(left > hix || right < lox || top > hiy || bot < loy)) {
			OK.push(icn);
			icon_on(icn);
		}
		else icon_off(icn);
	}
	ICONS = OK;
}//»
const select_icons_in_drag_box_desk = (e) => {//«
	if (!DDIE) return icon_array_off();
	let icons = get_icon_array(desk);
	let hix = null,
		lox;
	let hiy = null,
		loy;
	if (DDIE.clientX < e.clientX) {
		hix = e.clientX;
		lox = DDIE.clientX;
	} else {
		hix = DDIE.clientX;
		lox = e.clientX;
	}
	if (DDIE.clientY < e.clientY) {
		hiy = e.clientY;
		loy = DDIE.clientY;
	} else {
		hiy = DDIE.clientY;
		loy = e.clientY;
	}
	if (hix == null || hiy == null) return;

	hix-=winx();
	hiy-=winy();
	lox-=winx();
	loy-=winy();

	let OK=[];
	for (let icn of icons) {
		if (icn) {
//  YHLKWT !!!!!!!!!!!!!!!!!!  vvvvvvvvvvvvvvvvvvvvvv
			let left = icn.x + icn.wrapper.offsetLeft;
			let right = icn.x + icn.wrapper.offsetLeft + icn.wrapper.offsetWidth;
			let top = icn.y + icn.wrapper.offsetTop;
			let bot = icn.y + icn.wrapper.offsetTop + icn.wrapper.offsetHeight;
			if (!(left > hix || right < lox || top > hiy || bot < loy)) {
				icon_on(icn);
				OK.push(icn);
			} else icon_off(icn);
		}
	}
	ICONS = OK;
}//»
this.get_fullpath_icons_by_path = (patharg, is_regular_file, icon) => {//«
	if (icon && icon.app) {
		if (icon.app == "FIFO" || icon.app == "sys.Explorer" || icon.app == "Link") is_regular_file = false;
		else is_regular_file = true;
	}
	if (!is_regular_file) return get_icons_by_path(patharg);
	let arr = getNameExt(patharg, true);
	return get_icons_by_path(arr[0], arr[1]);
}
//»
//»
//File opening/App Loading«

const open_app = (appname, cb, force_open, winargs, appobj, if_reload, icon) => {//«
	const win_is_active = (win) => {
		let sty = win.style;
		if (sty.display != "none" && sty.opacity != 0 && sty.zIndex > 0) return true;
		return false;
	};
	if (!winargs) winargs={};
	if (lotw_mode&&appname=="sys.LOTW"){
		return poperr("There is such a thing as too much inception!");
	}
	if (!force_open){
		for (let w of windows){
			if (w.app==appname){
				if (w.is_minimized) w.unminimize();
				w.on();
				cb&&cb();
				return;
			}
		}
	}
	if (!cb) cb = () => {};
	let useid;
	let usealias;
	let nochrome;
	let hiz = -1;
	let wintitle = "Untitled";
	let win;
	let usex, usey, usez, usew, useh;
	usex = usey = usew = useh = null;
	let optargs = null;
	let is_chrome = winargs.ISCHROME;

	let defwinargs = get_newwin_obj(appname);
	if (NUM(winargs.X)) usex = winargs.X;
	else usex = defwinargs.X;

	if (NUM(winargs.Y)) usey = winargs.Y;
	else usey = defwinargs.Y;

	if (NUM(winargs.Z)) usez = winargs.Z;

	if (NUM(winargs.WID)) usew = winargs.WID;
	else if (winargs.WID === "100%") usew = winw();
	else usew = defwinargs.WID;

	if (NUM(winargs.HGT)) useh = winargs.HGT;
	else if (winargs.HGT === "100%") useh = winh();
	else useh = defwinargs.HGT;

	if (winargs.TITLE) wintitle = winargs.TITLE;

	if (winargs.EMBEDDED) {
		usew = winw() - (20 + 134);
		useh = winh() - (35 + 79);
	} 
	if (appname == "sys.Explorer") wintitle = "File Explorer".tonbsp();
	let useicon = winargs.ICON || icon || {ready:{}};
	win = make_window({
		CENTER: winargs.CENTER||defwinargs.CENTER,
		ICON: useicon,
		TYPE: "window",
		LETS:winargs.LETS,
		FULLSCREEN: winargs.FULLSCREEN,
		WINTITLEIMG: winargs.WINTITLEIMG,
		XREL: winargs.XREL,
		YREL: winargs.YREL,
		OP: winargs.OP,
		OPT: optargs,
		EMBEDDED: winargs.EMBEDDED,
		NOCHROME: winargs.NOCHROME,
		ISCHROME: winargs.ISCHROME,
		ISBACKGROUND: winargs.ISBACKGROUND,
		ALIAS: winargs.ALIAS,
		ID: winargs.ID,
		X: usex,
		Y: usey,
		Z: usez,
		WID: usew,
		HGT: useh,
		NAME: wintitle,
		APP: appname,
		CB: cb,
		APPOBJ: appobj,
		APPMODE: true
	});
	if (useicon) {
		useicon.win = win;
		win.icon = useicon;
	}
	win.appobj = appobj;
	win.zup();
	window_on(win);
	return win;
};
/*
api.openApp = (appname, winargs, appobj, opts) => {//«
	if (!opts) opts = {};
	return new Promise((res, rej) => {
		open_app(appname, rv => {
			if (rv) return res(rv);
			rej("Could not open app:" + appname);
		}, opts.force, winargs, appobj, opts.reload);
	});
};//»
*/
this.openApp = (appname, force_open, winargs, appobj) => {
	return new Promise((y, n) => {
		open_app(appname, y, force_open, winargs, appobj);
	});
};
//»
const open_icon_app = async(icon, bytes, ext, useapp, force_open) => {//«
	if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
	if (ext == "app") {
		icon.ready.state = "Dereferencing app icon";
		let obj;
		try {
			obj = JSON.parse(await Core.api.toStr(bytes));
			if (icon.service_obj) obj.SERVICE_OBJ = icon.service_obj;
			icon.appobj = obj;
		} catch (e) {
			icon.ready.error = "Error parsing app icon JSON";
			poperr("The application JSON could not be parsed");
			cerr(e.message);
			return;
		}
		if (!obj) return poperr("Open error #1");
		let which = obj[ext];
		if (!which) {
			icon.ready.error = "App icon JSON format error";
			return poperr("No '" + ext + "' field in the JSON object!");
		}
		open_app(which, null, true, icon.winargs, obj.args, null, icon);
//		open_app(which, null, force_open, icon.winargs, obj.args, null, icon);
	}
	else open_file(bytes, icon);
	
}//»
const open_file_by_path = (patharg, cb, opt={}) => {//«
	const err = (str) => {
		if (cb) return cb(null, str);
		poperr(str);
	};
	const ok = () => {
		if (cb) cb(true)
	};
	let objpath = fs.get_path_of_obj;
	path_to_obj(patharg, (ret, lastdir, gotpath) => {
		if (!ret) {
			let marr;
			return err("Cannot open:" + patharg);
		}
		let fullpath = objpath(ret);
		if (ret.APP == "sys.Explorer") {
			ok();
			return open_folder_win(ret.NAME, objpath(ret.par),null,opt.WINARGS);
//			return open_folder_win(ret.NAME, objpath(ret.par),{winargs:opt.WINARGS,fullpath:()=>{return fullpath;}});
		}
		let patharr = fullpath.split("/");
		if (!patharr[patharr.length - 1]) patharr.pop();
		let fname = patharr.pop();
		let fakeicon = {
			winargs: opt.WINARGS,
			ready:{state:"Triggered"},
			name: fname,
			path: (patharr.join("/")).regpath(true),
			fullpath: () => {
				return fullpath;
			}
		};

		let arr = getNameExt(fullpath);
		let ext = arr[1];
		if (ext) {
			fakeicon.name = arr[0];
			fakeicon.ext = ext;
			fakeicon.app = ext_to_app(ext);
		} else fakeicon.app = DEF_BIN_OPENER;
		let rtype = ret.root.TYPE;
		fs.getbin(fullpath, ret => {
			const doit = (bytes) => {
				ok();
				if (ext && ext == "app") return open_icon_app(fakeicon, bytes, ext, null, opt.FORCE);
				open_file(bytes, fakeicon);
			};
			if (ret) {
				doit(ret);
			} else {
				cwarn("got nothing:" + fullpath);
			}
		}, DSK);
	});
}
this.open_file_by_path=open_file_by_path;
//»
const open_icon_window = (icon, dataarg) => {//«
	open_new_window(icon, win => {
		if (win) {
			if (icon.ext) win.ext = icon.ext;
			if (dataarg) {
				win.obj.onloadfile(dataarg, icon.name, icon.ext);
			}
			else win.obj.onloadfile();
		}
	});
}//»
const open_file = (bytes, icon) => {//«
	let app = icon.app;
	if (icon.linkapp) app = icon.linkapp;
	open_icon_window(icon, bytes);
}//»
const open_new_window = (icon, cb, opts={}) => {//«
	if (!(icon.fullpath instanceof Function)) {
		poperr("Fatal:\x20check the error stack in the console!");
		throw new Error("open_new_window()\x20called without a fakeicon with a fullpath function");
		cb&&cb();
		return;
	}
	let useid = null;
	let app = icon.app;
	if (icon.linkapp) app = icon.linkapp;
	let usemime = null;
	let usename = icon.linkname||icon.name;
	let usepath = icon.linkpath||icon.path;
	let useext = icon.linkext||icon.ext;
	let ref = icon.ref;
	if (ref){
		let arr = capi.getNameExt(ref.NAME);
		usename = arr[0];
		useext = arr[1];
		usepath = ref.par.fullpath;
	}
	let appobj = {
		PATH: icon.path
	};
	if (icon.service_obj) {
		appobj.SERVICE_OBJ = icon.service_obj;
		delete icon.service_obj
	}
	let winargs = icon.winargs||{};
//	if (app!=="sys.Explorer") defwinargs = get_newwin_obj();
	let defwinargs = get_newwin_obj();

//	let geomstr;//«
/*
	if (winargs && isnum(winargs.X) && isnum(winargs.Y) && isnum(winargs.WID) && isnum(winargs.HGT)) {
		objarg.X = winargs.X;
		objarg.Y = winargs.Y;
		objarg.WID = winargs.WID;
		objarg.HGT = winargs.HGT;
	} else get_newwin_obj(objarg);
//»*/

	let usex, usey, usez, usew, useh;
	if (NUM(winargs.X)) usex = winargs.X;
	else usex = defwinargs.X;

	if (NUM(winargs.Y)) usey = winargs.Y;
	else usey = defwinargs.Y;

	if (NUM(winargs.Z)) usez = winargs.Z;

	if (NUM(winargs.WID)) usew = winargs.WID;
	else if (winargs.WID === "100%") usew = winw();
	else usew = defwinargs.WID;

	if (NUM(winargs.HGT)) useh = winargs.HGT;
	else if (winargs.HGT === "100%") useh = winh();
	else useh = defwinargs.HGT;
//log(usex,usey,usew,useh);
	let fullpath = `${usepath}/${usename}`;
	if (useext) fullpath+=`.${useext}`;
//log("FULL",fullpath);
	let win = make_window({
		FULLPATH: fullpath,
		HIDDEN: opts.hidden,
		X:usex,
		Y:usey,
		WID:usew,
		HGT:useh,
		ICON: icon,
		ID: useid,
		NAME: usename,
		APP: app,
		ROOTTYPE: icon.roottype,
		APPOBJ: appobj,
		CB: cb,
		TYPE: "window"
	});
	win.name = usename;
	win.path = usepath;
	win.ext = useext;
	if (app == "Folder") reload_icons(win);
	icon.win = win;
	win.icon = icon;
	return win;
}
const open_window=(winpath,optargs)=>{if(winpath.match(/^win_[0-9]+$/))return;return get_win_by_path(winpath);}
const win_reload = (usewin) => { /* if(!dev_mode){cwarn("Please enable dev mode to use the window reload feature!");return false;}*/
	let set_to_cur = null;
	let use_z;
	let oldcur = Desk.CWIN;
	let winargs;
	let winimg;
//cwarn("RELOAD!!!");
	if (usewin || oldcur) {
		let win = usewin || oldcur;
		winargs = {
			ICON: win.icon,
			ALIAS: win._alias,
			WINTITLEIMG: win.img_div.childNodes[0],
			ID: win.id,
			X: win.x,
			Y: win.y,
			WID: win.main.w,
			HGT: win.main.h
		};
	}
	if (!usewin || (Desk.CWIN && (usewin == Desk.CWIN))) {
		usewin = Desk.CWIN;
		set_to_cur = true;
	} else use_z = usewin.style.zIndex;
	if (usewin) {
		if (usewin.app == "sys.Explorer") {
			usewin.icons = [];
			usewin.main.innerHTML = "";
			reload_icons(usewin);
			return;
		}
		if (usewin.parent_win && usewin.parent_win.parent_cb) {
			usewin.parent_win.parent_cb({
				COM: "RELOAD"
			});
			return true;
		}
		let curapp = usewin.app;
		let scr = gbid('script_' + curapp);
		if (scr) scr.del();
		eval('delete ' + __OS_NS__ + '.apps["' + curapp + '"]');
		eval(__OS_NS__ + '.apps["' + curapp + '"]=undefined');
		/*Delete the modules that go with the app here. TODO:Do this from winobj.onkill()instead!*/
		let w = usewin;
		let winid = w.id;
		let winpath = w.path;
		let winicon = w.icon;
		let winname = w.name;
		let winext = w.ext;
		let winapp = w.app;
		let winnosave = w.nosave;
		let appobj = w.appobj;
		if (!appobj) appobj = {};
		let is_devapp = w.is_devapp;
		let optarg = {};
		w.is_reload = true;
		let servobj = w.service_obj;
		w.force_kill(true);
		setTimeout(() => {
			if (winicon && winicon instanceof HTMLElement) {
				winicon.service_obj = servobj;
				winicon.winargs = winargs;
				icon_dblclick(winicon);
			} else {
				usewin = open_window(winid, optarg);
				if (servobj) appobj.SERVICE_OBJ = servobj;
				if (winpath) {
					let usepath = winpath + "/" + winname;
					if (winext) usepath += "." + winext;
					appobj.FILE_PATH = usepath;
				}
				if (set_to_cur) {
					window_off(Desk.CWIN);
					if (!usewin) {
						open_app(winapp, null, true, winargs, appobj, true);
					} else {
						Desk.CWIN = usewin;
					}
					Desk.CWIN.path = winpath;
					Desk.CWIN.ext = winext;
					Desk.CWIN.name = winname;
					Desk.CWIN.icon = winicon;
					Desk.CWIN.nosave = winnosave;
					if (winname) Desk.CWIN.title=winname;
				} else {
					if (!usewin) {
						open_app(winapp, x => {
							setTimeout(x => {
								if (use_z) Desk.CWIN.style.zIndex = use_z;
								oldcur.zup();
								oldcur.winon();
							}, 10);
						}, true, winargs, appobj, true);
					}
				}
			}
		}, 5);
	}
	return true;
};//»

//»
//Saving«

/*Called via "real/outer" OS file drop event(ChromeOS,Windows,etc)*/

const save_dropped_files = (e, where) => {//«

return new Promise((y,n)=>{
	let usepath;
	if (!where) usepath = desk_path;
	else usepath = where.fullpath();
	let files = fs.event_to_files(e);
	let iter = -1;
	let dofile = () => {
		iter++;
		if (iter >= files.length) return y();
		let f = files[iter];
		if (!(f && f.name)) return dofile();
		let saver = new fs.FileSaver();
		saver.set_cb("error", mess => {
			cerr(mess);
			dofile();
		});
		saver.set_cwd(usepath, parobj => {
			if (!parobj) return dofile();
			saver.set_filename(f.name, nameret => {
				if (!nameret) return dofile();
				saver.set_writer((r3, errmess) => {
					if (!r3) {
						if (errmess) {
							cwarn(errmess);
						}
						return dofile();
					}
					let parts = getNameExt(nameret);
					let ext = parts.pop();
					let fname = parts.pop();
					let curicon = make_drop_icon(ext, usepath, fname);
					let odiv = curicon.overdiv;
					odiv.innerHTML = "0%";
					odiv.cancel_func = () => {
						rm_icon(curicon);
						saver.cancel(dofile);
					};
					saver.set_cb("update", per => {
						odiv.innerHTML = per + "%";
					});
					saver.set_cb("done", () => {
						if (odiv.context_menu) odiv.context_menu.kill();
						curicon.activate();
						dofile();
					});
					saver.save_from_file(f);
				});
			});
		});
	};
	dofile();
});
}
this.save_dropped_files=save_dropped_files;
//»

const check_open_files = (fullpatharg, winid, len, sha1, newbytes, cb) => {//«
	let arr = fullpath_to_path_and_ext(fullpatharg);
	let fullpath = arr[0];
	let ext = arr[1];
	let iter = -1;
	let wins = get_wins_by_path_and_ext(fullpath, ext);

	const dowin=()=>{
		iter++;
		if (iter == wins.length) return;
		let win = wins[iter];
		if (winid && win.id == winid) return dowin();
		let obj = win.obj;
		if (!obj) return dowin();
		if (!obj.getbytes) return dowin();
		obj.getbytes(async ret => {
			if (!ret) {
				cwarn("Nothing returned from window id:" + win.id);
				log(win);
				dowin();
				return;
			}
			let ret2 = await Core.api.sha1(ret);
			if (!(ret.length == len && sha1 == ret2)) obj.modified(newbytes);
			dowin();
		});
		return true;
	};
	if (!wins.length) return false;
	return dowin();
};
this.check_open_files = check_open_files;
//»
//»
//Key Handlers/Syskeys/Message Handlers«

const dokeydown = function(e, usecode) {//«
	const check_prompt=cpr=>{//«
		if (cpr.key_handler) {
			if (kstr == "ENTER_A") kstr = "ENTER_";
			else return cpr.key_handler(kstr, e, false, code, mod_str);
		}
		let okbut;
		let canbut = cpr.cancel_button;
		if (cpr.cancel_only) okbut = canbut;
		else okbut = cpr.ok_button;
		let clickok = () => {
			okbut.click();
		};
		if (okbut) {
			let keys = cpr._keys;
			if (keys) {
				if (kstr != "ESC_" && (keys === true)) cpr.keyok = true;
				if (kstr != "ESC_") {
					if (keys === true) cpr.keyok = true;
					else cpr.keyok = keys[kstr[0]];
				}
				return clickok();
			}
			else if ((kstr == 'ENTER_') || (kstr == "ESC_" && cpr.inactive)) {
				if (macro_cb) {
					Core.set_macro_update_cb(null);
					Core.set_macros(null);
				}
				if (kstr=="ENTER_"){
					if (!text_inactive && (act instanceof HTMLTextAreaElement) && !act._noinput) return;
					e.preventDefault();
					if (act.type=="popup_button") return act.click();
				}
			}
		}
		if (canbut&&kstr=="ESC_") return canbut.click();
		if (kstr=="a_C"){
			if (cpr.messdiv.style.userSelect=="text") document.getSelection().selectAllChildren(cpr.messdiv);
		}
		else if (kstr=="c_C"){
			if (cpr.messdiv.style.userSelect=="text") {
				document.execCommand("copy")
				window.getSelection().removeAllRanges();
			}
		}
		else if (kstr==="ESC_"){
			if (cpr.cancel) cpr.cancel();
		}
	};//»
	const wasd={//«
		w:'U',
		a:'L',
		s:'D',
		d:'R'
	};//»
	const CUR_KSYMS=["LEFT_","RIGHT_","UP_","DOWN_","LEFT_C","RIGHT_C","UP_C","DOWN_C","ENTER_","ENTER_A","SPACE_"];
	if (PREV_DEF_ALL_KEYS) {
		if (e.altKey||e.ctrlKey) e.preventDefault();
	}
	let marr;
	let cwin = Desk.CWIN;
	let is_full;
	let is_max;
	if (cwin){
		is_full=cwin.is_fullscreen;
		is_max=cwin.is_maxed;
	}
	let cobj;
	if (cwin) cobj = cwin.obj;
	let cpr = Desk.CPR;
	let code = e.keyCode;
	let mod_str = "";
	let chr, kstr;
	let macro_cb = Core.get_macro_update_cb();
	if (code >= 16 && code <= 18) {
		if (!macro_cb) {
//			if (cwin && cwin.obj.onkeydown) cwin.obj.onkeydown(e, "", "");
			return;
		}
	}
	if (e.ctrlKey) mod_str = "C";
	if (e.altKey) mod_str += "A";
	if (e.shiftKey) mod_str += "S";
	if (usecode) code = usecode;
	chr = KC[code];
	kstr = chr + "_" + mod_str;
	e._sym = kstr;
	if (debug_keydown) log(kstr);
	let mapobj = keysym_map[kstr];
	let act = document.activeElement;
	let act_type = null;
	if (act) act_type = act.type;
	let usecwin;
	let text_inactive = true;
/*
These are the keycodes that are used by the browser to do various things that we might not give 
a crap about in LOTW, so we stop that thing from happening here. (I mean, who needs Ctrl+p to 
open a print dialog if you never print anything or even have a printer!)
*/
	let prevent = {
//n_C:1,
//		"l_C": 1,
		"s_CA": 1,
		"e_C": 1,
		"=_C": 1,
		"-_C": 1,
		"f_C": 1,
		"s_C": 1,
		"c_CS": 1,
		"k_C": 1,
//		"w_C":1,
		"d_A":1,
		"p_C":1,
		"j_C":1,
//PGUP_:1,
//PGDN_:1
	};
	const notext_prevdef={
		"BACK_": 1,
		"a_C":1
	};
	if (prevent[kstr]) e.preventDefault();
	if (act && act != desk.area && act_type && act_type.match(/^(text|password|number)/)) text_inactive = false; /*Prevent Default Detection(To stop unwanted browser actions like unloading)*/
	if (text_inactive && notext_prevdef[kstr]) e.preventDefault();
	

/*The LOTW app is used to work on the desktop from within the desktop. It is currently under 
construction. Alt+Escape is its secret way of escaping from fullscreen mode where it gobbles
up everything (even plain Escapes).
*/
	if (cwin&&cwin.app=="sys.LOTW"&&cwin.is_fullscreen){
		if (kstr=="ESC_A") return fullscreen_window();
		cwin.obj.onkeydown(e,kstr,mod_str);
		return;
	}
/*
Macros gobble everything.
*/
	if (macro_cb && kstr !== "ESC_") {
		let str = Core.macro_key_down(code);
		if (str === null) return;
		macro_cb(str);
		return;
	}
/*If there is a system prompt, it takes precedence over everything below.*/
	if (cpr) return check_prompt(cpr);

	if (CEDICN) {/*We have an icon with a <textarea> whose name is being created or updated*/
		if (kstr == 'ENTER_' || kstr == 'ESC_') {
			if (kstr == "ESC_") CEDICN.label_div.area.value = CEDICN.name;
			save_icon_editing();
		}
		else if (kstr=="TAB_")e.preventDefault();
		return;
	}
	else if (kstr == "ENTER_") {
/*Enter key selects a menu option or unminimizes a window*/
		if (Desk.desk_menu) return Desk.desk_menu.select();
		else if (cwin && cwin.context_menu) return cwin.context_menu.select();
		else if (cwin && cwin.is_minimized) {
			return cwin.unminimize();
		}
	} 
	else if (kstr == "LEFT_" || kstr == "RIGHT_" || kstr == "UP_" || kstr == "DOWN_") {
/*Direction keys to navigate the current context menu*/
		if (Desk.desk_menu) return Desk.desk_menu.key_handler(kstr);
		else if (cwin && cwin.context_menu) return cwin.context_menu.key_handler(kstr);
	} 
	else if (CG.style.display == "block") {
/*The click guard is up and we have a context menu on the desktop. Kill it with Escapes, or bail out.*/
		if (kstr == "ESC_") {
			if (Desk.desk_menu) return Desk.desk_menu.kill();
		} else if (Desk.desk_menu) return;
	} else if (kstr == "ESC_" && cwin) {
/*If there is Escape and a focused window, this is the chain of events:*/
		if (cwin.context_menu) {
			cwin.context_menu.kill();
			return 
		}
		if (!cwin.is_minimized && cobj && cobj.onescape && cobj.onescape()) return;
		if (cwin.app=="sys.Explorer" && ICONS.length){
			icon_array_off();
			return;
		}
		if (cwin.is_fullscreen) return fullscreen_window();
		if (cwin.is_maxed) return maximize_window();
		if (!layout_mode && cwin.is_layout) return do_toggle_win_layout();
		window_off(cwin);
		CUR.todesk();
		return;
	}
	else if (kstr==="ESC_A"&&cwin){
		window_off(cwin);
		CUR.todesk();
		return;
	}

	if (cwin) {
		if (!text_inactive) {
			if (code >= 37 && code <= 40 && mod_str == "S") e.preventDefault();
		}
	} else {
		if (code >= 33 && code <= 40 && text_inactive) e.preventDefault();
	} 

	/*System hotkeys, defined in /etc/config/desk/keysym.json or ~/.config/desk/keysym.json */
	if (mapobj) {
		let gotargs = mapobj.ARGS;
		if (!gotargs) gotargs = [];
		let gotfunc = keysym_funcs[mapobj.NAME]||keysym_funcs[mapobj.n];
		if (!gotfunc) return poperr(`There is nothing named '${mapobj.NAME}' in keysym_funcs using the sym: ${kstr}`);
		gotfunc.apply(null, gotargs);
		return;
	} 


	/*Open context menu of selected icon, desktop or current window*/
	if (kstr == "c_A") {
		if (ICONS.length){
			if (ICONS.length==1){
				let icn = ICONS[0];
				let r = icn.gbcr();
				icn.wrapper.oncontextmenu({clientX: r.x, clientY: r.y, isFake: true});
			}
		}
		else if (!cwin) {
			deskcontext({x:0,y:(taskbar_hidden?0:taskbar.clientHeight)},{BREL:true});
			return;
		}
		else if (cobj && cobj.get_context) {
			if (!(cobj.overrides && cobj.overrides["c_A"])) {
				cwin.context_menu_on();
				return;
			}
		}
	}
/*Layout mode means that the windows have overlays that allow the 8 directional quadrants 
(N,S,E,W,NE,NW,SE,SW) of the window's rectangle to be used for resizing while the center
is used as the handle to grab it and move it around. This is much easier than hunting around
for the titlebar and the little square at the bottom right.
In this mode, the keyboard has a lot more leeway for being used for layout purposes..
*/
	if (cwin && cwin.is_layout){
		if (dev_mode) {
			if (kstr=="l_CA") return do_toggle_win_layout();
		}
		if (chr.match(/^[wasd]$/)) return move_window(wasd[chr],e.shiftKey);
		let ch0 = kstr[0];
		let ch2 = kstr[2];
		if (ch0.match(/^[LRUD]$/)&&!mod_str) resize_window(ch0);
		else if (ch0.match(/^[LRUD]$/)&&mod_str=="C") resize_window(ch0,null,true);
		else if (ch0.match(/^[LR]$/)&&mod_str=="A") {
			e.preventDefault();
			resize_window((ch0=="L"?"R":"L"),true);/*Arrows indicate directionality of the resizing motion*/
			/*resize_window(ch0,true);//Arrows "point to" which side is being resized*/
		}
		else if (ch0.match(/^[LR]$/)&&mod_str=="CA") {
			resize_window((ch0=="L"?"R":"L"),true,true);
			/*resize_window(ch0,true,true);*/
		}
		else if (chr.match(/^PG/)&&!mod_str){
			resize_window((ch2=="U"?"D":"U"),true);
			/*resize_window(ch2,true);*/
		}
		else if (chr=="HOME"&&!mod_str){
			resize_window("D",true,true);
			/*resize_window("U",true,true);*/
		}
		if (chr=="END"&&!mod_str){
			return resize_window("U",true,true);
			/*resize_window("D",true,true);*/
		}
		return;
	}
	if (!cwin || cwin.app=="sys.Explorer"){
/*
After the longest time of having the icon selection and moving procedures being
done in the typical mousedown and mousemove kinds of ways, I decided to turn it
into a cursor based approach. You select icons by moving the cursor over them.
*/
		if (cwin&&(kstr==="PGDOWN_"||kstr==="PGUP_"||kstr==="HOME_"||kstr==="END_")){
			let mn = cwin.main;
			if (kstr==="PGDOWN_") mn.scrollTop+=mn.clientHeight;
			else if (kstr==="PGUP_") mn.scrollTop-=mn.clientHeight;
			else if (kstr==="HOME_") mn.scrollTop=0;
			else mn.scrollTop=mn.scrollHeight;
			select_first_visible_folder_icon(cwin);
		}
		else if (CUR.ison()&&CUR_KSYMS.includes(kstr)) {
			if (kstr == "LEFT_" || kstr == "RIGHT_" || kstr == "UP_" || kstr == "DOWN_") {
				e.preventDefault();
				return CUR.move(kstr[0]);
			}
			else if (kstr == "LEFT_C" || kstr == "RIGHT_C" || kstr == "UP_C" || kstr == "DOWN_C") return CUR.move(kstr[0],true);
			else if (kstr=="ENTER_") return CUR.select();/*Simple select*/
			else if (kstr=="ENTER_A") return CUR.select(null,true);/*Force open and deselect*/
			else if (kstr=="SPACE_") {
				if (cwin) e.preventDefault();
				return CUR.select(true);/*Toggles the selection status*/
			}
		}
		else if (kstr=="BACK_C"&&ICONS.length)return delete_icons();
		else if (kstr=="a_C"){/*Select all icons*/
			icon_array_off();
//			let icons = get_icon_array(((!!cwin)?cwin:desk), true);
let icons;
if (!cwin) icons = Array.from(desk.children).filter(el=>el.className==="icon");
else icons = Array.from(cwin.getElementsByClassName("icon"));
			for (let icn of icons) icon_on(icn,true);
		}
//		else if ((!cwin||cwin.app=="sys.Explorer")&&CUR.ison()){
		else if ((!cwin||cwin.app=="sys.Explorer")){
if (kstr=="c_"){
if (CUR.ison()) {
	CUR.off(true);
}
else {
	CUR.on(true);
}
return;
}
//			if (CUR.ison()) {
			if (kstr=="m_C"){/*Move icons*/
				let r;
				const move_to_win_or_desk=()=>{
					if (!cwin) {
						let par = ICONS[0].parwin;
						let	x=((r.left+r.right)/2)-winx();
						let	y=((r.top+r.bottom)/2)-winy();
						if (par===desk) {
							for (let icn of ICONS) place_in_icon_slot(desk, icn, {X:x,Y:y});
							icon_array_off();
						}
						else {
if (!CUR.ison()){
x=0;y=0;
}
							move_icons(desk_path, (rv)=>{
							}, {clientX:x,clientY:y});

						}
					}
					else {
						move_icons(cwin.fullpath(),(rv)=>{
//							cwin.obj.reload();
//							cwin.obj.update();
						},null,cwin);
					}
				};

				if (!ICONS.length) return;
				if (!CUR.ison()){
					r=ICONS[0].gbcr();
					move_to_win_or_desk();
					return;
				}
				let goticn = CUR.geticon();
				r=CUR.gbcr();
				if (goticn){
					remove_icon_from_icons(goticn);
					if (!ICONS.length) return;
					if (goticn.app !== "sys.Explorer"){
						poperr("Cannot move to a non-folder!");
/*						if (goticn.parwin===desk) {
							cwin=null;
							move_to_win_or_desk();
							return 
						}
						cwin = goticn.parwin;
						move_to_win_or_desk();
*/
						return;
					}
					let r = goticn.gbcr();
					move_icons(goticn.fullpath(), (rv, icns) => {
						if (!rv) {
							return;
						}
						if (Desk.CWIN) window_off(Desk.CWIN);
						if (goticn.parwin&&goticn.parwin !== desk) window_on(goticn.parwin);
						icon_array_off();
						if (goticn.win) goticn.win.obj.reload();
					}, null, null, {
						x: r.left,
						y: r.top
					});
					return;
				}
				move_to_win_or_desk();
				return;
			}
//			}
		}
	}

	if (kstr=="`_A") return window_cycle();
	if (kstr=="c_CA") return toggle_show_windows(); 
	if (kstr=="b_CAS") return toggle_taskbar();
	if (kstr=="l_CAS") return console.clear();
	if (kstr=="t_CAS") return keysym_funcs.test_function();
	if (kstr=="r_CAS") return reload_desk_icons();
	if (kstr=="k_CAS") return (debug_keydown = !debug_keydown);
	if (kstr == "d_CAS") {
		PREV_DEF_ALL_KEYS = !PREV_DEF_ALL_KEYS;
		show_overlay(`Prevent default for all keys: ${PREV_DEF_ALL_KEYS}`);
		return;
	}
	if (cwin) {
		if (cwin.popup) return check_prompt(cwin.popup);
		if (!cobj) return;
/*

Unless your app explicitly overrides them, the system intercepts the <arrow>_S
and <arrow>_CS hotkeys for basic window moving and resizing (of non
maxed/fullscreened wins).

*/
		if (!(cobj.overrides && cobj.overrides[kstr])){
			if (kstr=="f_CAS") return fullscreen_window();
			if (kstr=="n_A") return minimize_window();
			if (kstr=="x_A") return close_window();
			if (kstr=="m_A") return maximize_window();
			if (kstr=="l_CA") return do_toggle_win_layout();
			if (kstr=="w_CA") return toggle_win_chrome();
			if (kstr==="p_CAS") return win_reload();
			if (!is_full) {
				if (kstr.match(/^(RIGHT|LEFT|UP|DOWN)_S$/)) {
					if (is_max) return;
					return move_window(kstr[0]);
				}
				if (kstr.match(/^(RIGHT|LEFT|UP|DOWN)_CS$/)) {
					if (is_max) delete cwin.is_maxed;
					let ch0=chr[0];
					if (ch0=="R"||ch0=="D") return resize_window(ch0);
					else if(ch0=="L") return resize_window("R",true);
					else return resize_window("D",true);
				}
			}
		}
		if (cwin.movediv || cwin.is_minimized) return;
		if (kstr=="r_A" && cobj.onrefresh) return cobj.onrefresh();
		if (cobj.onkeydown) cobj.onkeydown(e, kstr, mod_str);
		return;
	}
/*A lonely escape has escaped to the desktop!*/
	if (kstr == "ESC_") return handle_ESC();
	if (kstr == "f_C") return toggle_fullscreen();
}
this.keydown=dokeydown;
//»
const dokeypress = function(e) {//«
	if (PREV_DEF_ALL_KEYS) e.preventDefault();
	if (CEDICN) return;
	let code = e.charCode;
	if (Desk.CPR) {
		if (Desk.CPR.key_handler && code >= 32 && code <= 126) Desk.CPR.key_handler(null, e, true, code, "");
		return;
	}
	let w = Desk.CWIN;
	if (!w || w.movediv || w.is_minimized || w.popup) return;
//	if (code >= 32 && code <= 126 && w.obj.onkeypress) w.obj.onkeypress(e.key, e, code, "");
	if (code >= 32 && code <= 126 && w.obj.onkeypress) w.obj.onkeypress(e);
}
this.keypress=dokeypress;
//»
const dokeyup = function(e) {//«
	if (CEDICN) return;
	let w = Desk.CWIN;
	let cpr = Desk.CPR;
	let getcpr = () => {
		return Desk.CPR;
	};
	let code = e.keyCode; /* Macros are things that allow sequences of key chords to be entered,in order to call some function or run some program. A new chord is begun when all the keys from the previous chord are released.  */
	let macro_cb = Core.get_macro_update_cb();
	if (macro_cb) { /*Macronator*/
		Core.macro_key_up(code, str => { /*out_cb*/
			macro_cb(str);
		}, macroobj => { /*accept_cb*/
			if (cpr && cpr.is_macro) {
				cpr.done = true;
				setTimeout(() => {
					cpr = getcpr();
					if (cpr) {
						simulate(cpr.ok_button, 'click');
						run_command(macroobj.c);
					}
				}, 250);
			} else Core.call_macro_succ_cb(macroobj);
			Core.set_macro_update_cb(null);
			Core.set_macros(null);
		}, () => { /*reject_cb*/
			if (cpr && cpr.is_macro) {
				setTimeout(() => {
					cpr = getcpr();
					if (cpr) simulate(cpr.ok_button, 'click');
				}, 500);
			} else Core.call_macro_rej_cb();
			Core.set_macro_update_cb(null);
			Core.set_macros(null);
		}, (cpr && cpr.is_macro));
		return;
	}
	if (code == KC['ALT']) {
		alt_tab_presses = 1;
		alt_is_up = true;
//		win_cycle_wins_hidden = false;
		if (num_win_cycles){
			CG.off();
			for (let w of windows){
				if (w.z_hold) w.z = w.z_hold;
				delete w.z_hold;
			}
			if (CWCW) {
				window_on(CWCW, true);
				CWCW.zup();
				if (CWCW.is_minimized) CWCW.unminimize(true);
			}
//			if (w && w.is_minimized && w._button.is_active) w.unminimize(true);
		}
		num_win_cycles = 0;
		have_window_cycle = false;
		CWCW=null;
	}
	else if (code == KC['\x60']) tilde_press = 0;
	if (!w) return;
	if (w.is_minimized||w.popup) return;
//	if (w.obj.onkeyup) w.obj.onkeyup(Core.api.evt2Sym(e), e);
	if (w.obj.onkeyup) w.obj.onkeyup(e, Core.api.evt2Sym(e));
}
this.keyup=dokeyup;
//»

this.onmidi=e=>{let dat=e.data;let which=dat[0];let cwin=Desk.CWIN;if(!cwin)return;let obj=cwin.obj;if(obj.onmidi)obj.onmidi(dat);if(which==176 && obj.onmidiknob)obj.onmidiknob({knob:dat[1],val:dat[2]});else if(which==144 && obj.onmidikeydown)obj.onmidikeydown({key:dat[1],val:dat[2]});else if(which==128 && obj.onmidikeyup)obj.onmidikeyup({key:dat[1],val:0});};


const setsyskeys=use_map=>{//«
//XXXXXXXXXXXXXX
keysym_funcs = {
focus_desktop:()=>{let w=Desk.CWIN;if(w&&(w.is_fullscreen||w.is_maxed))return;window_off(Desk.CWIN);CUR.todesk();},
test_function:()=>{
//	reload_desk_icons();
//popok("Tester!!!");
job_killer();

},
move_to_desktop:()=>{move_icons(desk_path,null,{clientX:0,clientY:0});},
toggle_window_tiling:toggle_window_tiling,
clear_system_cache:clear_system_cache,
toggle_win_chrome:toggle_win_chrome,
toggle_win_layout_mode:toggle_win_layout_mode,
toggle_win_layout:()=>{if(!layout_mode)do_toggle_win_layout();},
save_window:()=>{let w=Desk.CWIN;if(!w||w.is_minimized)return true;w.obj.onsave();return true;},
delete_icons: ()=>{return delete_icons();},
create_new_folder:()=>{return create_new_folder()},
window_cycle: ()=>{return window_cycle();},
reset: ()=>{return handle_ESC();},
toggle_desktop: ()=>{return toggle_show_windows();},
close_window: close_window,
fullscreen_window: fullscreen_window,
minimize_window: minimize_window,
maximize_window: maximize_window,
window_left: ()=>{if(!Desk.CWIN)return null;move_window('L');return true;},
window_right: ()=>{if(!Desk.CWIN)return null;move_window('R');return true;},
window_up: ()=>{if(!Desk.CWIN)return null;move_window('U');return true;},
window_down: ()=>{if(!Desk.CWIN)return null;move_window('D');return true;},
window_left_small: ()=>{if(!Desk.CWIN)return null;move_window('L',true);return true;},
window_right_small: ()=>{if(!Desk.CWIN)return null;move_window('R',true);return true;},
window_up_small: ()=>{if(!Desk.CWIN)return null;move_window('U',true);return true;},
window_down_small: ()=>{if(!Desk.CWIN)return null;move_window('D',true);return true;},
window_resize_l: ()=>{if(!Desk.CWIN)return null;resize_window('L');return true;},
window_resize_r: ()=>{if(!Desk.CWIN)return null;resize_window('R');return true;},
window_resize_u: ()=>{if(!Desk.CWIN)return null;resize_window('U');return true;},
window_resize_d: ()=>{if(!Desk.CWIN)return null;resize_window('D');return true;},
window_resize_l_small: ()=>{if(!Desk.CWIN)return null;resize_window('L',true,true);return true;},
window_resize_r_small: ()=>{if(!Desk.CWIN)return null;resize_window('R',true,true);return true;},
window_resize_u_small: ()=>{if(!Desk.CWIN)return null;resize_window('U',true,true);return true;},
window_resize_d_small: ()=>{if(!Desk.CWIN)return null;resize_window('D',true,true);return true;},
popmacro:()=>{WDG.popmacro();return true;},
reload_app_window:()=>{return win_reload(Desk.CWIN)},
reload_desk_icons:reload_desk_icons,
open_terminal: open_terminal,
open_app:(name,if_force)=>{open_app(name||"None",null,if_force);}

}

Desk.keysym_funcs = keysym_funcs;

if (use_map) keysym_map = use_map;
else keysym_map = std_keysym_map;

}
//»

const handle_ESC = (if_alt) => {//«
	window.getSelection().removeAllRanges();
	desk.reset();
	WDIE = null;
	CDICN = null;
	CRW = null;
	CDW = null;
	cldragimg(true);
	IA = [];
	CG.off();
	if (layout_mode) return toggle_win_layout_mode();
	if (ICONS.length) return icon_array_off();
	if (windows_showing) toggle_show_windows();
};//»

const desk_macros={"abc":{c:'sleep 1;echo "Hello from Macronator XYZ!!!";sleep 1;echo "End it yend it!"',n:"Macro XYZ"}};
this.set_macros=()=>{Core.set_macros(desk_macros);};

//»
//Menu«

const get_desk_context=()=>{//«
	let menu = DESK_CONTEXT_MENU.slice();
	return menu;
};//»

//»
//Util«

const job_killer=async()=>{
	let rv = await wdgapi.popin("Job id?",{title:"Job Killer"});
	if (!rv) return;
	let num = rv.pi();
	if (!(isint(num) && num > 0)) return poperr("Need a positive integer!");
	if (!Core.kill_job(num)) poperr("No such job!");
};
const try_clock_update=()=>{//«
	if (Date.now() - last_clock_time > MIN_MS_DIFF_TO_UPDATE_CLOCK) system_clock.update();
};//»
const clearpop=()=>{let pop=Desk.CPR;if(pop&&pop.ok)pop.ok();};
const z_compare = (a, b) => {
	if (pi(a.style.zIndex) < pi(b.style.zIndex)) return 1;
	else if (pi(a.style.zIndex) > pi(b.style.zIndex)) return -1;
	return 0;
};
const clear_system_cache = cb => {//«
	WDG.popyesno("Clear code cache?", ret => {
		if (!ret) return;
		fs.rm_fs_file("/code", rv => {
			if (!rv) return poperr("Could not clear the cache!");
			let syskids = fs.get_root().KIDS.code.KIDS;
			for (let k of getKeys(syskids)) {
				if (k == "." || k == "..") continue;
				delete syskids[k];
			}
			cb && cb();
		}, true, true, DSK);
		popok("Cache cleared");
	});
	return true;
}//»
const run_command = (str, cb) => {//«
	Core.load_mod("sys.shell", rv => {
		if (!rv) return;
		MODS["sys.shell"].eval(str, cb);
	});
}//»
this.lock_system=()=>{make_popup({STR:"The system is locked! Is it open in another tab?",TYPE:"error",NOBUTTONS:true});};

const fullpath_to_path_and_ext=(path)=>{return getNameExt(path, true)}

const gbid=(id)=>{return document.getElementById(id)}
const pi=x=>{return parseInt(x, 10)}
const noprop=e=>{e.stopPropagation()}
const nopropdef=e=>{e.preventDefault();e.stopPropagation()}
const no_select=(elm)=>{elm.style.userSelect="none"}

this.set_cmenu_state=arg=>{cmenu_active=arg};
this.curicon=()=>{return CUR.geticon();}
this.curwin=()=>{return Desk.CWIN}
this.get_desk=()=>{return desk}
this.desk_path=()=>{return desk_path}

//»
//Protos«

(function(){


let P;
P = SVGElement.prototype;
P.gbcr=function(){return this.getBoundingClientRect()}


P = HTMLDivElement.prototype;
P.set_icon_listeners=function(){
if (this.className!=="icon") return;
let icon = this;
let wrapper = icon.childNodes[0];

icon.shake = () => {
	icon.style.animation = "shake 0.82s cubic-bezier(.36,.07,.19,.97)\x20both";
	icon.addEventListener("animationend", () => {
		icon.style.animation = "";
	});
};
this.save=()=>{
	if (this.parwin!==desk) return;
	localStorage[icon.fullpath()]=`${icon.col} ${icon.row}`;
};
icon.add_link = if_broken => {//«
	let link_str = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128"><g style="opacity:1;" transform="translate(0 0)"><rect style="fill:#fff;stroke:#000;stroke-width:3.5;" x="68" y="68" height="60" width="60" /><g style="fill:none;stroke:#000;stroke-width:3.234;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="134.24921" y="-51.794231" transform="matrix(0.36548997,0.93081528,-0.93081528,0.36548997,0,0)" /><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="143.13367" y="-16.949551" transform="matrix(0.6743771,0.73838711,-0.73838711,0.6743771,0,0)" /><rect width="11.473064" height="24.621971" rx="6.5" ry="6.5" x="137.76695" y="21.29994" transform="matrix(0.90331408,0.42897981,-0.42897981,0.90331408,0,0)" /></g></g>';
	let broken_str = '<g style="fill:none;stroke:red;stroke-width:8px"><path d="M 128,128 70,78" /></g>';
	if (if_broken) link_str += broken_str;
	link_str += "</svg>";
	let img = util.make('img');
	img.icon = icon;
	let link_div = make('div');
	wrapper.add(link_div);
	link_div.add(img);
	link_div.pos = "absolute";
	link_div.op=0.66;
	link_div.r=0;
	link_div.b=0;
	img.src = 'data:image/svg+xml;base64,' + btoa(link_str);
	img.style.maxWidth = ICON_DIM;
};//»
icon.add_sys=()=>{//«
	let sysdiv = mkdv();
	sysdiv.innerHTML="\u2699";
	sysdiv.fs=0.5*ICON_DIM;
	sysdiv.pos="absolute";
	sysdiv.bgcol="#000";
	sysdiv.bgcol="rgba(0,0,0,0.75)";
	wrapper.add(sysdiv);
	center(sysdiv,wrapper);
};//»
wrapper.draggable=true;
wrapper.ondragstart = e => {//«
	e.preventDefault();
	e.stopPropagation();
	let par = icon.parentNode;
	CDICN = icon;
	CDL = make_cur_drag_img();
	if (par !== desk) par = par.parentNode; /*Sad but true(for now):origins are always the mainwin,NOT topwin OR icon_div*/
	desk.style.cursor = "grabbing";
	CDL.loc(e.clientX + CDL_OFFSET - winw(), e.clientY + CDL_OFFSET - winy());
	desk.add(CDL);
};//»
wrapper.onmousedown = e => {//«
	e.stopPropagation();
	if (e.button != 0) return;
	let par = icon.parwin;
	if (par === desk) {
		window_off(Desk.CWIN);
		desk.area.focus();
	}
	else window_on(par);
	if (e.ctrlKey&&ICONS.includes(icon)) icon_off(icon,true);
	else if (!ICONS.includes(icon)) {
		if (!e.ctrlKey) icon_array_off();
		icon_on(icon,true);
	}
};//»
wrapper.onclick = e => {//«
	e.stopPropagation();
};//»
wrapper.oncontextmenu = e => {//«
	if (!e.isFake) nopropdef(e);
	if (have_window_cycle) return;
	deskcontext({
		x: e.clientX,
		y: e.clientY
	}, {
		items: ["Rename", () => {
			setTimeout(() => {
				init_icon_editing(icon);
			}, 25);
		}, "Delete", () => {
			delete_icons(icon);
		}]
	});
};//»
wrapper.ondblclick = e => {//«
	e.stopPropagation();
	icon.dblclick = true;
	icon_dblclick(icon, e);
};//»
if (icon.app == "sys.Explorer") {//«
	let didleave;
	let isopen = false;
	let in_transit = false;
	let not_allowed = false;
	let on = () => {//«
		isopen = true;
		wrapper.style.cursor = "copy";
		if (!CDL) return;
		CDL.into(icon.name); /*icon.style.boxShadow="0px 0px 20px 7px #5f5";*/
	};//»
	let off = () => {//«
		if (in_transit) return;
		not_allowed=false;
		isopen = false;
		icon.style.cursor = "";
		wrapper.style.cursor="";
		if (!CDL) return;
		CDL.reset();
	};//»
	wrapper.onmouseover = e => {//«
		e.stopPropagation();
		if (!CDICN) return;
		if (CDICN === icon) return;
		if ((CDICN.path === icon.fullpath(true)) || (check_if_newpath_is_in_itself(CDICN.fullpath(), icon.fullpath(true) + "/" + CDICN.name))) {
			not_allowed = true;
		}
		didleave = false;
		if (!CDICN) return;
		if (not_allowed) CDL.nogo(wrapper);
		else if (!didleave) on();
	};//»
	wrapper.onmouseout = e => {//«
		off();
		if (CDICN === icon) return;
		e.stopPropagation();
		if (!CDICN) return;
		didleave = true;
	};//»
	wrapper.onmouseup = e => {//«
		e.stopPropagation();
		if (CDICN) {
			remove_icon_from_icons(icon);
			if (!ICONS.length) return;
			desk.style.cursor = "";
			if (not_allowed) {
				if (IA.length) {
					for (let icn of IA) icn.shake();
				} else CDICN.shake();
			}
			if (!isopen) {
				CDICN = null;
				off();
				cldragimg();
				return;
			}
			let r = icon.gbcr();
			in_transit = true;
			move_icons(icon.fullpath(), rv => {
				in_transit = false;
				off();
				if (Desk.CWIN) window_off(Desk.CWIN);
				if (icon.parwin !== desk) window_on(icon.parwin);
//					icon_on(icon);
				CDICN = null;
				cldragimg();
for (let icn of ICONS) icon_off(icn);
ICONS=[];
if (icon.win) icon.win.obj.reload();
			}, null, null, {
				x: r.left,
				y: r.top
			});
			return;
		}
		if (DDIE) {
			DDIE = null;
			DDD.loc(-1, -1);
			DDD.w = 0;
			DDD.h = 0;
		}
		if (icon.parwin === desk) return;
		icon.parwin.main.clear_drag();
	};//»
}//»


};
P.fullpath = function(if_use_link_path) {
	if (this === desk) return desk_path;
	let _this = this;
	let path;
	if (this.className == "mainwin") _this = this.parentNode;
	let cl = _this.className;
	if (cl == "icon" && _this.link && if_use_link_path) path = _this.link;
	else {
		path = (_this.path ? _this.path : "/") + "/" + _this.name;
		if (_this.ext) path = path + "." + _this.ext;
	}
	return path.regpath();
}
P.replacepath=function(oldpath, newpath){if(this.type!=="window")return cwarn("Got replacepath() call for type="+this.type);let patharr=this._path.split("/");let oldarr=oldpath.split("/");for(let i=0;i<oldarr.length;i++)patharr.shift();this._path=(newpath+"/"+patharr.join("/")).regpath();}
if (!P.scrollIntoViewIfNeeded) P.scrollIntoViewIfNeeded = P.scrollIntoView;
P.deref_link = function(cb) {//«
	if (!cb) cb = () => {};
	let getnameext = (s) => {
		let name = s.replace(/^.+\//, "");
		let marr;
		if (marr = name.match(/^(.+)\.([a-z][a-z0-9]*)$/i)) {

			if (marr && marr[2] && all_extensions.includes(marr[2])) return [marr[1], marr[2]];
		}

		return [name];
	};
	let icon = this;
	if (!icon.link) return cb();
//log("LINK", this);
	let realname_arr = getnameext(icon.name);
	let realname = realname_arr[0];
	let realext = realname_arr[1];
	let realnameext = realname;
	if (realext) realnameext = realname + "." + realext;
	let realapp;
	if (realext) realapp = ext_to_app(realext);
	else realapp = DEF_BIN_OPENER;
	let parts = icon.link.split("/");
	if (!parts[parts.length - 1]) parts.pop();
	let fname = parts.pop();
	let parpath = parts.join("/");
	if (!parpath) parpath = "/";
	path_to_obj(parpath, ret => {
		let broken = false;
		let kids;

		const doit=()=>{
			let app;
			let name;
			let ext;
			const attach=(objarg)=>{
				if (!objarg) broken = true;
				else {
					if (objarg.APP == "sys.Explorer") {
						app = "sys.Explorer";
						name = fname;
					} else {
						let ret = getnameext(fname);
						if (!(ret && ret[1])) {
							app = DEF_BIN_OPENER;
							name = fname;
						} else {
							name = ret[0];
							ext = ret[1];
							set_icon_name(icon, realnameext, true);
							app = ext_to_app(ext);
						}
					}
				}
				if (broken) {
					app = "BrokenLink";
					name = fname;
				}
				if (app == "Application") icon.deref_appicon(parpath, name, true);
				else {
					let imdiv = icon.imgdiv;
					icon.wrapper.childNodes[0].del();
					igen.attach({
						PAR: imdiv,
						TYPE: "appicon",
						APP: app
					}, () => {
						icon.add_link(broken);
					});
				}
				icon.linkname = name;
				icon.linkext = ext;
				icon.linkpath = parpath;
				icon.linkapp = app;
				let tit;
				if (broken) tit = "Broken Link->" + icon.link;
				else tit = "Link to " + app + "\xa0->\xa0" + icon.link;
				icon.title = tit;
				cb();
			};
			if (!broken) {
				let obj = kids[fname];
				if (!obj) {
					broken = true;
					attach();
				} else {
					if (obj.APP == "Link") path_to_obj(obj.LINK, ret => {
						attach(ret);
					});
					else attach(obj);
				}
			} else attach();
		};
		if (!ret) {
			broken = true;
			return doit();
		}
		if (!ret.done) {
			let rtype = ret.root.TYPE;
			let func;
			if (rtype == "fs") func = populate_fs_dirobj;
			else if (rtype == "remote") func = populate_rem_dirobj;
			else {
				broken = true;
				doit();
				return;
			}
			func(parpath, ret2 => {
				kids = ret2;
				if (!kids) broken = true;
				doit();
			}, ret);
		} else {
			kids = ret.KIDS;
			doit();
		}
	});
}//»
P.deref_appicon = async function(patharg, namearg, if_link) {//«
	let icon = this;
	if (!icon.imgdiv) return;
	let arr = await fsapi.readFile(((patharg || icon.path) + "/" + (namearg || icon.name) + ".app").regpath());
	let app;
	try{
		app=JSON.parse(arr.join("\n")).app;
	}
	catch(e){
		app="Unknown";
	}
	icon.icon.del();
	let tit = app.split(".").pop();
	if (icon.ext) tit += "\xa0(" + icon.ext + ")";
	icon.title = tit;
	await igen.attach({
		TYPE: "appicon",
		APP: app,
		PAR: icon.imgdiv,
	});
	icon.imgdiv.img.icon=icon;
/*
	fs.get_json_file(((patharg || icon.path) + "/" + (namearg || icon.name) + ".app").regpath(), async ret => {
		let app;
		let dev = false;
		if (!ret) app = "Unknown";
		else {
			app = ret.app || "Unknown";
			if (app == "sys.Develop" && isstr(ret.dev)) {
				app = ret.dev;
				dev = true;
			}
		}
		icon.icon.del();
		let tit = app.split(".").pop();
		if (icon.ext) tit += "\xa0(" + icon.ext + ")";
		icon.title = tit;
		await igen.attach({
			TYPE: "appicon",
			APP: app,
			PAR: icon.imgdiv,
		});
		icon.imgdiv.img.icon=icon;
		if (dev) icon.add_sys();
	}, DSK);
*/
}//»
P.ispar=function(elem){let node=elem.parentNode;while(node !=null){if(node==this)return true;node=node.parentNode;}return false;}
P.setid = function(idarg) {this.id = idarg;return idarg;}
P.gbcr=function(){return this.getBoundingClientRect()}
P.rect = function(){return this.getBoundingClientRect();}
P.add=function(...args){for(let kid of args){if(kid.getAttribute){if(kid.getAttribute("class")=="icon"){if(this==desk){kid.labelcol=desk_icon_label_col;kid.fontcol=desk_icon_font_col;}else{kid.labelcol="";kid.fontcol="#000";}}}this.appendChild(kid);}}
P.is_in_folder=function(win){if(this.type=="icon"){let winpath;if(win==desk)winpath=desk_path;else winpath=win.path+"/"+win.name;let winarr=winpath.split("/");winarr.shift();let iconarr=this.path.split("/");iconarr.push(this.name);iconarr.shift();for(let i=0;i<iconarr.length;i++){if(!winarr[i] ||(winarr[i]!=iconarr[i]))return false;}return true;}}
P.winon=function(){window_off(Desk.CWIN);Desk.CWIN=null;window_on(this);}
P.reload=function(){if(this.type=="window")win_reload(this);}
P.refresh=function(){if(!(this.type=="window" && this.app=="sys.Explorer"))return;for(let k of this.icons)k.del();this.icons=[];reload_icons(this);}
P.del=function(){let par=this.parentNode;if(!par)return;par.removeChild(this);}
P.close=function(){simulate(this.close_button, 'click');}
P.evt = function(type) {simulate(this, type);}
P.sim = function(which) {simulate(this, which);}
P.down=function(){simulate(this,'mousedown')}
P.on=function(){var type=this.type;if(type=="icon")icon_on(this);else if(type=="window")window_on(this);}
P.off=function(){var type=this.type;if(type=="icon")icon_off(this);else if(type=="window")window_off(this);}

})();


//»
//Init«

this.init = async cb => {
	let home_path = (DSK&&DSK.home_path) || globals.home_path;
	let initstep = NS.initstep;
	let initlog = NS.initlog;
	let step;
	let stepmode = NS.stepmode;
	desk_path = (DSK&&DSK.desk_path)||globals.desk_path;
	step=await initstep("Finding 'keysym.json'");
	let keysym_str = await Core.api.getInitStr("config/desk/keysym.json",{def:DEF_KEYSYM_STR});
	if (keysym_str) step.ok();
	else step.fail(true);
	try{
		step=await initstep("Parsing 'keysym.json'");
		std_keysym_map = JSON.parse(keysym_str);
		step.ok();
	}
	catch(e){
		step.fail(true);
		std_keysym_map = JSON.parse(DEF_KEYSYM_STR);
		initlog("Reverting to the standard keysym string (see console)");
		console.error('Could not parse the json, using instead:'); 
		console.log(std_keysym_map);
	}
	const doresize = (e, warg, harg)=>{
		let _h = winh(true);
		desk.w = warg||winw();
		desk.h = harg||_h;
		desk.style.backgroundSize = warg||winw() + " " + harg||_h;
		background_div.w = warg||winw();
		background_div.h = harg||_h;
		background_div.style.backgroundSize = warg||winw() + " " + harg||_h;
		desk_coldiv.w = warg||winw();
		desk_coldiv.h = harg||_h;
		desk_coldiv.style.backgroundSize = warg||winw() + " " + harg||_h;
		desk_imgdiv.w = warg||winw();
		desk_imgdiv.h = harg||_h;
		desk_imgdiv.style.backgroundSize = warg||winw() + " " + harg||_h;
		CG.w = warg||winw();
		CG.h = harg||_h;
//		desk.onresize();
	};
	if (lotw_mode) Desk.resize = doresize;
	else window.onresize = doresize;

	window.onfocus=(e)=>{
		try_clock_update();
	};

	step = await NS.initstep("Generating the desktop DOM element");
	await make_desktop();
	await make_taskbar();
	if (stepmode) {
		desk.op = STEP_MODE_DESK_OP;
		background_div.op = STEP_MODE_DESK_OP;
		desk_coldiv.op = STEP_MODE_DESK_OP;
	}
	step.ok();
	desk.add(CUR);
	CUR.set();
	CUR.on();
	step=await initstep(`Creating icons from the file entries found in 'desk_path' (${desk_path})`);
	await reloadIcons(desk);
	step.ok();
	setsyskeys();
	step=await initstep("The desktop environment is now at your service!");
	NS.initlogelem.parentNode.del();
	if (stepmode) {
		desk.op = 1;
		background_div.op = 1;
		desk_coldiv.op = 1;
	}

	if (localStorage[`taskbar_hidden:${desk_path}`]) taskbar.hide();
	taskbar.op=TASKBAR_OP;
	setTimeout(()=>{
		taskbar.style.transition = "bottom 0.33s ease 0s";
	},0);

	if (lotw_mode){}
	else if (!globals.noevents) {
		document.onkeypress = dokeypress;
		document.onkeydown = dokeydown;
		document.onkeyup = dokeyup;
	}
	cb();
	desk.area.focus();//!!!!!!!!!!!!!!!!!  IMPORTANT  !!!!!!!!!!!!
}
//»



