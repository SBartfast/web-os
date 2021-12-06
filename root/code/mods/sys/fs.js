
/*Everywhere we update a KIDS object«

this.mk_fs_dir -> mkfobj
  	Called from:
		root/code/libs/fs.js (const dounzip=(blob))
		root/code/apps/util/Unzip.js
		root/code/mods/sys/shell.js ('mkdir')


const get_or_make_dir -> dir.getDirectory (twice)

const move_kids -> destparobj.KIDS[newname] = newkid;

const save_fs_file -> obj.KIDS[fname] = kid;

const mkdirkid -> kid.KIDS = kidsobj;

const populate_fs_dirobj_by_path ->
	kids[name] = mkdirkid(parobj, name, true, 0, 0, patharg);
	kids[name] = mkdirkid(parobj, name, false, file.size, timestr, patharg, null, file, ent);
	kids[name].LINK = rv;

const populate_rem_dirobj -> kids[fname] = kidobj;

const populate_iface_dirobj -> 
	ifkids[ch] = dir;
	kids[conn] = dir;

const populate_serv_dirobj ->
	curkids[dirname] = gotdir;
	curkids[name] = kidobj;

this.get_term_fobj -> const FileObj -> path_to_obj(get_fullpath(fname, true, cur_dir), winid => { ->
//	dirid.KIDS[usefname] = obj;
	dirid.KIDS[usefname] = obj;
  	Called from:
		root/code/mods/sys/shell.js

const FileSaver=function(){ -> const make_kid_obj -> 
	parobj.KIDS[fname] = kid;

this.add_new_kid -> 
	par.KIDS[name] = obj;
  	Called from:
		root/code/libs/fs.js (tar command)
		core.js (this.save_hook)
		desk.js (const make_icon_by_path)


const init_midi ->
	root.KIDS.dev.KIDS.midi = {NAME:"midi",APP:"device",root:root.KIDS.dev,par:root.KIDS.dev};

this.start_service ->
	servkids[name] = parobj;


»*/

/*Step 1: Get rid of all 74 'this.' idioms, and replace with an api Promise call«

this.paths_to_data
this.set_desk
this.read_file
this.path_to_contents
this.getbin
this.ptw
this.path_to_obj
this.normalize_path
this.get_fullpath
this.path_to_par_and_name
this.get_path_of_object
this.objpath
this.get_path_of_obj
this.get_distinct_file_key
this.get_root
this.check_user_perm
this.save_remote
this.get_rem_file
this.mk_rem_file
this.check_fs_dir_perm
this.do_fs_rm
this.mk_fs_dir
this.get_or_make_dir
this.move_kids
this.mv_by_path
this.rm_fs_file
this.touch_fs_file
this.get_fs_ent_by_path
this.get_fs_file_from_fent
this.check_fs_by_path
this.get_fs_data
this.get_fs_bytes
this.get_json_file
this.get_fs_by_path
this.getfile
this.save_fs_by_path
this.savefile
this.write_fs_file
this.save_fs_file
this.get_file_len_and_hash_by_path
this.dogzip
this.com_mv
this.make_local_tree
this.make_all_trees
this.populate_dirobj_by_path
this.populate_dirobj
this.popdir
this.populate_fs_dirobj
this.populate_rem_dirobj
this.app_is_installed
this.install_app
this.getwasmmod
this.getstatmod
this.getmod
this.get_obj_listing
this.get_term_fobj
this.get_serv_func
this.event_to_files
this.drop_event_to_bytes
this.add_new_kid
this.mk_desk_icon
this.mv_desk_icon
this.SynthEvent
this.write_to_device
this.read_device
this.gp_buttons
this.gp_axes
this.get_all_gp_events
this.init_midi
this.get_device
this.start_service
this.stop_service
this.read_fifo
this.readFileStream

»*/

/*!!!   I did not know about this--> webkitResolveLocalFileSystemURL()   !!!//«

Lets you look up the entry for a file or directory with a local URL.

void resolveLocalFileSystemURL(
  in DOMString url,
  in EntryCallback successCallback,
  in optional ErrorCallback errorCallback
);

Parameters
url
The URL of a local file in the file system.

successCallback
The success callback that is called when the browser provides the file or directory for the supplied URL.

errorCallback
The error callback that is called when errors happen or when the request to obtain the entry object is denied.

Returns
None.

Exceptions
This method can raise an FileError with the following code:

Exception	Description
ENCODING_ERR	The syntax of the URL was invalid.
NOT_FOUND_ERR	The URL was structurally correct, but refers to a resource that does not exist.
SECURITY_ERR	The application does not have permission to access the file system interface.

//»*/

/* When doing: $ cp /loc/somedir newname//«

...it doesn't understand that somedir is a remote Folder, and the new file at newname is 
just a 0 length file.

_getfilehash in populate_rem_dirobj needs work (if it should be used there at
all). It doesn't make too much sense as an option for 'ls'.  It only makes
sense when it is used by something like the syncallfiles command in admin.lib.


Need to scan through everything with a fine-tooth comb, looking for the vim pattern:
\<Desk\>, and make sure that dsk.Desk is called when necessary!!!!!!!!!!!!!!!!!!!!!


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!Remote copying doesn't work in LOTW.app!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      ----  This is type=="remote" !!!
      v
cp /site/root/code/apps/games/Arcade.js .
cat Arcade.js

But this works:
cat /site/root/code/apps/games/Arcade.js > yim.js
cat yim.js

Still uses root (global), instead of dsk.root||root

populate_iface_dirobj

populate_serv_dirobj
this.get_serv_func
this.start_service
this.stop_service
Auto converting from blob to text:
Do we want to test the first n bytes (and maybe take random samples) of a file
without a known text extension to automagically send a text string to the output stream?
This is the current way that is commented out in read_file.
if (is_blob){
	if (!fname.match(/\.[a-zA-Z0-9]{1,4}$/)) {
		let got_nonprint = false;
		for (let i = 0; i < 32; i++) {
			let ch = ret2[i];
			if (!ch) break;
			if (!(ch == 9 || ch == 10 || (ch >= 32 && ch <= 126))) {
				got_nonprint = true;
				break;
			}
		}
		if (!got_nonprint) {
			is_blob = false;
			ret2 = Core.api.bytesToStr(ret2);
		}
	}
}
»*/

//Imports«

const root = arg;
const fsobj = this;
const{api:capi,fs_url,mod_url,xget,xgetobj,sys_url,log,cwarn,cerr,NS,globals}=Core;
const{FSLET, FSBRANCH, FSPREF,dev_mode,dev_env,fs_root,lst,util}=globals;
const{strnum,isid,isarr,isobj,isfunc,isnum,isnull,isint,isstr}=util;
const{isEOF,isArr,isStr,xgetText}=capi;
const ispos = arg=>{return isnum(arg,true);}
const isneg = arg=>{return isnum(arg,false);}
const isnotnegint = arg=>{return isint(arg, true);}

//»


//Var«

const api={};
const register_fs_api_func=(name,func)=>{if (api[name]) throw new Error(`The fs api function (${name}) already exists!`);api[name] = func;};

const TEXT_EXTENSIONS = [//«
"txt",
"sh",
"js",
"json",
"cfg",
"app",
"html",
"htm",
"css",
"bashrc",
"synth"
];//»

const MAX_REMOTE_SIZE = 1 * 1024 * 1024;
const MB = 1024*1024;
let output_window=null;
let output_doc=null;
let Desk, desk, desk_path;
let objpath;
let MAX_FILE_SIZE = 25*MB;

const root_dirs = ["tmp", "usr", "var", "code", "home", "etc", "runtime"];
this.root = root;

const MAX_DAYS = 90;//Used to determine how to format the date string for file listings
const MAX_LINK_ITERS = 8;
const rem_cache = {};

const device_arr = [//«
	"mic",
	"null",
//	"midi",
	"console", 
	"popup", 
	"window",
	"download",
//	"echo",
	"stderr",
	"stdout",
	"broadcast"
];//»

const NUM_AUTO_EVENTS = 3;
const devices = {};
const midi_cbs = [];
let midi;

//»

//Util/Generic«

this.set_desk=function(arg){Desk=arg;desk_path=Desk.desk_path();desk=Desk.get_desk();}

const allow_sys_perms = () => {return true;};

//const read_file = (fname, cb, opts = {}) => {
const read_file = (fname, cb, opts = {}, killcb_cb) => {//«
	let _;
	if (!opts) opts = {};
	const dsk = opts.DSK;
	const noop = () => {
		return "";
	};
	const exports = opts.exports || {};
	_ = exports;
	const is_root = _.is_root || opts.ROOT || opts.isRoot || opts.root || false;
	const get_var_str = _.get_var_str || noop;
	const kill_register = _.kill_register || noop;
	const tmp_env = _.tmp_env || {};
	const cur_dir = _.cur_dir || "/";
	const werr = _.werr || Core.cerr;
	const EOF = opts.EOF || {
		EOF: true
	};
	const mime_of_path = Core.mime_of_path;
	const text_mime = Core.text_mime;
	const ptw = (str, cb, if_getlink) => {
		if (!str.match(/^\//)) str = (cur_dir + "/" + str).regpath();
		path_to_obj(str, cb, is_root, if_getlink, dsk);
	};
	const _get_fullpath = (path, if_no_resolve, no_deref_link) => {
		return get_fullpath(path, if_no_resolve, cur_dir, no_deref_link);
	};
	const _get_rem_file = (path, cb, if_no_cache, if_local, if_text, if_bytes) => {
		let fullpath = _get_fullpath(path);
		if (!fullpath) return cb();
		get_rem_file(fullpath, cb, {
			ASBYTES: if_bytes,
			TEXT: if_text,
			NOCACHE: if_no_cache
		}, if_local);
	};
	ptw(fname, (ret, lastdir, usepath) => {
		if (!ret) return cb(null, null, "No such file:\x20" + fname);
		if (ret.APP == "sys.Explorer") return cb(null, null, fname + ":\x20is a directory");
		if (!get_var_str("DEV_DL_FNAME")) tmp_env.DEV_DL_FNAME = ret.NAME;
		let path = get_path_of_object(ret);
		cb(null, path);
		let ext = path.split(".").pop();
		let is_blob = !TEXT_EXTENSIONS.includes(ext);
		let isbin = opts.binary||opts.BINARY;
		if (opts.text || opts.FORCETEXT || (get_var_str("FORCE_TEXT").match(/^t(rue)?$/i))) is_blob = false;
		let type = ret.root.TYPE;
		if (type == "fs") {
			if (ret.APP == "FIFO") {
				let killfunc = read_fifo(ret, cb);
				kill_register(cb => {
					killfunc();
					cb && cb();
				});
			} else {
				get_fs_by_path(path, (ret2, err) => {
					if (ret2) {
						if (isbin) {
							cb(ret2);
							cb(EOF);
							return;
						}
						if (is_blob) {}
						else ret2 = Core.api.bytesToStr(ret2);
						if (is_blob) cb(new Blob([ret2.buffer], {
							type: "blob"
						}));
						else cb(ret2.split("\n"));
					} else if (util.isstr(err)) cb(null, null, err);
					cb(EOF);
				}, {
					start: opts.start,
					end: opts.end,
					BLOB: true,
					ROOT: is_root,
					DSK: dsk
				});
			}
		} else if (type == "remote" || type == "local") {
			_get_rem_file(path, ret => {
				if (isstr(ret)) cb(ret.split("\n"));
				else cb(ret);
				cb(EOF);
			}, true, (type == "local"), !is_blob, isbin);
		} else if (type == "device") {
			let devopts = {};
			if (path.match(/^\/dev\/gamepad\//)) devopts.INTERVAL = true;
			else if (path == "/dev/broadcast") {
				cb(Core.get_channel_message());
				cb(EOF);
				return;
			}
			read_device(path, (ret, kill_cb) => {
				if (kill_cb) {
					if (killcb_cb) return killcb_cb(kill_cb);
					return kill_register(kill_cb);
				}
				else if (isnull(ret)) cb(EOF);
				else cb(ret, null, 1)
			}, devopts);
		} else if (type == "service") {
			if (ret.APP == "Var") {
				if (ret.VAL instanceof Function) {
					if (ret.par._ && ret.par._.is_job) {
						let kill_cb;
						if (ret.NAME == "stdout") kill_cb = ret.par._.set_stdout_cb(cb);
						else if (ret.NAME == "stderr") kill_cb = ret.par._.set_stderr_cb(cb);
						else return cb(null, null, fname + "\x20:Invalid job read path");
						if (kill_cb instanceof Function) kill_register(kill_cb);;
					} else {
						let kill_cb = ret.VAL(cb, get_var_str);
						if (kill_cb instanceof Function) kill_register(kill_cb);;
					}
				} else {
					cb(ret.VAL);
					cb(EOF);
				}
			} else {
				werr("Write only");
				cb(EOF);
			}
		} else if (type == "iface") {
			let api = NS.api.iface;
			if (!api) return cb(EOF);
			cwarn("iface read:" + path);
			let arr = path.split("/");
			arr.shift();
			arr.shift();
			let ch = arr.shift();
			let chan = api.getChannel(ch);
			let which = arr.shift();
			if (chan) {
				if (!arr.length) {
					if (which == "inbox") cb(chan.getMessage());
				} else {
					let conn = chan.getConnection(which);
					if (conn) {
						let port = arr.shift();
						if (!port) {
							cerr("GOTNOPORT!!!");
						} else {
							if (port === "sms") {
								let mess = conn.get_sms();
								if (mess) cb(mess);
							}
						}
					} else {
						cerr("Channel returned no connectection named", which);
					}
				}
			} else {
				cerr("Channel not found!!!", ch);
			}
			cb(EOF);
		} else {
			cb(EOF);
			cwarn("read_file():Skipping type:" + type);
		}
	}, null, null, dsk);
};
this.read_file=read_file;
//»
const getkeys=(obj)=>{var arr=Object.keys(obj);var ret=[];for(var i=0;i<arr.length;i++){if(obj.hasOwnProperty(arr[i]))ret.push(arr[i]);}return ret;}
const path_to_data=(fullpath)=>{return new Promise((res,rej)=>{path_to_contents(fullpath,ret=>{if(ret)return res(ret);rej("Not found:\x20"+fullpath);},true);})}
this.paths_to_data=(path_arr,cb)=>{var proms=[];for(let path of path_arr)proms.push(path_to_data(path));Promise.all(proms).then(cb).catch(err=>{cb(null,err);});}
const path_to_contents = (fullpath, cb, if_dat, stream_cb, dsk) => {//«
	if (if_dat || stream_cb) {} else cwarn("path_to_contents():" + fullpath);
	path_to_obj(fullpath, ret => {
		if (!ret) return cb();
		let type = ret.root.TYPE;
		if (type == "fs") get_fs_by_path(fullpath, cb, {
			BLOB: if_dat
		});
		else if (type == "remote" || type == "local") get_rem_file(fullpath, cb, {
			ASBYTES: if_dat
		}, type === "local", stream_cb);
		else {
			cerr("path_to_contents:WHAT TYPE? " + ret.root.TYPE);
			cb()
		}
	}, null, null, dsk);
}

this.path_to_contents=path_to_contents;
this.getbin = (fullpath, cb, dsk) => {
	path_to_contents(fullpath, cb, true, null, dsk);
}
//»
const path_to_obj = (str, allcb, if_root, if_get_link, dsk, alliter) => {//«
	if (!allcb) allcb = () => {};
	if (!(str && str.match(/^\//))) {
		return allcb();
	}
	let isrem = false;
	let iter = -1;
	let rootarg;
	let fsarg;
	if (dsk) {
		rootarg = dsk.root;
		fsarg = dsk.fs_root;
	}
	const deref_link=(link, cb, if_dir_only)=>{
		path_to_obj(link, (ret, lastdir, usepath) => {
			if (!ret) cb(null, lastdir, usepath);
			else if (ret.APP == "sys.Explorer") cb(ret);
			else if (ret.APP == "Link") deref_link(ret.LINK, cb);
			else {
				if (if_dir_only) cb(null, lastdir, usepath);
				else cb(ret);
			}
		}, if_root, if_get_link, dsk, ++alliter);
	};
	let lastdir;
	let normpath = normalize_path(str);
	const get_dir_obj = (cb) => {//«
		const trydir = () => {//«
			if (gotdir.KIDS) {
				curdir = gotdir;
				lastdir = curdir;
				get_dir_obj(cb);
			} else if (gotdir.APP == "Link") {
				deref_link(gotdir.LINK, ret => {
					if (!ret) return cb();
					curdir = ret;
					lastdir = curdir;
					get_dir_obj(cb);
				}, true);
			} else cb();
		};//»
		iter++;
		if (iter == tonum) return cb(curdir);
		let kids = curdir.KIDS;
		let name = arr[iter];
		let gotdir = kids[name];
		if (!gotdir) {
			if (!curdir.done) {
				populate_dirobj(curdir, kidret => {
					gotdir = kidret[name];
					if (gotdir) lastdir = gotdir;
					if (gotdir) trydir();
					else allcb(null, lastdir, normpath);
				}, {
					DIRNAME: name,
					DSK: dsk
				});
			} else cb();
		}
		else {
			lastdir = gotdir;
			trydir();
		}
	};//»
	let tonum;
	let curdir;
	if (!alliter) alliter = 0;
	if (alliter == MAX_LINK_ITERS) {
		return allcb();
	}
	let arr = str.regpath().split("/");
	arr.shift();
	if (!arr[arr.length - 1]) arr.pop();
	if (!arr.length) return allcb(rootarg||root, lastdir, normpath);
	curdir = rootarg||root;
	let fname = arr.pop();
	tonum = arr.length;
	get_dir_obj(ret => {
		if (ret && ret.KIDS) {
			if (ret.KIDS[fname]) {
				let kid = ret.KIDS[fname];
				if (kid.APP == "Link" && !if_get_link) deref_link(kid.LINK, allcb);
				else {
					if (!if_root) {
						let cur = kid;
						while (cur.treeroot !== true) {
							if (cur.rootonly === true) {
								kid = null;
								break;
							}
							cur = cur.par;
						}
					}
					allcb(kid, lastdir, normpath);
				}
			} else {
				if (!ret.done) {
					populate_dirobj(ret, kidret => {
						ret.done = true;
						if (kidret) allcb(kidret[fname], lastdir, normpath);
						else allcb(null, lastdir, normpath);
					}, {
						PATH: str,
						DSK: dsk
					});
				} 
				else {
					allcb(null, lastdir, normpath);
				}
			}
		} else {
			allcb(null, lastdir, normpath);
		}
	});
}
this.ptw = path_to_obj;
this.path_to_obj = path_to_obj;
//»
const normalize_path = (path, cwd) => {
	if (!(path.match(/^\//) || (cwd && cwd.match(/^\//)))) {
		cerr("normalize_path():INCORRECT ARGS:", path, cwd);
		return null;
	}
	if (!path.match(/^\//) && cwd) path = cwd + "/" + path;
	let str = path.regpath();
	while (str.match(/\/\.\//)) str = str.replace(/\/\.\//, "/");
	str = str.replace(/\/\.$/, "");
	str = str.regpath();
	let arr = str.split("/");
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == "..") {
			arr.splice(i - 1, 2);
			i -= 2;
		}
	}
	let newpath = arr.join("/").regpath();
	if (!newpath) newpath = "/";
	return newpath;
}
this.normalize_path = normalize_path;

const make=(which)=>{return document.createElement(which);}

const get_fullpath = (path, noarg, cur_dir) => {
	if (!path) return;
	if (path.match(/^\//)) return path;
	if (!cur_dir) return cwarn("get_fullpath():No cur_dir given with relative path:" + path);
	let usedir;
	if (cur_dir == "/") usedir = "/";
	else usedir = cur_dir + "/";
	return normalize_path(usedir + path);
}
this.get_fullpath=get_fullpath;

const path_to_par_and_name=(path,if_no_resolve)=>{let fullpath=get_fullpath(path,if_no_resolve);let arr=fullpath.split("/");if(!arr[arr.length-1])arr.pop();let name=arr.pop();return [arr.join("/"),name];}
this.path_to_par_and_name=path_to_par_and_name;

const get_path_of_object = (obj, if_arr) => {//«
	if (!obj) return null;
	let str = obj.NAME;
	if (!str) return null;
	let curobj = obj;
	let use_sep = "/";
	let i = 0;
	while (true) {
		if (i == 1000) {
			log("\nINFINITE LOOP:GET_PATH_OF_OBJECT\n");
			break;
		}
		if (curobj && curobj.par) str = curobj.par.NAME + use_sep + str;
		else break;
		curobj = curobj.par;
		i++;
	}
	let arr = str.split("/");
	while (!arr[0] && arr.length) {
		arr.shift();
		i++;
	}
	if (if_arr) return arr;
	str = arr.join("/");
	return ("/" + str).regpath();
}
this.get_path_of_object = get_path_of_object;
this.objpath = get_path_of_object;
objpath = get_path_of_object;
//»
this.get_path_of_obj=function(obj,if_arr,join_char){if(!obj)return null;let str=obj.NAME;if(!str)return null;let curobj=obj;let use_sep="/";if(join_char)use_sep=join_char;while(true){if(curobj && curobj.par)str=curobj.par.NAME+use_sep+str;else break;curobj=curobj.par;}if(join_char)return str.replace(/^\/-/,"");if(if_arr){let arr=str.split("/");if(!arr[0])arr.shift();return arr;}return str.regpath();}

const get_distinct_file_key=(obj)=>{let type=obj.root.TYPE;if(type=="fs")return "fs-"+get_path_of_object(obj);else return get_path_of_object(obj);}
this.get_distinct_file_key=get_distinct_file_key;

const get_root=()=>{return root;}
this.get_root = get_root;


//»
//Remote/User«

const check_user_dir=(obj)=>{if(obj.treeroot||obj===obj.root)return false;while(obj.par){if(obj.par.NAME==="users"&&(obj.par.par===obj.root))return true;obj=obj.par;}return false;}

const check_user_perm_of_fobj = (obj) => {
return true;
/*//«
	let curpar = obj;
	if (curpar === curpar.root) {
		if (allow_sys_perms()) return true;
		return false;
	}
	if (curpar.par === obj.root) {
		if (allow_sys_perms()) return true;
		return false;
	}
	let uname = Core.get_username();
	let iter = 0;
	let gotok = false;
	while (true) {
		iter++;
		if (iter == 100) {
			cerr("INFINITE LOOP ALERT!!!!");
			return false;
		}
		if (curpar.par && (curpar.par.par === obj.root)) { 
			if (curpar.par.NAME == "users" && uname === curpar.NAME) return true;
		}
		curpar = curpar.par;
		if (curpar.par === obj.root) {
			if (allow_sys_perms()) return true;
			return false;
		}
	}
	return gotok;
//»*/
}
this.check_user_perm = check_user_perm_of_fobj;

const save_remote_file = (fullpath, val, cb, opts) => {
	if (!opts) opts = {};
	let parts = path_to_par_and_name(fullpath);
	let blob;
	try {
		blob = new Blob([val], {
			type: "application/octet-stream"
		});
	} catch (e) {
		cerr("save_remote_file():Could not 'blobify' the value");
		log(val);
		return cb();
	}
	if (opts.IFFORCE) {
		mk_rem_file(parts[0], parts[1], (ret2, err) => {
			cb(ret2, err);
		}, blob, opts);
		return;
	}
	path_to_obj(parts[0], (ret => {
		if (!ret) return cb();
		mk_rem_file(ret, parts[1], (ret2, err) => {
			if (!ret2) return cb(null, err);
			cb(true, blob.size);
		}, blob, opts);
	}))
}
this.save_remote=save_remote_file;

const get_rem_file = (path, cb, opts, if_local, stream_cb) => {
	let mime="blob";
	if (!opts) opts = {};
	let if_no_cache = opts.NOCACHE;
	let if_bytes = opts.ASBYTES;
	let if_text = opts.TEXT;
	if (!if_no_cache && rem_cache[path]) return cb(rem_cache[path]);
	let marr;
	let url;
	if (if_local) {
		url = Core.loc_url(path);
		if (!url) return cb();
		Core.xgetfile(url, cb, stream_cb, if_text);
		return;
	}
	if (marr = path.match(/^\/site\/users\/(.+)$/)) {
		let arr = marr[1].split("/");
		if (arr.length < 2) url = `/users/${arr[0]}`;
		else{
			let uname = arr.shift();
			let fname = arr.pop();
			let dirname = arr.join("/");
			if (!dirname) dirname = "/";
			url = '/_getuserfile?user=' + uname + '&file=' + fname + '&dir=' + dirname;
		}
	}
	else if (marr = path.match(/^\/site(\/.+)$/)) url = marr[1];
	xget(url, async (ret, err) => {
		if (err) return cb(null, err);
		let val;
		let bytes;
		if (util.isstr(ret)) {
			if (if_bytes) cb(await Core.api.textToBytes(ret));
			else cb(ret);
			val = new Blob([ret], {
				type: mime
			});
		} else if (ret instanceof Uint8Array) {
			val = new Blob([ret.buffer], {
				type: mime
			});
			if (if_bytes) cb(val);
		} else if (ret instanceof ArrayBuffer) {
			val = new Blob([ret], {
				type: mime
			});
			if (if_bytes) cb(new Uint8Array(ret));
			else cb(val);
		} else if (ret instanceof Blob) {
			val = ret;
			if (if_bytes) cb(await Core.api.blobAsBytes(ret));
			else cb(val);
		} else {
			cerr("get_rem_file():WHAT GOT RET???");
			log(ret);
			return;
		}
		rem_cache[path] = val;
	}, if_text);
}
this.get_rem_file = get_rem_file;

const mk_rem_file = async(obj, fname, cb, fileblob, opts) => {
	if (!opts) opts = {};
	let upload_cb = opts.UPLOADCB||(()=>{});
	let kind = opts.KIND;
	let if_hash = opts.IFHASH;
	let is_dir = fileblob ? false : true;
	let which;
	let userop;
	let sysop;
	let url;
	let is_user_dir;
	let parpath;
	if (is_dir) {
		which = "directory";
		userop = "mkdir";
		sysop = "dir";
	} else {
		which = "file";
		userop = "addfile";
		sysop = "file";
	}
	if (isstr(obj)) {
		parpath = obj;
		if (parpath.match(/^\/site\/users\/[-~a-zA-Z_0-9]+\/?/)) is_user_dir = true;
		else if (parpath.match(/^\/site\/users\/?/)) return cb(null, "Permission denied");
		obj = null;
	} else {
		parpath = objpath(obj);
		is_user_dir = check_user_dir(obj);
	}
	if (obj && obj.NAME == "users" && obj.par.par.treeroot) {
		if (is_dir) {
			url = '/_user?op=mkdir&path=/';
		}
		else return cb(null, "Cannot make a file in users directory!");
	} 
//	else if (obj && !check_user_perm_of_fobj(obj)) {
//		return cb(null, "Permission denied");
//	} 
	else {
		if (obj && obj.KIDS[fname]) {
			if (is_dir) return cb(null, fname + ":\x20The directory already exists");
		}
		let arr = parpath.split("/");
		if (!arr[0]) arr.shift();
		if (is_user_dir) {
			arr.shift();
			arr.shift();
			arr.shift();
			if (is_dir) url = '/_user?op=mkdir&path=' + (arr.join("/") + "/" + fname).regpath();
			else {
				let dir = arr.join("/");
				if (!dir) dir = "/";
				url = '/_user?op=addfile&dir=' + dir + "&file=" + fname;
			}
		} else {
			arr.shift();
			if (is_dir) url = '/_addsitedir?path=' + (arr.join("/") + "/" + fname).regpath();
			else {
				let dir = arr.join("/");
				if (!dir) dir = "/";
				url = '/_addsitefile?dir=' + dir + "&file=" + fname;
			}
		}
	}
	if (kind) url += "&kind=" + kind;
	if (if_hash) url += "&dohash=1";

	const upprog=(obj)=>{
		if (obj.lengthComputable){
			upload_cb(Math.floor(100*obj.loaded/obj.total));
		}
	};
	let ret = await Core.api.xpost(url, fileblob,{onUpProgress:upprog});
	if (!ret) cb(null, "Unspecified network error");
	else if (ret.SUCC) {
		return cb(true);
	}
	else if (ret.ERR) cb(null, ret.ERR);

/*
	xgetobj(url, (ret, err) => {
		if (err) return cb(null, err);
		else if (ret) {
			if (ret.SUCC) {
				return cb(true);
			} else if (ret.ERR) cb(null, ret.ERR);
		} else cb(null, "There was an unknown problem making the " + which);
	}, fileblob);
*/

}
this.mk_rem_file = mk_rem_file;

//»


//***   New HTML5 FS   ***«

/*
return new Promise(async(Y,N)=>{

});

*/

const getFsEntry=(path,opts={})=>{//«
	return new Promise((Y,N)=>{
		webkitResolveLocalFileSystemURL(fs_url(path),Y,(e)=>{
			if (opts.reject) return N(e);
			NS.error.message=e;
			Y();
		});
	});
};//»
const getFsFileFromEntry=(ent)=>{//«
	return new Promise((Y,N)=>{
		ent.file(Y);
	});
};//»
const getDataFromFsFile=(file,format,start,end)=>{//«
	return new Promise(async(Y,N)=>{
		const OK_FORMATS=["blob","bytes","text","binarystring","dataurl","arraybuffer"];
		const def_format="arraybuffer";
		if (!format) {
			cwarn("Format not given, defaulting to 'arraybuffer'");
			format=def_format;
		}
		if (!OK_FORMATS.includes(format)) return N(`Unrecognized format: ${format}`);
		let reader = new FileReader();
		reader.onloadend = function(e) {
			let val = this.result;
			if (format==="blob") return Y(new Blob([val],{type: "blob"}));
			if (format==="bytes") return Y(new Uint8Array(val));
			return Y(val);
		};
		if (Number.isFinite(start)) {
			if (Number.isFinite(end)) {
				file = file.slice(start, end);
			}
			else file = file.slice(start);
		}
		if (format==="text") reader.readAsText(file);
		else if (format=="binarystring") reader.readAsBinaryString(file);
		else if (format=="dataurl") reader.readAsDataURL(file);
		else reader.readAsArrayBuffer(file);
	});
};//»

const getFsFileData=(path, opts={})=>{//«
return new Promise(async(Y,N)=>{


	let fent = await getFsEntry(path, opts);
	if (!fent) return Y();
	if (!fent.isFile){
		let mess = `The entry is not a File! (isDirectory==${fent.isDirectory})`;
		if (opts.reject) return N(mess);
		else{
			NS.error.message=mess;
			Y();
			return;
		}
	}
	let file = await getFsFileFromEntry(fent);
	if (!file) throw new Error("Could not get filesystem File object from the Entry");
	Y(await getDataFromFsFile(file, opts.format, opts.start, opts.end));


});
};//»

const getFsDirKids=(path, opts={})=>{//«
return new Promise(async(Y,N)=>{

	let cb = opts.streamCb;
	let dent = await getFsEntry(path, opts);
	if (!dent) return Y();
	if (!dent.isDirectory){
		let mess = `The entry is not a Directory! (isFile==${dent.isFile})`;
		if (opts.reject) return N(mess);
		else{
			NS.error.message=mess;
			Y();
			return;
		}
	}
	let rdr = dent.createReader();
	let entries=[];
	const do_read_entries=()=>{
		return new Promise((Y,N)=>{
			rdr.readEntries(arr=>{
				if (cb) cb(arr);
				if (!arr.length) return Y();
				entries = entries.concat(arr);
				return Y(true);
			});
		});
	};
	while(await do_read_entries()){}
	Y(entries);

});
};//»

//»
//HTML5 FS«

const write_fs_file = (fent, blob, cb, if_append, if_trunc) => {//«
	const err = (e) => {
		cb();
	};
	fent.createWriter(function(writer) {
		if (if_append) writer.seek(writer.length);
		var truncated = false;
		writer.onwriteend = async function(e) {//«
			if (!truncated) {
				truncated = true;
				if (if_trunc) this.truncate(0);
				else this.truncate(this.position);
				return;
			} else {
				let arr = fent.fullPath.split("/");
				arr.shift();
				arr.shift();
				if (arr[0]!="runtime"){
					let fname = arr.pop();
					let parpath = "/"+arr.join("/");
					let parobj = await pathToNode(parpath);
					if (!parobj) throw new Error("parobj not found!");
					if (!parobj.KIDS) throw new Error("parobj does not have KIDS!");
					let obj={NAME: fname, par: parobj, root: parobj.root, fullpath:`${parpath}/${fname}`, entry:fent, file: await getFsFileFromEntry(fent)};

					if (fname.match(/\.lnk$/)){
						let ln = blob.__value;
						obj.APP="Link";
						obj.LINK = ln;
						if (typeof ln !== "string"){
							console.warn("The link value is NOT a string");
							console.log(ln);
							obj.badlink=true;
						}
						else if (!await pathToNode(ln)) obj.badlink=true;
						else obj.badlink=false;
					}
					parobj.KIDS[fname]=obj;
					fent._fileObj = obj;
				}
				let bytes = this.position;
				fent._currentSize = bytes;
				cb(true, this);
			}
		};//»
		writer.onerror = function(e) {
			cerr('WRITE ERR:' + fname + " " + val.length);
			cb();
		};
		writer.write(blob);
	}, err);
}
this.write_fs_file = write_fs_file;//»

const check_fs_dir_perm = (obj, is_root, is_sys) => {//«
//	if (obj.root.readonly) return false;
//	if (is_root) return true;
//cwarn("check_fs_dir_perm");
//log("OBJ",obj);
	if (is_sys) return true;
	let iter = 0;
	while (obj.treeroot !== true) {
		iter++;
		if (iter >= 10000) throw new Error("UMWUT");
		if (obj.readonly){
			if (is_sys) return true;
			return false;
		}
		if ("perm" in obj) {
			let perm = obj.perm;
			if (perm === true) return true;
			else if (perm === false) {
				if (is_root) return true;
				return false;
			}
			else if (isstr(perm)) {
				if (is_root) return true;
				return (Core.get_username() === perm);
			}
			else {
console.error("Unknown obj.perm field:", obj);
			}
		}
		obj = obj.par;
	}
	return false;
};
this.check_fs_dir_perm=check_fs_dir_perm;
//»
const delete_fobjs = (arr, cb, is_root, dsk) => {//«
	let _Desk = (dsk&&dsk.Desk) || Desk;
	let roots = {};
	let remotes = [];
	let iter = -1;
	let keys;
	const dodel = () => {
		iter++;
		if (iter == arr.length) {
			cb(true);
			return;
		}
		let obj = arr[iter];
		let is_folder = (obj.APP == "sys.Explorer");
		let root = obj.root;
		if (root == obj && obj.par != obj) root = obj.par.root;
		let name = obj['NAME'];
		let par = obj.par;
		let path = get_path_of_object(obj);
		let parpath = get_path_of_object(par);
		let app = obj.APP;
/*
		if (app == "Link" || app == "FIFO") {//«
			let pref;
			if (app == "Link") pref = "LN";
			else pref = "FI";
			pref = (dsk?dsk.fspref:FSPREF) + pref;
			let key = (pref + "_" + (parpath + "/" + name).regpath());
			if (!localStorage[key]) {
				cwarn("Key not found in localStorage:" + key);
			} else {
				delete par['KIDS'][name];
				delete localStorage[key];
				if (_Desk) {
					let icons = _Desk.get_icons_by_path(parpath + "/" + name);
					for (let icn of icons) _Desk.rm_icon(icn);
				}
			}
			dodel();
		}//»
*/
		if (root.TYPE == "fs") {
			rm_fs_file(path, (delret, errmess) => {
				if (delret) {
					delete par['KIDS'][name];
					if (_Desk) {
						let namearr = Core.api.getNameExt(path);
						let usepath = parpath + "/" + namearr[0];
						let useext = namearr[1];
						let win = _Desk.get_win_by_path(usepath, useext);
						if (win && win.force_kill) win.force_kill();
						let icons = _Desk.get_icons_by_path(usepath, useext);
						for (let icn of icons) {
							if (icn.overdiv && icn.overdiv.cancel_func) icn.overdiv.cancel_func();
							_Desk.rm_icon(icn);
						}
					}
				}
				else {
console.error("Could not remove:" + path + ":" + errmess);
				}
				dodel();
			}, is_folder, is_root, dsk)
		}
		else if (root.TYPE == "remote") {
			delete obj.par.KIDS[obj.NAME];
			dodel();
		} else {
			console.error("delete_fobjs:DELETE TYPE:" + root.TYPE + "!?!?!?!?!?");
			dodel();
		}
	};
	dodel();
}//»
const do_fs_rm = (args, errcb, cb, opts={}) => {//«
	let dsk = opts.DSK;
	let cwd = opts.CWD;
	let is_root = opts.ROOT;
	let do_full_dirs = opts.FULLDIRS;
	let iter = -1;
	let arr = [];
	const do_rm = () => {
		iter++;
		if (iter == args.length) {
			if (arr.length) delete_fobjs(arr, cb, is_root, dsk);
			else cb();
			return;
		}
		let path = args[iter];
		if (!path.match(/^\//)) path = normalize_path(path, cwd);
		path_to_obj(path, obj => {
			if (obj) {
				let ukey = get_distinct_file_key(obj);
				let rtype = null;
				let issys = null;
				rtype = obj.root.TYPE;
				if (obj.treeroot === true) {
					errcb("WTF are you even trying to do,\x20genius? Kill everyone? I mean,\x20gimme a break!");
					do_rm();
					return;
				}
				if (obj.par.sys) issys = true;
				let app = obj.APP;
				if (ukey || app == "sys.Explorer") {
					if (obj.LINK) arr.push(obj);
					else if (app == "sys.Explorer") {
						if (rtype == "remote") {
							if (obj.par.treeroot === true) {
								errcb("Refusing to remove the ENTIRE website from the face of the earth!");
								do_rm();
								return;
							}
							let parr = path.split("/");
							parr.shift();
							parr.shift();
							parr.pop();
							let dirname = parr.pop();
							let parpath;
							let url;
							if (!check_user_perm_of_fobj(obj)) {
								errcb(path + ":\x20permission denied");
								return do_rm();
							}
							if (path.match(/^\/site\/users\/[^\/]+\//)) {
								parr.shift();
								if (parr.length) parr.shift();
								else dirname = "/";
								url = "/_deluserfile?user=" + Core.get_username();
							} else url = "/_delsitefile?user=root";
							parpath = parr.join("/");
							if (!parpath) parpath = "/";
							url += "&dir=" + parpath + "&file=" + dirname + "&isdir=1";
							xgetobj(url, ret => {
								if (ret.ERR) errcb(ret.ERR);
								else arr.push(obj);
								do_rm();
							});
						} else if (rtype != "fs") {
							errcb("Cannot remove directory type:\x20" + rtype);
							do_rm();
						} else if (Desk && (path == globals.desk_path)) {
							errcb("Refusing to remove the working desktop path:\x20" + path);
							do_rm();
						} else if (obj.par.treeroot) {
							errcb("Refusing to remove a toplevel directory!");
							do_rm();
						} else if (!obj.done) {
							populate_fs_dirobj_by_path(objpath(obj), kidret => {
								if (kidret) {
									let numkids = getkeys(kidret).length;
									if (!do_full_dirs && numkids > 2) errcb("not an empty folder:\x20" + args[iter]);
									else {
										if (!check_fs_dir_perm(obj, is_root)) errcb(path + ":\x20permission denied");
										else arr.push(obj);
									}
								} else errcb("Could not populate the dir!");
								do_rm();
							});
						} else {
							let numkids = getkeys(obj.KIDS).length;
							if (!do_full_dirs && numkids > 2) errcb("not an empty folder:\x20" + args[iter]);
							else {
								if (!check_fs_dir_perm(obj, is_root)) errcb(path + ":\x20permission denied");
								else arr.push(obj);
							}
							do_rm();
						}
						return;
					} else if (rtype == "fs") {
						if (!check_fs_dir_perm(obj.par, is_root)) errcb(path + ":\x20permission denied");
						else arr.push(obj);
					} else if (rtype == "remote") {
						let parr = path.split("/");
						parr.shift();
						parr.shift();
						let fname = parr.pop();
						let parpath;
						let url;
						if (!check_user_perm_of_fobj(obj)) {
							errcb(path + ":\x20permission denied");
							return do_rm();
						}
						if (path.match(/^\/site\/users\/[^\/]+\//)) {
							parr.shift();
							parr.shift();
							url = "/_deluserfile?user=" + Core.get_username();
						} else url = "/_delsitefile?user=root";
						parpath = parr.join("/");
						if (!parpath) parpath = "/";
						url += "&dir=" + parpath + "&file=" + fname;
						xgetobj(url, ret => {
							if (ret.ERR) errcb(ret.ERR);
							else arr.push(obj);
							do_rm();
						});
						return;
					} else errcb(path + ":\x20not\x20(currently)\x20handling type:\x20" + rtype);
				} else {
					cerr("NO KEY");
					log(obj);
				}
			} else {
				if (path == "/") errcb("cannot remove root");
				else errcb("could not stat:\x20" + path);
			}
			do_rm();
		}, is_root, true, dsk);
	};
	do_rm();
}

this.do_fs_rm=do_fs_rm;
//»
const mkdir_by_path = (path, cb, dsk) => {//«
	path = path.regpath();
	if (path=="/") return cb(true);
	let arr = path.split("/");
	if (!arr[0]) arr.shift();
	let rootname = arr.shift();
	get_or_make_dir(rootname, arr.join("/"), cb, null, null, dsk);
}
//»
const check_unique_path=(path,is_root)=>{return new Promise((res,rej)=>{let arr=path.replace(/\/$/,"").split("/");let name=arr.pop();let parpath=arr.join("/");path_to_obj(parpath,fobj=>{if(!fobj)return rej("No parent path:\x20"+parpath);if(fobj.APP!="sys.Explorer")return rej("Parent is not a Folder,(got"+fobj.APP+")");if(fobj.KIDS[name])return res("The name already exists:\x20"+name);res([fobj.fullpath+"/"+name,fobj.fullpath,name]);},is_root);});};
const get_unique_path=(path,opts,is_root)=>{if(!opts)opts={};let from_num=opts.NUM;return new Promise(async(res,rej)=>{try{let ret=await check_unique_path(path,is_root);if(isArr(ret))return res(ret);}catch(e){return rej(e);}if(!from_num)from_num=1;else if(!isint(from_num))return rej("NaN:\x20"+from_num);let parr=path.split("/");let fname=parr.pop();let parpath=parr.join("/");let max_iters=100;let to_num=from_num+max_iters;for(let i=from_num;i<to_num;i++){let trypath=parpath+"/"+i+"~"+fname;try{let ret=await check_unique_path(trypath,is_root);if(isArr(ret))return res(ret);}catch(e){return rej(e);}}rej("Giving up after:\x20"+max_iters+" tries");});};
this.mk_fs_dir = (parpatharg, fname, cur_dir, cb, winarg, is_root, opts={}) => {//«
	const cberr = (str) => {
		cb(null, str);
	};
	const cbok = (val) => {
		if (!val) val = true;
		cb(val);
	};
	let parpath;
	if (cur_dir) parpath = (cur_dir + "/" + parpatharg).regpath();
	else parpath = parpatharg.regpath();
	if (opts.forceremote || opts.r) {
		mk_rem_file(parpath, fname, (ret, err) => {
			if (ret) cbok();
			else cb(null, err);
		}, null, {
			KIND: opts.kind
		});
		return;
	}
	path_to_obj(parpath, obj => {
		if (!obj) {
			cberr(parpath + ":\x20no such directory");
			return;
		}
		const mkfobj = () => {
			let newobj = {
				NAME: fname,
				APP: "sys.Explorer",
				root: obj.root,
				par: obj,
				fullpath: parpath+"/"+fname,
				KIDS: {}
			};
			newobj.KIDS['.'] = newobj;
			newobj.KIDS['..'] = obj;
			obj.KIDS[fname] = newobj;
		};

		let type = obj.root.TYPE;
		let kids = obj.KIDS;
		if (!kids) return cberr(parpath + ":\x20not a directory");
		if (kids[fname]) return cberr(parpath + "/" + fname + ":\x20already exists");
		if (type == "fs") {
			if (obj.NAME == "home" && obj.par.treeroot && fname === Core.get_username()) {}
			else if (!check_fs_dir_perm(obj, is_root)) return cberr("Permission denied");
			get_or_make_dir(parpath, fname, ret => {
				if (ret) {
					if (!Desk) return cbok();
					let retval;
					if (opts.DSK) retval = opts.DSK.Desk.make_desk_folder(parpath, fname);
					else retval = Desk.make_desk_folder(parpath, fname);
					if (retval) {
						if (retval === true) return cbok();
						else if (retval.close) retval.close();
						if (winarg) winarg.winon();
						cbok();
					} else cbok();
				} else cberr();
			},null,null,opts.DSK);
		}
		else if (type == "remote") {
			if (obj.fullpath=="/site/users"){
				let uname = globals.stats.USERNAME;
				if (!uname) return cberr("You are not signed in!");
				if (uname != fname) return cberr(`Your username is not '${fname}'!`);
			}
			mk_rem_file(obj, fname, (ret, err) => {
				if (ret) {
					mkfobj();
					cbok();
				} else cb(null, err);
			}, null, {
				KIND: opts.kind
			});
		} else {
			cberr("not supporting type:\x20" + type);
			return;
		}
	}, is_root, null, opts.DSK);
}//»
const get_or_make_dir = (rootname, path, cb, getonly, if_mkdir, dsk) => {//«
	const check_or_make_dir = (obj, dir, name, _cb) => {//«
		if (obj.KIDS) {
			let kidobj = obj.KIDS[name];
			if (kidobj) {
				dir.getDirectory(name, {
					create: true
				}, dirret => {
					if (kidobj.APP == "sys.Explorer") _cb(kidobj, dirret);
					else _cb();
				}, log);
			} else if (getonly) {
				dir.getDirectory(name, {}, dirret => {
					let haveobj = {
						'NAME': name,
						'APP': "sys.Explorer",
						'root': rootobj,
						'par': obj,
						'KIDS': {}
					};
					haveobj.KIDS['.'] = haveobj;
					haveobj.KIDS['..'] = obj;
					obj.KIDS[name] = haveobj;
					_cb(haveobj, dirret);
				}, _ => {
					_cb();
				});
			} else {
				dir.getDirectory(name, {
					create: true
				}, dirret => {
					let newobj = {
						'NAME': name,
						'APP': "sys.Explorer",
						'root': rootobj,
						'par': obj,
						fullpath: obj.fullpath+"/"+name,
						'KIDS': {}
					};
					newobj.KIDS['.'] = newobj;
					newobj.KIDS['..'] = obj;
					obj.KIDS[name] = newobj;
					_cb(newobj, dirret);
					if (if_mkdir && Desk) Desk.make_desk_folder(obj.fullpath, name);
				}, log);
			}
		} else _cb();
	};//»
	if (rootname.match(/\//)) {
		let arr = rootname.split("\/");
		if (!arr[0]) arr.shift();
		rootname = arr.shift();
		path = arr.join("/") + "/" + path;
	}
	let usefs;
	let useroot;
	if (dsk) {
		usefs = dsk.fs_root;
		useroot = dsk.root;
	}
	else{
		usefs = fs_root;
		useroot = root;
	}
	let rootobj = useroot.KIDS[rootname];
	let rootdir;
	let argobj;
	if (getonly) argobj = {};
	else argobj = {
		create: true
	};
	usefs.getDirectory(rootname, argobj, dirret => {
		if (!path) {
			cb(rootobj, dirret);
			return;
		}
		rootdir = dirret;
		let arr = path.split("/");
		if (!arr[0]) arr.shift();
		if (!arr[arr.length - 1]) arr.pop();
		if (!arr.length) {
			cb(rootobj, dirret);
			return;
		}
		if (rootobj && rootobj.par.treeroot) {
			let rtype = rootobj.TYPE;
			if (rtype == "fs") {
				let curobj = rootobj;
				let curdir = rootdir;
				let iter = -1;
				let dodir = _ => {
					iter++;
					if (iter == arr.length) {
						cb(curobj, curdir);
						return;
					}
					check_or_make_dir(curobj, curdir, arr[iter], (objret, dirret) => {
						curobj = objret;
						curdir = dirret;
						if (!curobj) {
							cb();
							return;
						}
						dodir();
					});
				};
				dodir();
			}
		} else {
			cb();
			log("get_or_make_dir():NO rootobj && rootobj.par.treeroot:<" + rootname + "><" + path + ">");
			log(rootobj);
		}
	}, _ => {
		cb();
		log("HOOOO");
	});
}
this.get_or_make_dir = get_or_make_dir;
//»
const move_kids = (srcpath, destpath, cb, if_copy, if_root, dsk) => {//«
	let srcarr = srcpath.split("/");
	let srcname = srcarr.pop();
	let srcparpath = srcarr.join("/");
	let destarr = destpath.split("/");
	let newname = destarr.pop();
	let destparpath = destarr.join("/");
	path_to_obj(srcparpath, srcparobj => {
		if (srcparobj) {
			let srckids = srcparobj.KIDS;
			let kidobj = srckids[srcname];
			let newkid;
			if (kidobj) {
				let app = kidobj.APP;
				if (!if_copy) {
					delete srckids[srcname];
					newkid = kidobj;
				} else {
					newkid = {};
					for (let k of getkeys(kidobj)) {
						if (k === "BUFFER") newkid.BUFFER = [];
						else newkid[k] = kidobj[k]
					}
				}
				path_to_obj(destparpath, destparobj => {
					if (destparobj) {

//Just added this on 2/4/20 @8:30 am EST 
//						vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
						newkid.path = destparobj.fullpath;
						newkid.fullpath = destparobj.fullpath +"/"+newname;
//                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

						newkid.par = destparobj;
						newkid.root = destparobj.root;
						if (newkid.KIDS) newkid.KIDS['..'] = destparobj;
						newkid.NAME = newname;
						destparobj.KIDS[newname] = newkid;
//						if (app == "Link" || app == "FIFO") {
//							move_fifo_or_link(srcpath, destpath, app, dsk);
//						}
						cb(destparobj, newkid);
					} else {
						cwarn("THERE WAS NO DESTPAROBJ returned with path:" + destparpath);
						cb();
					}
				}, if_root, false, dsk);
			} else {
				cwarn("THERE WAS NO KIDS FILE NAMED:" + srcname + " IN SOURCE DIR:" + srcparpath);
				cb();
			}
		} else {
			cwarn("THERE WAS NO SRCPAROBJ returned with path:" + srcparpath);
			cb();
		}
	}, if_root, true, dsk);
}
this.move_kids = move_kids;
//»
const mv_by_path = (srcpath, destpath, apparg, cb, if_copy, if_root, dsk) => {//«
	let if_dir = false;
	if (apparg == "sys.Explorer") if_dir = true;
	let destarr = destpath.split("/");
	let newname = destarr.pop();
	let destparpath = destarr.join("/");
	get_fs_ent_by_path(srcpath, (fent,errmess) => {
		if (fent) {
			get_fs_ent_by_path(destparpath, dirent => {
				try {
					if (if_copy) {
						fent.copyTo(dirent, newname, function() {
							move_kids(srcpath, destpath, cb, true, if_root, dsk)
						}, function(e) {
							cb();
						});
					} else fent.moveTo(dirent, newname, function() {
						move_kids(srcpath, destpath, cb, false, if_root, dsk)
					}, function(e) {
						cb();
					});
				} catch (e) {
					cerr(e);
					cb();
				}
			}, true, false, true, dsk);
		} else {
			console.error("ERROR No fent returned from srcpath:" + srcpath);
			cb();
		}
	}, if_dir, false, true, dsk);
}
this.mv_by_path=mv_by_path;
//»
const rm_fs_file = (path, cb, ifdir, if_root, dsk) => {//«
	if (ifdir) {
		get_fs_ent_by_path(path, (dirent, errmess) => {
			if (dirent) {
				dirent.removeRecursively(() => {
					cb(true);
				}, () => {
					cb();
				});
			} else cb(null, errmess);
		}, true, false, if_root, dsk);
	} else {
		get_fs_by_path(path, fent => {
			if (fent) {
				fent.remove(() => {
					cb(true);
				}, () => {
					cb();
				});
			} else cb();
		}, {
			GETLINK:true,
			ENT: true,
			ROOT: if_root,
			DSK:dsk
		});
	}
}
this.rm_fs_file = rm_fs_file;
//»
const touch_fs_file = (patharg, cb, useval, if_root, dsk) => {//«
	if (!useval) useval = "";
	let arr = patharg.split("/");
	arr.shift();
	let rname = arr.shift();
	let fname = arr.pop();
	let path = null;
	if (arr.length) path = arr.join("/");
	get_fs_by_path(patharg, ret1 => {
		if (!ret1) {
			get_or_make_dir(rname, path, (objret, dirret) => {
				save_fs_file(dirret, objret, fname, useval, ret2 => {
					if (ret2) cb(ret2);
					else {
						console.error("ERR TOUCH_FS_FILE #1");
						cb();
					}
				}, {DSK:dsk});
			}, true, false,dsk);
		}
		else cb(ret1);
	}, {
		ENT: true,
		DSK:dsk
	});
};
this.touch_fs_file=touch_fs_file;
//»
const get_fs_ent_by_path = (patharg, cb, if_dir, if_make, if_root, dsk) => {//«
	if (typeof if_dir == "string") {
		if (if_dir != "sys.Explorer") if_dir = false;
		else if_dir = true;
	}
	get_fs_by_path(patharg, cb, {
		ENT: true,
		DIR: if_dir,
		MAKE: if_make,
		ROOT: if_root,
		DSK: dsk
	});
}
this.get_fs_ent_by_path = get_fs_ent_by_path;
//»
const get_fs_file_from_fent = (fent, cb, if_blob, mimearg, start, end) => {//«
	fent.file(file => {

let getlen;
let sz = file.size;
if (Number.isFinite(start)){
	if (start < 0){
		cb(null, "A negative start value was given: "+start);
		return;
	}
	if (Number.isFinite(end)){
		if (end <= start){
			cb(null,`The end value (${end}) is <= start (${start})`);
			return;
		}
		sz = end - start;
	}
	else sz = file.size - start;
	
}
else if (Number.isFinite(end)){
cb(null, "No legal 'start' value was provided! (got a legal end value)");
log(file);
return;
}

		if (sz > MAX_FILE_SIZE) {
			let s = "The file's size is\x20>\x20MAX_FILE_SIZE=" + MAX_FILE_SIZE + ". Please use start and end options!";
			cwarn(s);
			cb(null,s);
			return;
		}
		let reader = new FileReader();
		reader.onloadend = function(e) {
			let val = this.result;
			if (if_blob) {
				if (mimearg) val = new Blob([val], {
					type: "blob"
				});
				else {
					cb(new Uint8Array(val), fent, true);
					return;
				}
			}
			cb(val, fent, true);
		};
//		if (pos_arr) file = file.slice(pos_arr[0], pos_arr[1]);
		if (Number.isFinite(start)) {
			if (Number.isFinite(end)) {
				file = file.slice(start, end);
			}
			else file = file.slice(start);
		}
		if (if_blob) reader.readAsArrayBuffer(file);
		else reader.readAsText(file);
	}, () => {
		cb();
		cerr("FAIL:get_fs_file_from_fent");
	});
}
this.get_fs_file_from_fent = get_fs_file_from_fent;
//»
const get_fs_file = (dir, fname, cb, if_blob, mimearg, if_ent, if_dir, if_make, start, end) => {//«
//const get_fs_file = (dir, fname, cb, if_blob, mimearg, if_ent, if_dir, if_make, nbytes) => {
	const err = (e) => {
		cb(null,"dir.getFile error handler");
	};
	var arg = {};
	if (if_make) arg.create = true;
	if (if_dir) {
		dir.getDirectory(fname, arg, cb, e => {
			cb(null);
		});
	} else {
		dir.getFile(fname, arg, fent => {
			if (if_ent) {
				cb(fent);
				return;
			}
			get_fs_file_from_fent(fent, cb, if_blob, mimearg, start, end);
		}, err);
	}
}//»
const check_fs_by_path = async(fullpath, cb) => {//«
	if (!fullpath.match(/^\//)) {
		cerr("NEED FULLPATH IN CHECK_FS_BY_PATH");
		cb();
		return;
	}
	if (await pathToNode(fullpath)) return cb(true);
	cb(false);
}
this.check_fs_by_path=check_fs_by_path;
//»
const get_fs_data = (path, cb, noarg, if_root, dsk) => {//«
//const get_fs_data=(path,cb,nbytes,if_root,dsk)=>{get_fs_by_path(path,cb,{BLOB:true,NBYTES:nbytes,ROOT:if_root,DSK:dsk});}
//cwarn("get_fs_data is deprecated!");
if (noarg){
console.error("nbytes was given??? (looks like 'noarg to me!')");
}
	get_fs_by_path(path, cb, {
		BLOB: true,
//		NBYTES: nbytes,
		ROOT: if_root,
		DSK: dsk
	});
}
this.get_fs_data=get_fs_data;
//»
this.get_fs_bytes=(path,nbytes)=>{return new Promise((res,rej)=>{get_fs_data(path,(ret,err)=>{if(!ret){rej(err);return;}res(ret);},nbytes);});}
this.get_json_file=(path,cb,dsk)=>{get_fs_by_path(path,ret=>{if(!ret)return cb();var obj;try{obj=JSON.parse(ret);}catch(e){return cb(null,e);}cb(obj);},{DSK:dsk});}
const get_fs_by_path = (patharg, cb, opts = {}) => {//«
	let if_blob = opts.BLOB;
	let if_ent = opts.ENT;
	let if_dir = opts.DIR;
	let if_make = opts.MAKE;
//	let nbytes = opts.NBYTES;
	let start = opts.start;
	let end = opts.end;
	let if_root = opts.ROOT;
	let arr = patharg.split("/");
	arr.shift();
	let rootname = arr.shift();
	let fsarg;
	if (opts.DSK) fsarg = opts.DSK.fs_root;
	if (!arr.length) {
		get_fs_file((fsarg || fs_root), rootname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
		return;
	}
	path_to_obj(patharg, (ret, lastdir, normpath) => {
		let lastdirpath = null;
		let realpath;
		let fname, arr;
		if (!ret) {
			if (!if_make) return cb(null, patharg + ":\x20could not stat the file");
			if (!(lastdir && normpath)) return cb(null);
			lastdirpath = objpath(lastdir);
			arr = normpath.split("/");
			fname = arr.pop();
			if ((lastdirpath + "/" + fname) !== normpath) return cb(null, lastdirpath + ":\x20no such directory");
		} else {
			let realpath = objpath(ret);
			arr = realpath.split("/");
			fname = arr.pop();
		}
		arr.shift();
		rootname = arr.shift();
		let path = null;
		if (arr.length) path = arr.join("/");
		get_or_make_dir(rootname, path, (objret, dirret) => {
			if (!dirret) {
				cb(null, "/" + rootname + "/" + path + "/" + fname + ":could not stat the file");
				return;
			}
			get_fs_file(dirret, fname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
		}, true, null, opts.DSK);
	}, if_root, opts.GETLINK, opts.DSK);
}
this.get_fs_by_path = get_fs_by_path;
this.getfile = get_fs_by_path;
//»
const save_fs_by_path = (patharg, val, cb, opts) => {//«
	patharg = patharg.replace(/\/+/g, "/");
	if (!opts) opts = {};
	let apparg = opts.APPARG;
	let if_no_fobj = opts.NOFOBJ;
	let if_append = opts.APPEND;
	let mimearg = opts.MIMEARG;
	let winid = opts.WINID;
	let if_root = opts.ROOT;
	let if_mkdir = opts.MKDIR;
	let dsk = opts.DSK;
	let err = null;
	let arr = patharg.split("/");
	arr.shift();
	let arrlen = arr.length;
	let rootname;
	if (arrlen == 1) rootname = "/";
	else rootname = arr.shift();
	if (!patharg.match(/^\//)) err = "NEED FULL PATH IN SAVE_FS_BY_PATH";
	else if (patharg.match(/\/$/)) err = "NO FILE NAME IN SAVE_FS_BY_PATH";
	else if (arrlen < 2 && !if_root) err = "FILE PATH TOO SHORT IN SAVE_FS_BY_PATH(not root)";
	else if (arrlen < 1) err = "FILE PATH TOO SHORT IN SAVE_FS_BY_PATH";
	else {
		if (root_dirs.includes(rootname)) {} else if (rootname === "runtime") {} else if (rootname == "/") {
			if (!if_root) err = "Cannot save in the root directory";
		} else err = "Cannot save in directory:\x20" + rootname;
	}
	if (err) {
		cb(null, err);
		return;
	}
	let fname = arr.pop();
	let path = null;
	if (arr.length) path = arr.join("/");
	else path = "/";
	let dosave = (dir, obj) => {
		save_fs_file(dir, obj, fname, val, cb, {
			MIMEARG: mimearg,
			APPARG: apparg,
			NOFOBJ: if_no_fobj,
			APPEND: if_append,
			WINID: winid,
			ROOT: if_root,
			DSK: dsk
		});
	};
	if (rootname == "/") {
		if (dsk) return dosave(dsk.fs_root, dsk.root);
		return dosave(fs_root, root);
	}
	get_or_make_dir(rootname, path, (objret, dirret) => {
		if (!dirret) {
			cb(null, "Could not stat the file");
			return;
		}
		dosave(dirret, objret);
	}, false, if_mkdir, dsk);
}
this.save_fs_by_path = save_fs_by_path;
this.savefile = save_fs_by_path;
//»
const save_fs_file = (dir, obj, fname, val, cb, opts = {}) => {//«
	const err = (e) => {
console.error("dir.getFile",e);
		cb();
	};
	if (!opts) opts = {};
	let mimearg = opts.MIMEARG;
	let apparg = opts.APPARG;
	let if_no_fobj = opts.NOFOBJ;
	let if_append = opts.APPEND;
	let if_root = opts.ROOT;
	let winid = opts.WINID;
	let blob;
	let dsk = opts.DSK;
	if (val instanceof Blob) blob = val;
	else if (val instanceof ArrayBuffer) blob = new Blob([val], {
		type: "blob"
	});
	else {
		blob = new Blob([val], {
			type: "blob"
		});
		blob.__value = val;
	}
	dir.getFile(fname, {
		create: true
	}, fent => {
		write_fs_file(fent, blob, (ret, thisobj) => {
			if (ret) {
				let arr = fent.fullPath.split("/");
				arr.shift();
				arr.shift();
				let fullpath = "/" + arr.join("/");
				path_to_obj(fullpath, async gotobj => {
					let lenret = thisobj.position;
					if (gotobj) {
						if (Core.Desk) {
							let sha1 = await Core.api.sha1(val);
							let byteret = await Core.api.blobAsBytes(blob);
							if (opts.DSK) opts.DSK.Desk.check_open_files(fullpath, winid, lenret, sha1, byteret);
							else Core.Desk.check_open_files(fullpath, winid, lenret, sha1, byteret);
						}
					}
/*«
					let app;
					if (fname.match(/\.lnk$/)) {
						app="Link";
					}
					else if (apparg) app = mimearg;
					else app = '';
					if (obj&&obj.KIDS[fname]){
						let kid = obj.KIDS[fname];
						if (app=="Link") {
							kid.LINK = val;
						}
						if (kid.entry){
							kid.entry.file(file=>{
								kid.file=file;
								cb(fent, lenret);
							});
							return;
						}
					}
					else if (obj && !if_no_fobj) { //obj here means a parent object
						let kid = {
							NAME: fname,
							APP: app
						};
						kid.par = obj;
						kid.root = obj.root;
						kid.fullpath = fullpath;
						obj.KIDS[fname] = kid;
					}
»*/
					cb(fent, lenret);
				}, if_root, fname.match(/\.lnk$/), dsk);
			} else cb();
		}, if_append, (val && val.length == 1 && val.charCodeAt() == 0));
	}, err);
}
this.save_fs_file = save_fs_file;
//»
const save_resdata = (fname, dat, cb, path_arg, if_make, dsk) => {//«
	get_or_make_dir("code", path_arg, (objret, dirret) => {
		if (objret && dirret) save_fs_file(dirret, objret, fname, dat, cb, {
			ROOT: true
		});
		else cb();
	}, null, null, dsk);
}
//»
this.get_file_len_and_hash_by_path=(path,cb,dsk)=>{get_fs_by_path(path,async ret=>{if(ret)cb(ret.length,(await Core.api.sha1(ret)),ret);else cb();},{BLOB:true},{DSK:dsk});}

//»

//File ops(mv,cp,unzip)«

let crc32_table;
const make_crc32_table=()=>{//«
    var c = 0, table = new Array(256);
    for(var n =0; n != 256; ++n){
        c = n;
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        table[n] = c;
    }
    return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
};//»
this.dogzip=(bufin,if_gunzip)=>{//«

let int_to_byte_arr=(num)=>{//«
    var arr = new Uint8Array(4);
    arr[0]=num&0xff;
    arr[1]=(num&0xff00)>>8;
    arr[2]=(num&0xff0000)>>16;
    arr[3]=(num&0xff000000)>>24;
    return arr;
};//»
let arrbuf_as_bytes=(buf, posarr)=>{//«
    var arr =  new Uint8Array(buf);
    if (posarr) return arr.slice(posarr[0], posarr[1]);
    return arr;
};//» 
let blob_as_bytes=(blob, cb, posarr)=>{//«
    var reader = new FileReader();
    reader.onloadend = function() {
        cb(arrbuf_as_bytes(reader.result, posarr));
    }
    reader.onerror = function() {
        cb();
    }
    reader.readAsArrayBuffer(blob);
};//»
let to_bytes=(arg, cb, if_b64)=>{//«
    if (typeof arg == "string") {
        let arr;
        arg = new Blob([arg], {type:"application/octet-stream"});
    }   
    if (arg instanceof Uint8Array) cb(arg);
    else if (arg instanceof ArrayBuffer) cb(arrbuf_as_bytes(arg));
    else if (arg instanceof Blob) blob_as_bytes(arg, cb);
    else {
cwarn("blob_or_arrbuf_as_bytes(): GOT NO ArrayBuffer OR Blob!!!!");
        if (cb) cb();
    }   
};//»
function crc32(str, cb, ret_meth) {//«
	if (!crc32_table) crc32_table = make_crc32_table();
	let table = crc32_table;
	function crc32_buf(buf) {//«
		if(buf.length > 10000) return crc32_buf_8(buf);
		for(var crc = -1, i = 0, L=buf.length-3; i < L;) {
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		}
		while(i < L+3) crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		return crc ^ -1;
	}//»
	function crc32_buf_8(buf) {//«
		for(var crc = -1, i = 0, L=buf.length-7; i < L;) {
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		}
		while(i < L+7) crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		return crc ^ -1;
	}//»
	function crc32_str(str) {//«
		for(var crc = -1, i = 0, L=str.length, c, d; i < L;) {
			c = str.charCodeAt(i++);
			if(c < 0x80) {
				crc = (crc >>> 8) ^ table[(crc ^ c) & 0xFF];
			} else if(c < 0x800) {
				crc = (crc >>> 8) ^ table[(crc ^ (192|((c>>6)&31))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
			} else if(c >= 0xD800 && c < 0xE000) {
				c = (c&1023)+64; d = str.charCodeAt(i++) & 1023;
				crc = (crc >>> 8) ^ table[(crc ^ (240|((c>>8)&7))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>2)&63))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((d>>6)&15)|((c&3)<<4))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(d&63))) & 0xFF];
			} else {
				crc = (crc >>> 8) ^ table[(crc ^ (224|((c>>12)&15))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>6)&63))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
			}
		}
		return crc ^ -1;
	}//»
	to_bytes(str, ret=>{
		if (!ret) return cb();
		let num = new Uint32Array([crc32_buf(ret)])[0];
		if (ret_meth=="bytes") {
			let arr = new Uint8Array(4);
			arr[0]=num&0xff;
			arr[1]=(num&0xff00)>>8;
			arr[2]=(num&0xff0000)>>16;
			arr[3]=(num&0xff000000)>>24;
			num=arr;
		}
		else {
			num = num.toString(16);
			num = "0".repeat(8-num.length) + num;
		}
		cb(num);
	});
}
//»
let gzip=(str, cb, ret_meth)=>{//«
	let bufarr;
	if (typeof str == "string") bufarr = new TextEncoder("utf-8").encode(str);
	else bufarr = str;	
	crc32(str, crcarr=>{
//		let timearr = int_to_byte_arr(now(true));
		let timearr = int_to_byte_arr(Core.api.tmStamp());
		let sizearr = int_to_byte_arr(str.length);

		let headbytes = [
			0x1f, 0x8b, 
			0x08, //DEFLATE
			0x0, //FLAGS
			timearr[0], timearr[1], timearr[2], timearr[3],
		//	(num&0xff), (num&0xff00)>>8, (num&0xff0000)>>16, (num&0xff000000)>>24, //TIME
			0x0, //COMPRESSION FLAGS
			0x3 //OS==Unix
		];
		Core.load_mod("util.Deflate", ret=>{
			if (ret) {
				let deflate = new window[__OS_NS__].mods.Zlib.RawDeflate(bufarr);
				let bytes = deflate.compress();
				let outarr = new Uint8Array(headbytes.length+bytes.length+8);
				outarr.set(headbytes, 0);
				outarr.set(bytes, headbytes.length);
				outarr.set(crcarr, headbytes.length+bytes.length);
				outarr.set(sizearr, headbytes.length+bytes.length+crcarr.length);
				cb(outarr);
			}
			else cb()
		},{CALL:true});

	},"bytes");
}
//»
let gunzip = function(bytes, cb, if_bin) {//«
	let mods = window[__OS_NS__].mods;
	function dogunzip() {//«
		let gunzip = new mods.Zlib.Gunzip(bytes);
		let plain = gunzip.decompress();
		let dataView = new DataView(plain.buffer);
		if (if_bin){
			cb(plain.buffer);
		}
		else {
			try {
				let decoder = new TextDecoder('utf-8');
				cb(decoder.decode(dataView));
			}
			catch(e){
				cb(bytes2str(new Uint8Array(plain.buffer)));
			}
		}
	}//»
	let blob_as_bytes=(blob, cb, posarr)=>{//«
		var reader = new FileReader();
		reader.onloadend = ()=>{
			cb(arrbuf_as_bytes(reader.result, posarr));
		}
		reader.onerror = ()=>{
			cb();
		}
		reader.readAsArrayBuffer(blob);
	};//»
	Core.load_mod("util.Gunzip", function(ret) {//«
		if (!ret) return cb();
		if (bytes instanceof Blob) {
			blob_as_bytes(bytes, byteret=>{
				if (!byteret)  {
cerr("util.gunzip blob_as_bytes??????");
					cb();
					return;
				}
				bytes = byteret; 
				dogunzip();
			});
		}
		else dogunzip();
	}, {CALL:true});//»
}//»
return new Promise((y,n)=>{//«
	let ext = null;
	let func;
	let verb;
	if (if_gunzip) {
		func = gunzip;
		verb = "inflate";
	}
	else {
		func = gzip;
		verb = "deflate";
	}
	func(bufin, ret2=>{
		if (!ret2) return y();
		if (if_gunzip) y(Core.api.bufToStr(ret2));
		else y(new Blob([ret2],{type:"application/gzip"}));
	}, true);
});//»

};//»

this.com_mv = (shell_exports, args, if_cp, dom_objects) => {//«
	const {
		respbr,
		werr,
		wclerr,
		wout,
		cbok,
		cberr,
		serr,
		cur_dir,
		failopts,
		is_root,
		get_var_str,
		termobj,
	} = shell_exports;
	let {
		path_to_obj,
		dsk
	} = shell_exports;
	if (!path_to_obj) {
		path_to_obj = fsobj.path_to_obj;
console.warn("NOT PASSING IN path_to_obj!!!");
	}
	let _get_fullpath = (path, cwd, if_no_deref, if_getlink) => {
		return get_fullpath(path, if_no_deref, cwd, if_getlink);
	};
	let dohash;
	let sws;
	if (failopts) sws = failopts(args, {
		LONG: {
			hash: 1,
			forcerem: 1,
			remtype: 3
		},
		SHORT: {
			f: 1,
			r: 1,
			t: 3
		}
	});
	else sws = {};
	if (!sws) return;
	let forcerem = (sws.forcerem || sws.r);
	let remtype = (sws.remtype || sws.t);
	let gotfail = false;
	if (forcerem) {
		if (!remtype) return serr("Need a remote type(opt=remtype|t)for opt=forcerem|r");
		if (!(remtype == "dir" || remtype == "file")) return serr("Expected remtype=dir|file");
	}
	let force = sws.f;
	if (!args.length) return serr("missing file operand");
	else if (args.length == 1) return serr("missing destination file operand after '" + args[0] + "'");
	if (args.length < 2) {
		serr("Too few args given");
		return;
	}
	let verb = "move";
	let com = "mv";
	if (if_cp) {
		verb = "copy";
		com = "cp";
	}
	let topatharg = _get_fullpath(args.pop(), cur_dir, true).regpath();
	let iter;
	let icon_obj = {};
	let towin = null;
	if (dom_objects) {
		icon_obj = dom_objects.ICONS;
		towin = dom_objects.WIN;
	}
	const start_moving = (destret, force_rem) => {
		let errarr = [];
		let mvarr = [];
		iter = -1;
		const domv = async () => {
			iter++;
			if (iter == mvarr.length) {
				if (Desk && !dom_objects) Desk.update_folder_statuses();
				if (gotfail) return cberr();
				cbok();
				return;
			}
			let arr = mvarr[iter];
			if (arr.ERR) {
				gotfail = true;
				werr(arr.ERR);
				domv();
			} else {
				let frompath = arr[0];//«
				let fromicon = icon_obj[frompath];
				let topath;
				let todir;
				let fent = arr[1];
				let type = fent.root.TYPE;
				let app = fent.APP;
				let gotfrom, gotto;
				let savedirpath;
				let savename;
//»
				if (destret || force_rem) {//«
					if (force_rem) {
						if (remtype == "dir") {
							topath = topatharg.replace(/\/+$/, "") + "/" + fent.NAME;
							savedirpath = topatharg;
							gotto = savedirpath + "/" + fent.NAME;
							savename = fent.NAME;
						} else {
							gotto = topath = topatharg;
							let arr = topatharg.split("/");
							let name = arr.pop();
							savedirpath = arr.join("/");
							savename = name;
						}
					} else {
						if (destret.APP == "sys.Explorer") {
							topath = topatharg.replace(/\/+$/, "") + "/" + fent.NAME;
							savedirpath = get_path_of_object(destret);
							gotto = savedirpath + "/" + fent.NAME;
							savename = fent.NAME;
						} else {
							gotto = topath = topatharg;
							savedirpath = get_path_of_object(destret.par);
							savename = destret.NAME;
						}
					}
				} else {
					topath = topatharg;
					gotto = _get_fullpath(topath, cur_dir);
					let arr = gotto.split("/");
					savename = arr.pop();
					savedirpath = arr.join("/")
				}//»
				gotfrom = _get_fullpath(frompath, cur_dir, null, true);
				if (!(gotfrom && gotto)) {
					if (!gotfrom) {
						gotfail=true;
						werr("Could not resolve:\x20" + frompath);
					}
					if (!gotto) {
						gotfail=true;
						werr("Could not resolve:\x20" + topath);
					}
					domv();
					return;
				}
				const saverem = (patharg, val, cb) => {//«
					save_remote_file(patharg, val, (ret2, err) => {
						if (!ret2) {
							gotfail=true;
							if (err) werr(err);
							else werr("Could not " + com + " to the remote destination");
						}
						domv();
					}, {
						IFHASH: sws.hash,
						IFFORCE: forcerem,
						UPLOADCB:(rv)=>{
							if (Number.isFinite(rv)) wclerr(rv+"%");							
						}
					});
				};//»
				const getrem = (patharg, cb) => {//«
					get_rem_file(patharg, (retval, errret) => {
						if (!retval) {
							gotfail=true;
							if (errret && errret.MESS) werr(patharg + ":\x20The server replied:\x20" + errret.MESS);
							else werr("Could not stat the remote file:\x20" + patharg);
							return domv();
						}
						cb(retval);
					}, {
						NOCACHE: get_var_str("NO_REM_CACHE") === "true"
					}, type === "local");
				};//»
				const do_rem = savedir => {//«
					if (savedir) {
						if (!check_user_perm_of_fobj(savedir)) {
							werr(topath + ":\x20Permission denied");
							domv();
							return;
						}
					}
					if (!if_cp) {
						werr("Not\x20(yet)\x20implementing move to remote");
						domv();
						return;
					}
					if (type == "remote") {
						getrem(gotfrom, retval => {
							if (retval) saverem(gotto, retval);
						});
					} else if (type == "fs") {
						get_fs_by_path(gotfrom, (retval, err) => {
							if (!retval) {
								if (err) werr(err);
								else werr("Could not stat the local file:\x20" + frompath);
								domv();
							} else saverem(gotto, retval);
						}, {
							BLOB: true,
							ROOT: is_root
						});
					} else if (type == "local") {
						let cancelled = false;
						termobj.kill_register(killcb => {
							cancelled = true;
							cbok("Cancelled!");
							killcb();
						});
						let blobs = [];
						let next_cb = null;
						let tot = 0;
						let nbytes;
						let too_big = sz => {
							cancelled = true;
							werr("The file is too big for saving to 'remote':\x20" + sz + ">" + MAX_REMOTE_SIZE);
							domv();
						};
						readFileStream(gotfrom, (ret, next_cb_ret, nBytesRet) => {
							if (cancelled) return;
							if (!ret) {
								if (next_cb_ret) {
									next_cb = next_cb_ret;
									return;
								} else if (nBytesRet) {
									nbytes = nBytesRet;
									if (nbytes > MAX_REMOTE_SIZE) return too_big(nbytes);
									werr(frompath + "(" + nBytesRet + ")");
									respbr(true, true);
//									wclerr("0%");
									return;
								}
								return;
							}
							if (ret === true) {
								saverem(gotto, new Blob(blobs, {
									type: "blob"
								}));
								return;
							}
							if (ret instanceof Uint8Array) {
								nBytes = ret.length;
								ret = new Blob([ret], {
									type: "binary"
								});
							}
							tot += ret.size;
							if (tot > MAX_REMOTE_SIZE) return too_big(tot);
							if (nbytes) wclerr(100 * (Math.floor(tot / nbytes)) + "%");
							blobs.push(ret);
							next_cb();
						});
					} else {
						werr("What type to " + verb + " from?");
						domv();
					}
				};
				if (forcerem) return do_rem();
//»
				path_to_obj(savedirpath, savedir => {//«
					if (!savedir) {
						werr(savedirpath + ":no such directory");
						domv();
						return
					}
					let savetype = savedir.root.TYPE;
//					if (app == "sys.Explorer") move_fifos_and_links_of_dir(frompath, topath, dsk&&dsk.fspref);
					if (savetype == "device") {
						werr("Ignoring:\x20" + verb + " to device file:\x20" + topath);
						domv();
						return;
					} else if (savetype == "local") {
						werr("Not(yet)implementing move to local");
						domv();
					} else if (savetype == "remote") do_rem(savedir);
					else if (savetype != "fs") {
						werr("Not (yet) supporting " + verb + " to " + savetype);
						domv();
						return;
					} else {
						if (type == "remote" || type == "local") {//«
							if (type == "local") {
								let saver = new FileSaver();
								saver.set_cb("error", mess => {
									werr(mess);
									domv();
								});
								saver.set_cwd(savedirpath, parobj => {
									saver.set_filename(savename, newname => {
										saver.set_writer(ret => {
											let icons = null; /* At this point,we want to create an icon like in make_drop_icon than can be cancelled by clicking on the imgdiv */
											if (!ret) {
												werr("There was a problem!");
												domv();
												return;
											}
											let cancelled = false;
											let killcb = cb => {
												if (cancelled) {
													cb && cb();
													return;
												}
												cancelled = true;
												saver.cancel(() => {
													cbok("Cancelled!");
													cb && cb();
												});
												if (icons) {
													for (let icn of icons) Desk.rm_icon(icn);
												}
											};
											termobj.kill_register(killcb);
											saver.set_cb("update", per => {
												let str = per + "%";
												wclerr(str);
												if (icons) {
													for (let icn of icons) icn.overdiv.innerHTML = str;
												}
											});
											saver.set_cb("done", () => {
												termobj.kill_unregister(killcb);
												wclerr("100%");
												if (icons) {
													for (let icn of icons) icn.activate()
												};
												domv();
											});
											saver.start_blob_stream();
											let nBytes = null;
											let next_cb = null;
											if (Desk) {
												icons = mv_desk_icon(null, gotto, app, {
													ICON: fromicon,
													WIN: towin,
													DSK:dsk
												});
												if (icons) {
													for (let icn of icons) {
														icn.disabled = true;
														Desk.add_drop_icon_overdiv(icn);
														icn.overdiv.cancel_func = killcb;
													}
												}
											}
											readFileStream(gotfrom, (ret, next_cb_ret, nBytesRet) => {
												if (cancelled) return;
												if (!ret) {
													if (next_cb_ret) {
														next_cb = next_cb_ret;
														return;
													} else if (nBytesRet) {
														if (nBytes) {
															return cerr("Got nBytesRet while nBytes is already set!!!");
														}
														nBytes = nBytesRet;
														werr("Filesize:\x20" + nBytes);
//														wclerr("0%");
														saver.set_fsize(nBytes);
														return;
													}
													cerr("NOTHING FOUND");
													return;
												}
												if (ret === true) {
													saver.end_blob_stream();
													return;
												}
												if (ret instanceof Uint8Array) {
													nBytes = ret.length;
													ret = new Blob([ret], {
														type: "binary"
													});
												}
												saver.append_blob(ret, next_cb);
											});
										});
									}, force);
								});
							} else { /*Guaranteed to be a fairly small file because it is on the official backend*/
								getrem(gotfrom, retval => {
									if (retval) {
										save_fs_by_path(gotto, retval, (ret, err) => {
											mv_desk_icon(null, gotto, app, {
												ICON: fromicon,
												WIN: towin,
												DSK:dsk
											});
											domv();
										}, {
											ROOT: is_root
										});
									}
								});
							}
						}//»
						else {
							mv_by_path(gotfrom, gotto, app, parobj => {
								if (!parobj) werr("Could not " + verb + " from " + frompath + " to " + topath+"!");
								else {
									if (if_cp) gotfrom = null;
									mv_desk_icon(gotfrom, gotto, app, {
										ICON: fromicon,
										WIN: towin,
										DSK: dsk
									});
								}
								domv();
							}, if_cp, is_root, dsk);
						}
					}
				},0,0,dsk);//»
			}
		};
		const getobj = () => {
			iter++;
			if (iter == args.length) {
				iter = -1;
				domv();
				return;
			}
			let fname = _get_fullpath(args[iter], cur_dir, null, true);
			if (!fname) {
				mvarr.push({
					ERR: "get_fullpath():\x20returned null:\x20" + args[iter]
				});
				getobj();
				return;
			}
			path_to_obj(fname, srcret => {//«
				if (!srcret) mvarr.push({
					ERR: com + ":\x20no such entry:\x20" + fname
				});
				else {
					let srctype = srcret.root.TYPE;
					if (srcret.treeroot || (srcret.root == srcret)) mvarr.push({
						ERR: "Skipping:\x20" + fname
					});
					else if ((srctype == "remote" || srctype == "local") && !if_cp) mvarr.push({
						ERR: com + ":\x20" + fname + ":\x20cannot move from the remote directory"
					});
					else if (!(srctype == "fs" || srctype == "remote" || srctype == "local")) mvarr.push({
						ERR: com + ":\x20" + fname + ":\x20cannot " + verb + " from directory type:\x20" + srctype
					});
					else mvarr.push([fname, srcret]);
				}
				getobj();
			}, true,0,dsk);//»
		};
		getobj();
	};
	if (forcerem) return start_moving(null, true);
	path_to_obj(topatharg, destret => {//«
		if ((args.length > 1) && (!destret || (destret.APP != "sys.Explorer"))) {
			serr("Invalid destination path:\x20" + topatharg);
			return;
		} else if (!force && args.length == 1 && destret && destret.APP != "sys.Explorer") {
//This allows a destination to be clobbered if the name is in the folder.
//Only if the file is explicitly named, does this error happen.
			serr("The destination exists:\x20" + topatharg);
			return;
		}
		if (destret && destret.root.TYPE == "fs") {
			if (!check_fs_dir_perm(destret, is_root)) {
				return serr(topatharg + ":\x20permission denied");
			}
		}
		start_moving(destret);
	},0,0,dsk);//»
}//»


//»
//Init/Populate«

const get_tree=(which,type)=>{let dir={NAME:which,TYPE:type,KIDS:{},APP:"sys.Explorer",sys:true};if(which=="serv")dir.done=true;dir.root=dir;dir.KIDS['.']=dir;return dir;}
const get_dev_tree=()=>{let devdir={NAME:"dev",TYPE:"device",KIDS:{},APP:"sys.Explorer",'sys':true,done:true};const setdev=(name,parobj)=>{let obj={"NAME":name,"APP":"Device"};obj.root=devdir;obj.par=parobj;parobj.KIDS[name]=obj;};const adddir=(name,parobj)=>{var obj={"NAME":name,"APP":"sys.Explorer",done:true};obj.root=devdir;obj.par=parobj;var kids={};kids["."]=obj;kids[".."]=parobj;obj.KIDS=kids;parobj.KIDS[name]=obj;};devdir.root=devdir;devdir.KIDS["."]=devdir;device_arr.forEach(val=>{setdev(val,devdir);});adddir("gamepad",devdir);["1","2","3","4"].forEach(val=>{setdev(val,devdir.KIDS.gamepad);});adddir("autoevt",devdir);for(let i=0;i<NUM_AUTO_EVENTS;i++)setdev((i+1)+"",devdir.KIDS.autoevt);return devdir;}
const mount_dir=(name,treeobj,rootarg)=>{let _root=rootarg||root;if(_root.KIDS[name])return;treeobj.NAME=name;treeobj.par=_root;treeobj.KIDS['..']=_root;treeobj.KIDS['.']=treeobj;_root.KIDS[name]=treeobj;}

this.make_local_tree=()=>{return new Promise((Y,N)=>{Core.xgettext(Core.loc_url()+"/",(ret,err)=>{if(ret=="HI")mount_dir("loc",get_tree("loc","local"));else{cerr("Invalid return value from server in fs.make_local_tree",ret);}Y(ret);});});}

this.make_all_trees = (allcb, rootarg, fsarg) => {//«
	const useroot = rootarg||root;
	const make_dir_tree = (name, treecb, force) => {//«
		const new_root_tree = (name, type) => {//«
			let obj = {
				APP: "sys.Explorer",
				NAME: name,
				KIDS: {},
				TYPE: "fs",
				is_root: true
			};
			return obj;
		};//»
		let dirstr = null;
		const domake = () => {//«
			let tree = new_root_tree(name);
			let kids = tree.KIDS;
			tree.root = tree;
			tree.par = useroot;
			kids['.'] = tree;
			kids['..'] = useroot;
			useroot.KIDS[name] = tree;
			(fsarg||fs_root).getDirectory(name, {
				create: true
			}, dirret => {
				let reader;
				let ents;
				const readents = (cbarg) => {
					const toArray = (list) => {
						return Array.prototype.slice.call(list || [], 0);
					};
					reader.readEntries(ret => {
						if (ret.length) {
							ents = ents.concat(toArray(ret));
							readents(cbarg);
						} else {
							for (let i = 0; i < ents.length; i++) {
								let ent = ents[i];
								let name = ent.name;
								let obj = {
									'NAME': name,
									par: tree,
									root: tree
								};
								if (ent.isDirectory) {
									obj.APP = "sys.Explorer";
									obj.KIDS = {
										'.': obj,
										'..': tree
									};
								}
								kids[name] = obj;
							}
							cbarg();
						}
					});
				};
				treecb(tree, dirret);
			}, () => {});
		};//»
		domake();
	};//»
	if (!rootarg){
		mount_dir("serv", get_tree("serv", "service"));
		mount_dir("iface", get_tree("iface", "iface"));
	}
	mount_dir("dev", get_dev_tree(),rootarg);
	mount_dir("site", get_tree("site", "remote"),rootarg);

	let iter = -1;
	const make_tree = () => {
		iter++;
		if (iter >= root_dirs.length) {
			if (allcb) allcb();
			return;
		}
		let name = root_dirs[iter];
		if (name) {
			make_dir_tree(name, (ret, dent) => {
				if (ret) {
					if (name == "tmp") ret.perm = true;
					else {
						ret.perm = false;
						if (name == "code") ret.readonly = true;
						else if (name=="runtime"){
							ret.readonly = true;
							ret.rootonly = true;
						}
					}
					ret.DENT = dent;
					ret.KIDS['.'] = ret;
					ret.KIDS['..'] = useroot;
					useroot.KIDS[name] = ret;
				}
				make_tree();
			});
		} else if (allcb) allcb();
	};
	make_tree();
}
//»
const mkdirkid = (par, name, is_dir, sz, mod_time, path, hashsum, file, ent) => {//«
	let kid = {
		NAME: name,
		par: par,
		root: par.root
	};
	if (is_dir) {
//		kid.APP = "sys.Explorer";
		kid.APP = "sys.Explorer";
		if (par.par.treeroot == true) {
			if (par.NAME == "home") {
				kid.perm = name;
			}
			else if (par.NAME == "var" && name == "cache") {
//				kid.perm = false;
//				kid.rootonly = true;
				kid.readonly = true;
			}
		}
		let kidsobj = {
			'..': par
		};
		kidsobj['.'] = kid;
		kid.KIDS = kidsobj;
	}
	else if (name.match(/\.lnk$/)){
		kid.APP="Link";
	}
	else {
		kid.APP = "";
	}
	if (mod_time) {
		kid.MT = mod_time;
		kid.SZ = sz;
	}
	kid.path = path;
	kid.fullpath = path + "/" + name;
	kid.file = file;
	kid.entry = ent;
	if (hashsum) kid.hashsum = hashsum;
	return kid;
}//»
const populate_dirobj_by_path = (patharg, cb, if_root, dsk) => {//«
	if (!patharg.match(/^\x2f/)) throw new Error("need absolute path in populate_dirobj_by_path: ("+patharg+")");
	path_to_obj(patharg, obj => {
		if (!obj) return cb(null, "Not found:\x20" + patharg);
		if (obj.APP !== "sys.Explorer") return cb(null, "Not a directory:\x20" + patharg);
		populate_dirobj(obj, cb,{DSK:dsk});
	}, if_root,false, dsk);
};
this.populate_dirobj_by_path=populate_dirobj_by_path;//»

const populate_dirobj = (dirobj, cb, opts = {}) => {//«
	if (!cb)cb=()=>{};
	let type = dirobj.root.TYPE;
	let path = objpath(dirobj);
	if (type == "remote") populate_rem_dirobj(path, cb, dirobj, opts);
	else if (type == "local") {
		opts.LOCAL = true;
		populate_rem_dirobj(path, cb, dirobj, opts);
	} else if (type == "fs") populate_fs_dirobj_by_path(path, cb, {par:dirobj, long:opts.LONG});
	else if (type == "service") populate_serv_dirobj(path, cb, dirobj, opts.DIRNAME);
	else if (type == "iface") populate_iface_dirobj(path, cb, dirobj, opts.DIRNAME);
	else {
		cb({})
	}
}
this.populate_dirobj = populate_dirobj;
this.popdir = populate_dirobj;
//»

//const populate_fs_dirobj_by_path = async(patharg, cb, parobj, if_long, dsk) => {
const populate_fs_dirobj_by_path = async(patharg, cb, opts={}) => {//«

let parobj = opts.par;
let if_long = opts.long;
//let stream_cb = opts.streamCb;
if (!cb) cb = () => {};//«
if (!patharg.match(/^\x2f/)) throw new Error("need absolute path in populate_fs_dirobj: ("+patharg+")");
let rootarg;
let fsarg;
patharg = patharg.regpath();

//»

if (!parobj) {//«
	let arr = patharg.split("/");
	if (!arr[0]) arr.shift();
	if (!arr[arr.length - 1]) arr.pop();
	let gotpar = await pathToNode(("/" + arr.join("/")).regpath());
	if (!gotpar) {
		cb();
		return;
	}
	parobj = gotpar;
}

let now = Date.now();
let use_year_before_time = now - (1000 * 86400 * MAX_DAYS);

let rootobj = parobj.root;
let kids = parobj.KIDS;
if (patharg == "/") return cb(kids);
let ents = await getFsDirKids(patharg, opts);
let links=[];

for (let ent of ents){//«
	let name = ent.name;
	if (ent.isDirectory) {
		kids[name] = mkdirkid(parobj, name, true, 0, 0, patharg);
		kids[name].entry = ent;
		continue;
	}

	let file = await getFsFileFromEntry(ent);
	let tm = file.lastModified;
	let timearr = file.lastModifiedDate.toString().split(" ");
	timearr.shift();
	timearr.pop();
	timearr.pop();
	let timestr = timearr[0] + " " + timearr[1].replace(/^0/, " ") + " ";
	if (file.lastModified < use_year_before_time) timestr += " " + timearr[2];
	else {
		let arr = timearr[3].split(":");
		arr.pop();
		timestr += arr.join(":");
	}

	let kid = mkdirkid(parobj, name, false, file.size, timestr, patharg, null, file, ent);
	kids[name] = kid;
	let narr = capi.getNameExt(name);
//log(narr);
	kid.name = narr[0];
	kid.ext = narr[1];
	if (!kid.ext) kid.fullname = kid.name;
	else kid.fullname = name;;
	if (name.match(/\.lnk$/)){
		let val = await getDataFromFsFile(file, "text");
		kid.LINK = val;
		links.push(kid);
	}
	else if (name.match(/\.app$/)){
		kid.appicon = await getDataFromFsFile(file, "text");
	}
	else{
		kid.app = capi.extToApp(name);
		kid.APP=kid.app;
	}
}//»

parobj.longdone = true;
parobj.done = true;

for (let kid of links){
	kid.ref = await pathToNode(kid.LINK);
}

cb(kids);

//»

}

this.populate_fs_dirobj = (patharg, cb, parobj, if_long) => {
populate_fs_dirobj_by_path(patharg, cb, {par:parobj, long:if_long});
};
//»
//this.populate_fs_dirobj = populate_fs_dirobj_by_path;

const populate_rem_dirobj = (patharg, cb, dirobj, opts = {}) => {//«
//cwarn("PATH",patharg);
	let if_local = opts.LOCAL;
	let dsk = opts.DSK;
//	let if_hash = opts.HASH;
//	let if_hash = true;
	let url;
	let marr;
	if (!dirobj) {
		let arr = patharg.split("/");
		arr.shift();
		arr.shift();
		if (dsk) dirobj=dsk.root.KIDS["site"];
		else dirobj = root.KIDS["site"];
		for (let name of arr) {
			let kids = dirobj.KIDS;
			let kid = kids[name];
			if (!(kid && kid.APP == "sys.Explorer")) {
				return cb(null, "No such path:\x20" + patharg);
			} else dirobj = kid;
		}
	}
	if (!patharg) patharg = get_path_of_object(dirobj);
	let holdpath = patharg;
	if (if_local) {
		if (patharg == "/loc") patharg = "/";
		else {
			let marr = ((new RegExp("^/loc(/.*)")).exec(patharg));
			if (!marr) return cb();
			else patharg = marr[1]
		}
		url = "/_getdir?path=" + patharg;
	} else {
		if (patharg == "/site") patharg = "/";
		else {
			marr = ((new RegExp("^/site(/.*)")).exec(patharg));
			if (!marr) return cb();
			else patharg = marr[1]
		}
	}
	if (!if_local) {
		if (marr = (new RegExp("^/users/(.+)$")).exec(patharg)) {
			let arr = marr[1].split("/");
			if (!arr.length) return cb(null, "Invalid users path:\x20" + patharg);
			let uname = arr.shift();
			let dirname = arr.join("/");
			if (!dirname) dirname = "/";
			url = '/_getuserdir?user=' + uname + '&dir=' + dirname;
		} 
//		else if (patharg == "/users") url = '/_getusersdir';
		else {
			patharg = patharg.replace(/^\//, "");
			if (!patharg) patharg = "/";
			url = "/_getsitedir?dir=" + patharg;
		}
		if (opts.DBVIEW) url += "&dbview=1"
	}
	if (if_local) url = Core.loc_url() + url;
	xgetobj(url, async (ret, err) => {
		if (isobj(ret)) {
			if (ret.ERR) return cb(null, ret.ERR);
			else {
				cerr("Populate_rem_dirobj():Unknown return value with url:" + url);
				return cb(null, "?????");
			}
		}
		if (err) return cb(null, err);
		let kids = dirobj.KIDS;
		let par = dirobj;
		dirobj.checked = true;
		dirobj.done = true;
		for (let k of ret) {
			if (k.match(/^total\x20+\d+/)) continue;
			let arr = k.split(" ");
			if (if_local) {
				arr.shift(); /*permissions like drwxrwxrwx or-rw-rw-r--*/
				if (!arr[0]) arr.shift();
				arr.shift(); /*Some random number*/
			}
			while (arr.length && !arr[0]) arr.shift();

			let sz_str = arr.shift();
			let sz = strnum(sz_str);
			let ctime;
			if (!if_local) {
				ctime = parseInt(arr.shift());
				if (isNaN(ctime)) ctime = 0;
			}
			let mtime = arr.shift();

			let tm;
			if (mtime=="None"&&ctime) {
				mtime = ctime;
				tm = parseInt(mtime);
			}
			else tm  = parseInt(mtime);
			if (isNaN(tm)) {
				cwarn("Populate_rem_dirobj():Skipping entry:" + k);
				continue;
			}
			let use_year_before_time = Date.now() / 1000 - (86400 * MAX_DAYS);
			let timearr = (new Date(tm * 1000) + "").split(" ");
			timearr.shift();
			timearr.pop();
			timearr.pop();
			let tmstr = timearr[0] + " " + timearr[1].replace(/^0/, " ") + " ";
			if (tm < use_year_before_time) tmstr += " " + timearr[2];
			else {
				let arr = timearr[3].split(":");
				arr.pop();
				tmstr += arr.join(":");
			}
			let fname = arr.join(" ");
			let isdir = false;
			if (fname.match(/\/$/)) {
				isdir = true;
				fname = fname.replace(/\/$/, "");
			}
			let hash = null;
//			if (if_local && if_hash && !isdir) hash = await xgetText(Core.loc_url() + "/_getfilehash?path=" + patharg + "/" + fname);
            let kidobj = mkdirkid(dirobj, fname, isdir, sz, tmstr, holdpath, hash);
			kidobj.modified = tm;
			kidobj.created = ctime;
			kids[fname] = kidobj;
		}
		cb(kids);
	});
}
this.populate_rem_dirobj = populate_rem_dirobj;
//»
const populate_iface_dirobj = (patharg, cb, dirobj, dirname) => {//«
	let api = NS.api.iface;
	if (!api) return cb({});
	let ifroot = root.KIDS.iface;
	let ifkids = ifroot.KIDS;
	let chans = api.getChannels();
	let parr = patharg.split("/");
	parr.shift();
	parr.shift();
	if (dirobj === ifroot) {
		for (let ch of chans) {
			let dir = {
				NAME: ch,
				APP: "sys.Explorer",
				par: ifroot,
				root: ifroot
			};
			ifkids[ch] = dir;
			let newkids = {
				".": dir,
				"..": ifroot
			};
			dir.KIDS = newkids;
		}
		cb(ifkids);
	} else {
		let chname = parr.shift();
		let chan = api.getChannel(chname);
		let kids = dirobj.KIDS;
		if (!chan) {
			cerr("There is NO CHANNEL NAMED:" + chname + "!!!!!");
			delete kids[chname];
			cb({});
			return;
		}
		let conns = chan.getConnections();
		if (dirobj.par === ifroot) {
			for (let conn of chan.getConnections()) {
				let dir = {
					NAME: conn,
					APP: "sys.Explorer",
					par: dirobj,
					root: ifroot
				};
				kids[conn] = dir;
				let newkids = {
					".": dir,
					"..": dirobj
				};
				dir.KIDS = newkids;
			}
			let arr = ["inbox", "outbox"];
			for (let n of arr) kids[n] = {
				NAME: n,
				APP: "",
				par: dirobj,
				root: ifroot
			};
			cb(kids);
		} else {
			let conname = parr.shift();
			let conn = chan.getConnection(conname);
			if (!conn) {
				delete kids[conname];
				cerr("There is NO CONNECTION NAMED:" + conname + "!!!!!");
				cb({});
				return;
			}
			if (dirobj.par.par === ifroot) {
				let arr = ["ping", "sms", "ssh", "mic", "cam", "midi", "gamepad", "file"];
				for (let n of arr) kids[n] = {
					NAME: n,
					APP: "Port",
					par: dirobj,
					root: ifroot
				};
				cb(kids);
			} else {
				cerr("WUTWUTWUT IFACE PEER SUBDIR LEVELZ HOWMANY????");
				cb({});
			}
		}
	}
}
//»
const populate_serv_dirobj = (patharg, cb, dirobj, dirname) => {//«
	if (!cb) cb = () => {};
	let servroot = root.KIDS.serv;
	if (patharg == "/serv") {
		cb(servroot.KIDS);
		return;
	}
	let curobj = dirobj;
	while (!curobj._) {
		curobj = curobj.par;
		if (curobj === servroot) throw new Error("Could not get the service dir:\x20" + patharg + "!?!?!?");
	}
	dirobj = curobj;
	var kids = curobj.KIDS;
	var exports = dirobj._.exports || {};
	LOOPER: for (let k of getkeys(exports)) {
		let arr = k.split("/");
		let expobj = exports[k];
		let kidobj;
		let name = arr.pop();
		if (!name) continue;
		let curpar = dirobj;
		let curkids = curpar.KIDS;
		for (let dirname of arr) {
			if (!dirname) continue;
			let gotdir = curkids[dirname];
			let newkids;
			if (gotdir) {
				if (gotdir.APP != "sys.Explorer") {
					cwarn("populate_serv_dirobj():Got dirname key that already exists:" + k);
					continue LOOPER;
				}
				newkids = gotdir.KIDS;
			} else {
				gotdir = {
					"NAME": dirname,
					"APP": "sys.Explorer",
					par: curpar,
					root: servroot
				};
				curkids[dirname] = gotdir;
				newkids = {
					".": gotdir,
					"..": curpar
				};
				gotdir.KIDS = newkids;
			}
			curpar = gotdir;
			curkids = newkids;
			if (objpath(curpar) === patharg) kids = curkids;
		}
		kidobj = {
			NAME: name,
			par: curpar,
			root: servroot
		};
		if (isarr(expobj) || isstr(expobj) || expobj instanceof Function) {
			kidobj.APP = "Var";
			kidobj.VAL = expobj;
		}
		curkids[name] = kidobj;
	}
	return cb(kids);
}
//»

//»
//Install/Load«

const app_is_installed = (name, cb, dsk) => {
	path_to_obj(('/code/apps/' + name.replace(/\./g, "/")) + ".js", cb, true,null,dsk);
}
this.app_is_installed=app_is_installed;

const install_app = (appname, cb, opts, dsk) => {
	if (!opts) opts = {};
	let if_single = opts.SINGLE;
	let if_mod = opts.MOD;
	let use_type = opts.TYPE;
	let url;
	let dirstr;
	let ext = "js";
	let app_path = appname.replace(/\./g, "/");
	let path_arr = app_path.split("/");
	let fname = path_arr.pop();
	if (use_type) {
		url = sys_url('/' + use_type + '/' + app_path + '.js');
		dirstr = use_type;
	} else if (if_mod) {
		url = sys_url('/mods/' + app_path + '.js');
		dirstr = "mods";
	} else {
		url = sys_url('/apps/' + app_path + '.js');
		dirstr = "apps";
	}
	let is_text = true;
	xget(url + "?time=" + Date.now(), ret => {
		const dosave = () => {
			if (path_arr.length) dirstr = dirstr + "/" + path_arr.join("/");
			save_resdata(fname + ".js", gotstr, async datret => {
				cb(!!datret);
//				if (datret) cb(true);//«
//				else cb(false);
/*
				if (datret) {
					let sha1 = (await Core.api.sha1(gotstr));
					save_resdata(fname + ".js.sha1", sha1 + "\n" + Core.api.tmStamp(), sharet => {
						if (sharet) cb(true);
						else cb();
					}, "/" + dirstr);
				}
				else cb();
//»*/
			}, "/" + dirstr, null, dsk);
		};
		let gotstr;
		if (typeof ret == "string") {
			gotstr = ret.split(/\r\n/).join("\n");
			dosave()
		} else if (ret && typeof ret == "object" && ret.STAT == 404) cb();
		else cb();
	}, is_text, null, opts.onProgress);
}
this.install_app = install_app;

this.getwasmmod=(which,cb)=>{getmod("util.wasm",wasm=>{if(!wasm)return cb(null,"No wasm module!");Core.get_wasm(which,(wasmret)=>{if(!wasmret)return cb(null,"No "+which+".wasm!");wasm.WASM({wasmBinary:wasmret},which,cb);});});}
this.getstatmod=(which,cb,opts)=>{if(!opts)opts={};opts.STATIC=true;getmod(which,cb,opts);}
const getmod = (which, cb, opts = {}) => {
	let if_static = opts.STATIC;
	let if_global = opts.global;
//	let mods = Core.globals.mods;
	let mods = NS.mods;
	let mod;
	const noop=()=>{};
	if (mods[which]) {
		if (if_static || if_global) cb(mods[which]);
		else cb(new mods[which](Core, noop));
	} else {
		Core.load_mod(which, ret => {
			if (ret) {
				if (if_global) {
					mods[which] = which;
					NS.mods[which](Core, noop);
					cb(mods[which]);
				} else if (if_static) {
					mods[which] = new NS.mods[which](Core, noop);
					cb(mods[which]);
				} else {
					mods[which] = NS.mods[which];
					cb(new mods[which](Core, noop));
				}
				if (typeof ret === "string") Core.do_update(`mods.${which}`, ret);
			} else cb();
		}, opts);
	}
}
this.getmod = getmod;

//»
//Shell/System«

const format_ls = (w, arr, lens, cb, types, col_arg, ret, col_ret) => {
	const min_col_wid = (col_num, use_cols) => {
		let max_len = 0;
		let got_len;
		let use_pad = pad;
		for (let i = col_num; i < num; i += use_cols) {
			if (i + 1 == use_cols) use_pad = 0;
			got_len = lens[i] + use_pad;
			if (got_len > max_len) max_len = got_len;
		}
		return max_len;
	};
	const do_colors=()=>{
		let single=false;
		if (!num){
			num=arr.length;
			num_cols=1;
			single=true;
		}
		for (let i = 0; i < num; i++) {
			type = types[i];
			if (type == "sys.Explorer") colarg = "#909fff";
			else if (type == "FIFO") colarg = "#c4a000";
			else if (type == "Link") colarg = "#0cc";
			else if (type == "BadLink") colarg = "#f00";
			else colarg = null;
			col_num = Math.floor(i % num_cols);
			row_num = Math.floor(i / num_cols);
			if (row_num != cur_row) {
				matrix.push([]);
				xpos = 0;
			}
			let str = arr[i] + "\xa0".rep(col_wids[col_num] - arr[i].length);
			matrix[row_num][col_num] = str;
			if (!col_ret[row_num]) col_ret[row_num] = {};
			let uselen = arr[i].length;
			if (arr[i].match(/\/$/)) uselen--;
			if (colarg) col_ret[row_num][xpos] = [uselen, colarg];
			xpos += str.length;
			cur_row = row_num;
		}
		if (single) return;
		for (let i = 0; i < matrix.length; i++) ret.push(matrix[i].join(""));

	};
	let pad = 2;
	let col_wids = [];
	let col_pos = [0];
	let max_cols = col_arg;
	let num, num_rows, num_cols, rem, tot_wid, min_wid;
	let row_num, col_num;
	let cur_row = -1;
	let matrix = [];
	let type, colarg;
	let xpos;
	if (col_arg == 1) {
		for (let i = 0; i < arr.length; i++) {
			if (w >= arr[i].length) {
				ret.push(arr[i]);
			} else {
				let iter = 0;
				let str = null;
				while (str != "") {
					str = arr[i].substr(iter, iter + w);
					ret.push(str);
					iter += w;
				}
			}
		}
		do_colors();
		cb(ret, col_ret);
		return;
	}
	num = arr.length;
	if (!max_cols) {
		min_wid = 1 + pad;
		max_cols = Math.floor(w / min_wid);
		if (arr.length < max_cols) max_cols = arr.length;
	}
	num_rows = Math.floor(num / max_cols);
	num_cols = max_cols;
	rem = num % num_cols;
	tot_wid = 0;
	for (let i = 0; i < max_cols; i++) {
		min_wid = min_col_wid(i, num_cols);
		tot_wid += min_wid;

		if (tot_wid > w) {
			format_ls(w, arr, lens, cb, types, (num_cols - 1), ret, col_ret);
			return;
		}
		col_wids.push(min_wid);
		col_pos.push(tot_wid);
	}
	col_pos.pop();

	do_colors();
	cb(ret, col_ret);
}
this.get_obj_listing = (kids, w, lscb, opts = {}) => {//«
	let FAKE_TIME = "-------:--";
	let ret = [];
	let types = [];
	let name_lens;
	let isjson = opts.isjson;
	let add_slashes = opts.addslashes;
	let if_hash = opts.ifhash;
	const lsout = () => {
		if (isjson) {
			lscb(ret);
			return;
		}
		if (opts.islong) {
			let hi_szlen = 0;
			for (let i = 0; i < ret.length; i++) {
				let ent = ret[i];
				let sz = ent[1];
				if (sz) {} else if (!util.isnum(sz)) {
					continue;
				}
				let szlen = sz.toString().length;
				if (szlen > hi_szlen) hi_szlen = szlen;
			}
			let lines = [];
			for (let i = 0; i < ret.length; i++) {
				let ent = ret[i];
				let sz = ent[1];
				if (sz) {} else if (!util.isnum(sz)) {
					lines.push(ent);
					continue;
				}
				let nmlen;
				let str = " ".rep(hi_szlen - (sz + "").length) + sz + " ";
				if (ent[3]) str += ent[2] + " " + ent[3] + " " + ent[0];
				else str += ent[2] + " " + ent[0];
				lines.push(str);
			}
			lscb(lines);
		} else {
			if (!w) {
				lscb(ret);
			} else {
				if (opts.newlinemode) return lscb(ret);
				let name_lens = [];
				for (let nm of ret) name_lens.push(nm.length);
				format_ls(w, ret, name_lens, (ls_ret, col_ret) => {
					lscb(ls_ret, null, col_ret);
				}, types, null, [], []);
			}
		}
	};
	let keys = getkeys(kids);
	let iter = -1;
	const dokids = () => {
		const doret = () => {
			if (kid.KIDS) {
				if (opts.islong) {
					key = key + "/";
					if (kid.MT && isint(kid.SZ)) ret.push([key, kid.SZ, kid.MT]);
					else ret.push([key, "-", FAKE_TIME]);
				} else {
					if (add_slashes) key += "/";
					ret.push(key);
				}
			} else {
				if (opts.islong) {
					let arr;
					if (kid.LINK) {
						if (isjson) arr = [
							[key, kid.LINK], kid.LINK.length, FAKE_TIME
						];
						else arr = [key + "\x20->\x20" + kid.LINK, kid.LINK.length, FAKE_TIME];
					} else if (kid.BUFFER) arr = [key, 0, FAKE_TIME];
					else if (util.isnum(kid.SZ)) arr = [key, kid.SZ, kid.MT];
					else arr = [key, 0, FAKE_TIME];
					if (if_hash) arr.push(kid.hashsum);
					ret.push(arr);
				} else ret.push(key);
			}
			dokids();
		};
		iter++;
		if (iter == keys.length) return lsout();
		let key = keys[iter];
		let kid = kids[key];
		if (kid.APP == "Link") {
			if (kid.badlink===true){
				types.push("BadLink");
				doret();
			}
			else if (kid.badlink===false){
				types.push("Link");
				doret();
			}
			else {
				path_to_obj(kid.LINK, ret => {
					if (ret) types.push("Link");
					else types.push("BadLink");
					doret();
				}, opts.isroot, false, opts.DSK);
			}
		} else {
			types.push(kid.APP || "File");
			doret();
		}
	};
	dokids();
}//»

this.get_term_fobj = function(termobj, cur_dir, fname, flags, cb, is_root, funcs) {//«


let EOF = termobj.EOF;
let dsk = termobj.DSK;
const chomp_eof=(arr)=>{const isarr=(arg)=>{return(arg && typeof arg==="object" && typeof arg.length !=="undefined");};if(!isarr(arr))return arr;let pos=arr.indexOf(EOF);if(pos>-1)arr=arr.slice(0,pos);return arr;};

const FileObj=function(fname, flags, cb){

let	_parser,_ukey,_fent,_read,_write,_buffer,_iter=0,_blob=null,_type,_port_cb;//«
let winid;
let thisobj=this;
this.getfobj = ()=>{return winid;}
this.reset=()=>{thisobj.read=_read;thisobj.write=_write;}
this.set_reader=arg=>{thisobj.read=arg;}
this.get_reader=()=>{return thisobj.read;}
this.set_writer=arg=>{thisobj.write=arg;}
this.get_writer=()=>{return thisobj.write;}
this.set_buffer=(newbuf,if_edit_mode)=>{_buffer=newbuf;}
this.get_buffer=()=>{return _buffer;}
//»
const Reader=function(){//«
const rmfobj=()=>{
	if (_write) return cwarn("rmfobj: Not deleting fobj: " + _ukey + " (writable)");
	delete termobj.file_objects[_ukey];
};
if(_ukey.match(/^\/dev\//)){this.is_device=true;this.self=thisobj;let dev=devices[_ukey];let devcb=null;let isonce=false;let cbnum;let isdone=false;let killcb=_cb=>{devcb=null;if(!isonce){dev.unregister_cb(cbnum);rmfobj();}if(_cb)_cb();};cbnum=dev.register_cb(val=>{if(val===null||val===undefined){val=EOF;isdone=true;}if(devcb)devcb(val);if(isonce)killcb();});this.eventonce=(cbarg,if_no_unreg)=>{if(isdone)return cbarg(EOF);devcb=cbarg;isonce=true;thisobj.kill=()=>{log("UNREGISTER!!!!!!");dev.unregister_cb(cbnum);}};this.eventloop=cbarg=>{if(isdone)return cbarg(EOF);devcb=cbarg;termobj.kill_register(killcb);}}
else if(_fent.APP=="FIFO"){this.is_fifo=true;this.self=thisobj;let buf=_fent.BUFFER;let fifocb=null;let interval;let sendline=()=>{let line=buf.shift();fifocb(line);if(util.isobj(line)&& line.EOF)return;if(buf.length)sendline();else dowait();};let dowait=()=>{interval=setInterval(()=>{if(buf.length){clearInterval(interval);sendline();}},100);};this.readline=cb=>{fifocb=cb;if(buf.length)sendline();else dowait();}}
else{this.readline=cb=>{if(_iter==_buffer.length){cb(EOF);rmfobj();}else{cb(_buffer[_iter]);_iter++;}};this.lines=cb=>{if(_fent.APP=="FIFO"){let buf=_fent.BUFFER;if(!buf.length)cb(EOF);else cb(buf);_fent.BUFFER=[];}else cb(_buffer);};this.peek=cb=>{if(_buffer.length)cb(true);else cb();};}
}//»
const Writer=function(){//«

let thiswriter = this;
delete termobj.dirty[_ukey];
this.clear=()=>{_buffer=[];_iter=0;if(!_ukey.match(/^dev-/))termobj.dirty[_ukey]=thisobj;};
this.blob = blobarg => {
	if (_ukey.match(/^\/dev\//)) {
		write_to_device(_ukey, blobarg, null, termobj, funcs);
		return;
	}
	if (_fent.APP == "Port") {
		if (_port_cb) _port_cb(blobarg);
		else cerr("Writing blob to port and got no port_cb!!!");
		return;
	}
	_buffer = blobarg;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
};
this.object = obj => {
	if (_fent.APP == "Port") {
		if (_port_cb) _port_cb(obj);
		else cerr("Writing object to port and got no port_cb!!!");
		return;
	}
	_buffer = obj;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
};
this.line = (str, arg2, cb, opts) => {
	if (!opts) opts = {};
	if (str === "\x00") {
		if (!opts.FORCELINE) {
			cwarn("Writer.line:NULL byte discarded(no opts.FORCELINE)");
			return;
		}
	}
	if (str === EOF) {
		if (_fent.APP == "FIFO") _fent.BUFFER.push(str);
		return;
	}
	var dosync = null;
	if (_ukey.match(/^\/dev\//)) write_to_device(_ukey, str, cb, termobj, funcs);
	else {
		if (_fent.APP == "FIFO") _fent.BUFFER.push(str);
		else {
			_buffer[_iter] = str;
			_iter++;
		}
		termobj.dirty[_ukey] = thisobj;
		if (cb) cb(true);
	}
};
this.lines=(arr,arg2,arg3,arg4,cb,write_cb)=>{if(arr===EOF)return;if(_ukey.match(/^\/dev\//)){write_to_device(_ukey,arr,write_cb,termobj,funcs);return;}let tmp;if(_fent.APP=="FIFO"){tmp=_fent.BUFFER.concat(arr);_fent.BUFFER=tmp;}else{tmp=_buffer.concat(arr);_buffer=tmp;}_iter+=arr.length;termobj.dirty[_ukey]=thisobj;if(cb)cb();if(write_cb)write_cb(1);};
this.sync = async cb=>{
if (_type == "remote") {
	delete termobj.file_objects[_ukey];
	delete termobj.dirty[_ukey];
	if (!(_buffer && _buffer.join)) return cb();
	_buffer = chomp_eof(_buffer);
	save_remote_file(get_path_of_object(_fent), _buffer.join("\n"), ret => {
		cb(ret);
	});
}
else if (_type == "fs") {
	delete termobj.file_objects[_ukey];
	if (_fent.APP == "FIFO") {
		cb();
		return;
	}
	let path = get_path_of_object(_fent);
	let str;
	if (_buffer instanceof Blob) str = _buffer;
	else {
		_buffer = chomp_eof(_buffer);
		str = _buffer.join("\n");
		if (flags.append) str = "\n" + str;
	}
	save_fs_by_path(path, str, (fent, err_or_size) => {
//log("SYNC",fent,err_or_size);
		if (fent) delete termobj.dirty[_ukey];
		else if (err_or_size) {
console.warn("Got no fent from save_fs_by_path! Is the following a proper error message?");
console.error(err_or_size);
			cb();
			return;
		}
		else{
console.warn("Got no fent or err_or_size from save_fs_by_path!!!");
			cb();
			return;
		}

		if (dsk) dsk.Desk.save_hook(path);
		else{
			if (Core.Desk) Core.Desk.save_hook(path, fent);
			else Core.save_hook(path);
		}
		cb(fent);
	}, {
		APPEND: flags.append,
		ROOT: is_root,
		DSK:dsk
	});
}
else if(_type==="iface"){let root=_fent.root;cwarn("Write to iface,got fent",_fent);if(_fent===root){}else if(_fent.par===root){/*Impossible This is just a list of connection folders,right*/}else if(_fent.par.par===root){/*This could be an "OOB" method to send to a non-connected user on the channel like inbox/outbox*/}else if(_fent.par.par.par===root){/*This is a datachannel/connection method*/ let api=NS.api.iface;if(!api){cerr("NOIFACEAPI!?!?!");}else{let ch=_fent.par.par.NAME;let conname=_fent.par.NAME;let port=_fent.NAME;cwarn("Channel",ch,"Connection",conname,"Port",port);let chan=api.getChannel(ch);if(!chan){}else{let conn=chan.getConnection(conname);if(!conn){}else{let str;if(_buffer instanceof Blob)str=_buffer;else{_buffer=chomp_eof(_buffer);str=_buffer.join("\n");if(flags.append)str="\n"+str;}conn.send(port,str);}}}}else{}cb();}
else if (_type=="service") {
cwarn("OBJ IN SERVICE", _buffer);
	cb();
}
else if (_type == "device") {
//cwarn("DEVSYNC",_buffer);
//if (_fent.name)
if (_ukey=="/dev/console"){
//console.warn("[DEV]");
console.log(_buffer);
}
else{
cwarn("Got device sync", _buffer, _fent, _ukey);
}
	cb();
}
else {
cwarn("WHAT TYPE IN SYNC????? " + _type);
		cb();
	}
}
};//»
const make_fobj = (type, fent, ukey) => {//«
	if (ukey) {
		if (typeof(termobj.file_objects[ukey]) == "object") {
			if (!flags.read && flags.write && !flags.append) thisobj.write.clear();
			else {
				_buffer = termobj.file_objects[ukey].get_buffer();
				if (flags.append) thisobj.seek.end();
				else thisobj.clear();
			}
			cb({
				'FOBJ': thisobj,
				'UKEY': ukey
			});
			return;
		}
	}
	_type = type;
	_ukey = ukey;
	if (!fent) {
		cb(true);
		return;
	}
	_fent = fent;
	let buffer = null;
	if (flags.read) _read = new Reader();
	if (flags.write) _write = new Writer();
	if (ukey && !flags.read && flags.write && !flags.append) {
		if (_fent.APP === "Port") {
			let ch = _fent.par.par.NAME;
			let conname = _fent.par.NAME;
			let port = _fent.NAME;
			let chan = NS.api.iface.getChannel(ch);
			if (chan) {
				let conn = chan.getConnection(conname);
				if (conn) _port_cb = obj => {
					conn.send(port, obj);
				};
				else {
					cerr("No connection", conname);
				}
			} else {
				cerr("No channel", ch);
			}
		}
		_buffer = [];
		thisobj.reset();
		cb({
			'WINID': winid,
			'FOBJ': thisobj,
			'UKEY': ukey
		});
	} else {
		if (type == "fs") {
			let path = get_path_of_object(fent);
			if (!ukey) _ukey = "fs-" + path;
			else _ukey = ukey;
			let obj = {
				'WINID': path,
				'FOBJ': thisobj,
				'UKEY': _ukey
			};
			termobj.file_objects[_ukey] = thisobj;
			thisobj.reset();
			_iter = 0;
			if (flags.read) {
				if (fent.BUFFER) cb(obj);
				else {
					get_fs_by_path(path, (ret, err) => {
						if (ret) {
							let lines = ret.split("\n");
							_buffer = lines;
							cb(obj);
						} else {
							cb("Could not get file contents:\x20" + path);
							delete termobj.file_objects[_ukey];
						}
					});
				}
			} else {
				_buffer = [];
				cb(obj);
			}
		} else if (type == "remote") {
			let path = get_path_of_object(fent);
			if (!ukey) _ukey = "site-" + path;
			else _ukey = ukey;
			let obj = {
				'WINID': path,
				'FOBJ': thisobj,
				'UKEY': _ukey
			};
			termobj.file_objects[_ukey] = thisobj;
			thisobj.reset();
			_iter = 0;
			if (flags.read) {
				if (fent.BUFFER) cb(obj);
				else {
					cwarn("READ REMOTE:" + path + "(IS USER???)");
					cb(obj);
				}
			} else {
				_buffer = [];
				cb(obj);
			}
		} else if (type == "device") {
			if (!ukey) _ukey = get_path_of_object(fent);
			thisobj.name = _ukey;
			let obj = {
				'FOBJ': thisobj,
				'UKEY': _ukey
			};
			termobj.file_objects[_ukey] = thisobj;
			thisobj.reset();
			_iter = 0;
			_buffer = [];
			cb(obj);
		} else if (type == "remote") {} else {
			cerr("FOBJ TYPE:" + type + "?");
			cb();
		}
	}
}//»

path_to_obj(get_fullpath(fname, true, cur_dir), winid => {//«
	if (!winid) {
		if (!flags.write) {
			cb();
			return;
		}
		let usefname, dirid;
		let domake = () => {
			if (dirid && usefname) {
				if (typeof(dirid) == "object") {
					if (dirid.treeroot) {
						if (!is_root) cb("Permission denied:\x20cannot save to the root directory");
						else {
							let obj = {
								NAME: usefname,
//								APP: "File",
								par: dirid
							};
							if (usefname.match(/\.lnk$/)) obj.APP="Link";
							obj.root = dirid;
//							dirid.KIDS[usefname] = obj;
							make_fobj("fs", obj);
						}
					} else {
						let root = dirid.root;
						let type = root.TYPE;
//						if (type === "remote" && check_user_perm_of_fobj(dirid)) {
						if (type === "remote") {
console.log(dirid);
							if (!check_user_perm_of_fobj(dirid)) return cb("Permission denied");
							if (flags.append) return cb("Not\x20(yet)\x20supporting remote appends");
						} 
						else if (type == "fs") {
							if (!check_fs_dir_perm(dirid, is_root)) return cb("Permission denied");
						} 
						else return cb("Not yet supporting new FileObj for type==" + type);
						let obj = {
							'NAME': usefname,
//							'APP': "File",
							'par': dirid
						};
						if (usefname.match(/\.lnk$/)) obj.APP="Link";
						obj.root = root;
						dirid.KIDS[usefname] = obj;
						make_fobj(root.TYPE.toLowerCase(), obj);
					}
				} else cb();
			} else cb();
		};
		if (fname.match(/\//)) {
			let arr = fname.split(/\//);
			usefname = arr.pop();
			if (!usefname) {
				cb("no filename given");
				return;
			} else {
				let usedir = get_fullpath(arr.join("/"), null, cur_dir);
				if (!usedir) usedir = "/";
				path_to_obj(usedir, ret => {
					dirid = ret;
					domake();
				}, is_root);
			}
		} else {
			path_to_obj(cur_dir, ret => {
				dirid = ret;
				usefname = fname;
				domake();
			}, is_root);
		}
	} else {
		if (winid.APP == "sys.Explorer") return cb(fname + ":Is a directory");
		let ukey = get_distinct_file_key(winid);
		if (!ukey) {
			log("NO DISTINCT KEY:");
			cb();
			return;
		}
		let root = winid.root;
		let type = root.TYPE;
		let types = ["device", "fs", "iface", "service", "remote"];
		if (types.includes(type)) make_fobj(type, winid, ukey);
		else {
			cerr("WHAT ROOT TYPE:" + root.TYPE);
		}
	}
}, is_root, null, dsk);//»

}//End FileObj


new FileObj(fname, flags, cb);

}//»End get_term_fobj

this.get_serv_func=(path,cb)=>{if(!path.match(/^\/serv\//))return cb();let arr=path.split("/");arr.shift();arr.shift();let which=arr.shift();if(!(which&&arr.length))return cb();let dirobj=root.KIDS.serv.KIDS[which];if(!(dirobj))return cb();if(!arr.length)return cb();cb(dirobj._.exports[arr.join("/")])}

//»
//Saving Blobs/Files«

const FileSaver=function(){//«
/*Howto notes in /var/FileSaver.txt*/
let SLICE_SZ = 1 * MB;
let cwd,fname,basename,fullpath,ext,file,fSize,fEnt,/*This is always what is being written to,and depends on the FileSystem API*/ writer;/*from fEnt.createWriter()*/

let bytesWritten=0;let curpos=0;let update_cb,done_cb,error_cb;let stream_started=false,stream_ended=false;let saving_from_file=false;let cancelled=false;let check_cb=(arg,num)=>{if(arg instanceof Function)return true;cerr("arg #"+num+" is not a valid cb");return false;};
const cerr=str=>{if(error_cb)error_cb(str);else Core.cerr(str);};

const make_kid_obj = () => {
	path_to_obj(cwd, parobj => {
		if (parobj) {
			let kid = {
				NAME: fname,
				APP: "File"
			};
			kid.par = parobj;
			kid.root = parobj.root;
			parobj.KIDS[fname] = kid;
		} else {
			cwarn("make_kid_obj:No parobj!");
		}
	});
};
const get_new_fname = (cb, if_force) => {
	if (!basename) return cerr("basename is not set!");
	let iter = 0;
	const check_and_save = (namearg) => {
		if (iter > 10) return cerr("FileSaver:\x20Giving up after:\x20" + iter + " attempts");
		let patharg = (cwd + "/" + namearg).regpath();
		check_fs_by_path(patharg, name_is_taken => {
			if (name_is_taken && !if_force) return check_and_save((++iter) + "~" + basename);
			cb(namearg);
		});
	};
	check_and_save(basename);
};
const save_file_chunk = (blobarg, cbarg) => {
	if (cancelled) return cwarn("Cancelled!");
	writer.seek(writer.length);
	let slice;
	if (blobarg) slice = blobarg;
	else if (file) slice = file.slice(curpos, curpos + SLICE_SZ);
	else {
		cerr("save_file_chunk():No blobarg or file!");
		return;
	}
	writer.onwriteend = () => {
		if (blobarg) {
			bytesWritten += blobarg.size;
			if (update_cb) {
				if (fSize) update_cb(Math.floor(100 * bytesWritten / fSize));
				else update_cb(bytesWritten);
			}
			if (cbarg) cbarg();
		} else {
			curpos += SLICE_SZ;
			if (writer.length < fSize) {
				if (update_cb) update_cb(Math.floor(100 * writer.length / fSize));
				save_file_chunk();
			} else {
				writer.onwriteend = e => {};
				writer.truncate(writer.position);
				make_kid_obj();
				if (done_cb) done_cb();
			}
		}
	};
	writer.onerror = e => {
		cerr("FileSaver:There was a write error");
		log(e);
	};
	writer.write(slice);
};

this.set_cb=(which,cb)=>{if(which=="update")update_cb=cb;else if(which=="done")done_cb=cb;else if(which=="error")error_cb=cb;else cerr("Unknown cb type in set_cb:"+which);};
this.set_cwd = (arg, cb) => {
	if (!check_cb(cb, 2)) {
console.error("check_cb: failed");
		return;
	}
	if (arg && arg.match(/^\//)) {
		path_to_obj(arg, ret => {
			if (!(ret && ret.APP == "sys.Explorer")) {
				cb();
				return console.error("Invalid directory path:\x20" + arg);
			}
			cwd = arg;
			cb(ret);
		});
	}
	else {
		console.error("Invalid cwd:\x20" + arg + "\x20(must be a fullpath)");
	}
};
this.set_fsize=(arg)=>{if(!(isint(arg)&& ispos(arg)))return cerr("Need positive integer for fSize");fSize=arg;};
this.set_ext=(arg)=>{if(!(arg&&arg.match(/^[a-z0-9]+$/)))return cerr("Invalid extension given:need /^[a-z0-9]+$/");ext=arg;};
this.set_filename = (arg, cb, if_force) => {
	if (!check_cb(cb, 2)) return;
	if (!cwd) {
		cb();
		cerr("Missing cwd");
		return
	}
	if (!arg) arg = "New_File";
	arg = arg.replace(/[^-._~%+:a-zA-Z0-9 ]/g, "");
	arg = arg.replace(/\x20+/g, "_");
	if (!arg) arg = "New_File";
	basename = arg;
	get_new_fname(ret => {
		if (!ret) return cb();
		fname = ret;
		fullpath = (cwd + "/" + fname).regpath();
		cb(fname);
	}, if_force)
};
this.set_writer=(cb)=>{if(!check_cb(cb,1))return;get_fs_ent_by_path(fullpath,(ret,errmess)=>{if(!ret)return cb(null,errmess);fEnt=ret;fEnt.createWriter(ret2=>{if(!ret2)return cb();writer=ret2;cb(true);});},false,true)};
this.save_from_file = (arg) => {
	if (saving_from_file) return cerr("Already saving from a File object");
	if (stream_started) return cerr("Already saving from a stream");
	if (!writer) return cerr("No writer is set!");
	saving_from_file = true;
	fSize = arg.size;
	file = arg;
	if (!update_cb) cwarn("update_cb is NOT set!");
	if (!done_cb) cwarn("done_cb is NOT set!");
	save_file_chunk();
};

this.start_blob_stream=()=>{if(stream_started)return cerr("blob stream is already started!");if(saving_from_file)return cerr("Already saving from a File object");if(!writer)return cerr("No writer is set!");if(!fSize)cwarn("fSize not set,so can't call update_cb with percent update,but with bytes written");if(!update_cb)cwarn("update_cb is NOT set!");if(!done_cb)cwarn("done_cb is NOT set!");stream_started=true;};
this.append_blob=(arg,cb)=>{/* If no fSize is set,we can call update_cb with the number of bytes written */ if(stream_ended)return cerr("The stream is ended!");if(!stream_started)return cerr("Must call start_blob_stream first!");if(!check_cb(cb,2))return;if(!(arg instanceof Blob))return cerr("The first arg MUST be a Blob!");save_file_chunk(arg,cb);};
this.end_blob_stream=()=>{stream_ended=true;make_kid_obj();if(done_cb)done_cb();};
this.cancel=(cb)=>{cwarn("Cancelling... cleaning up!");cancelled=true;fEnt.remove(()=>{cwarn("fEnt.remove OK");cb();},()=>{cerr("fEnt.remove ERR");cb();});};

}
this.FileSaver=FileSaver;
//»

const event_to_files = (e) => {
	var dt = e.dataTransfer;
	var files = [];
	if (dt.items) {
		for (var i = 0; i < dt.items.length; i++) {
			if (dt.items[i].kind == "file") files.push(dt.items[i].getAsFile());
		}
	} else files = dt.files;
	return files;
}
this.event_to_files = event_to_files;

this.drop_event_to_bytes=(e,cb)=>{let file=event_to_files(e)[0];if(!file)return cb();let reader=new FileReader();reader.onerror=e=>{cerr("There was a read error");log(e);};reader.onloadend=function(ret){let buf=this.result;if(!(buf && buf.byteLength))return cb();cb(new Uint8Array(buf),file.name);};reader.readAsArrayBuffer(file);}

//»
//Desktop/Icons/Children«

this.add_new_kid = (parpath, name, cb, app, dsk) => {

	if (name.match(/\.lnk$/)) app="Link";
	const doadd = (par) => {
		if (!(par && par.KIDS)) {
			if (cb) cb();
			return;
		}
		if (par.KIDS[name]){
			if (cb) cb(par.KIDS[name]);
			return;
		}
		let obj = {
			NAME: name,
			par: par,
			root: par.root
		};
		if (app) {
			obj.APP = app;
			if (app == "sys.Explorer") {
				var kidobj = {
					'..': par
				};
				kidobj['.'] = kidobj;
			}
		}
		let gotobj=par.KIDS[name];
		if (!gotobj) {
			gotobj = obj;
			par.KIDS[name] = gotobj;
		}
		if (cb) cb(gotobj);
	};
	if (typeof parpath == "object") doadd(parpath);
	else {
		path_to_obj(parpath, parret => {
			doadd(parret);
		}, null, null, dsk);
	}
}
const mk_desk_icon=(path,opts)=>{mv_desk_icon(null,path,null,opts);}
this.mk_desk_icon=mk_desk_icon;
const mv_desk_icon = (frompath, topath, app, opts = {}) => {
	let _Desk = (opts.DSK && opts.DSK.Desk) || Desk;
	if (!_Desk) return;
	let use_link;
	let ret = [];
	if (app == "sys.Explorer") opts.FOLDER = true;
	let is_folder = opts.FOLDER;
	let no_del_icon = opts.ICON;
	if (no_del_icon){
		delete no_del_icon.disabled;
		no_del_icon.op=1;
	}
	let no_add_win = opts.WIN;
	let is_regular_file = false;
	if (!is_folder && !opts.FIFO && !opts.LINK) is_regular_file = true;
	let fromparts, frombase;
	let icons = [];
	let wins = [];
	if (frompath) {
		icons = _Desk.get_fullpath_icons_by_path(frompath, is_regular_file);
		fromparts = path_to_par_and_name(frompath);
		frombase = fromparts[0];
	}
	let toparts = path_to_par_and_name(topath);
	let tobase = toparts[0].replace(/\/$/, "");
	let toname = toparts[1];
	let ext;
	if (is_regular_file) {
		let re = new RegExp("^(.+)\\.(" + globals.all_extensions.join("|") + ")$");
		let marr = re.exec(toname);
		if (marr && marr[1] && marr[2]) {
			toname = marr[1];
			ext = marr[2];
		}
	}
	if (frombase && (frombase == tobase)) {
		for (let icn of icons) {
			let usename = toname;
			if (ext) usename += "." + ext;
			_Desk.set_icon_name(icn, usename);
		}
	} else {
		for (let icn of icons) {
			if (icn === no_del_icon) {
				delete icn.disabled;
				icn.op=1;
				continue;
			}
			_Desk.rm_icon(icn);
		}
		let wins = _Desk.get_wins_by_path(tobase);
		if (is_folder) opts.FOLDER = true;
		for (let w of wins) {
			if (w === no_add_win) continue;
			let newicon = _Desk.automake_icon(ext, toname, w, opts);
			if (newicon) {
				newicon.deref_link();
				ret.push(newicon);
			}
		}
	}
	if (frompath && topath) _Desk.update_all_paths(frompath, topath);
	return ret;
}
this.mv_desk_icon=mv_desk_icon;

//»
//Event Types«

const GPButtonEvent=function(button,value){this.button=button;this.value=value;this.type="gpbutton";this.toString=function(){return "[event GPButton("+button+","+value+")]";}}
const GPAxisEvent=function(axis,value){this.axis=axis;this.value=value;this.type="gpaxis";this.toString=function(){return "[event GPAxis("+axis+","+value+")]";}}
const GPMotionEvent=function(axis,value){this.axis=axis;this.value=value;this.type="gpmotion";this.toString=function(){return "[event GPMotion("+axis+","+value+")]";}}
const NoOpEvent=function(){this.toString=function(){return "[event NoOp()]";}}
const SynthEvent=function(type,arg){this.type=type;this.data=arg;this.toString=function(){var val="";if(type.match(/^Note/))val=arg.note;else if(type.match(/^Key/))val=arg.key;else if(type=="Pad")val=arg.pad;else if(type=="Knob")val=arg.knob;var str="[event Synth"+type+"("+val;if(isnum(arg.value))str+=","+arg.value;str+=")]";return str;}}
this.SynthEvent = SynthEvent;

//»
//Device«

const write_to_device = (path, arg, cb, termobj, funcs) => {
	let val;
	if (util.isstr(arg)) val = arg;
	else if (util.isarr(arg)) {
		if (path.match(/\/popup$/)) val = arg.join("<br>");
		else if (path.match(/\/window$/)) val = "<pre>" + arg.join("\n") + "</pre>";
		else val = arg.join("\n");
	} else if (arg instanceof Blob) val = arg;
	else if (util.isobj(arg)) val = arg.toString();
	else {
		cwarn("fs.write_to_device():SKIPPING WHAT?");
		log(arg);
		return;
	}
	if (path == "/dev/null") {} else if (path == "/dev/console") {

//		console.log("[DEV] ", val);
		console.log(val);
	} else if (path == "/dev/popup") {
		if (Desk && globals.widgets) globals.widgets.popup(val);
	} else if (path == "/dev/download") {
		let name = (funcs && funcs.getvar("DEV_DL_FNAME")) || "LOTW-DEV-DL.out";
		Core.api.download(val, name);
	} else if (path == "/dev/window") {
		const write_to_new_window = str => {
			let outmake = (which) => {
				return output_doc.createElement(which);
			};
			if (!output_window) {
				output_window = window.open();
				if (!output_window) return cwarn("Could not open a new window!");
				output_doc = output_window.document;
				output_window.onunload = () => {
					output_window = null;
				}
			}
			let div = outmake('div');
			div.style.border = "1px dotted gray";
			div.style.margin = 7;
			div.style.padding = 7;
			let time_arr = (new Date() + "").split(" ");
			time_arr.pop();
			time_arr.pop();
			div.innerHTML = (time_arr.join(" ")) + "<hr>";
			if (isstr(str)) {
				if (str === "\x00") return;
				let pre = outmake('pre');
				pre.innerHTML = str;
				div.appendChild(pre);
			} else if (str instanceof Blob) str.render(div, output_doc);
			else {
				cwarn("write_to_new_window()WHAT?????");
				log(str);
			}
			let body = output_doc.body;
			if (!body.childElementCount) body.appendChild(div);
			else body.insertBefore(div, body.childNodes[0]);
		};
		write_to_new_window(val);
//	} else if (path == "/dev/echo") {
	} else if (path == "/dev/stdout"||path=="/dev/stderr") {
		if (termobj) {
			let writer = termobj.FILES[1].write;
			if (isobj(val) || isstr(val)) writer.line(val.toString());
			else if (isarr(val)) writer.lines(val);
		}
	} else if (path == "/dev/broadcast") {
		Core.send_channel_message(val);
		cwarn("/dev/broadcast wrote:", val);
	} else if (path.match(/^\/dev\/(midi|key|mouse)$/) || path.match(/^\/dev\/gamepad\//)) {} else {
		log("Handle write to device:" + path);
		log(val);
	}
	if (cb) cb(1);
}
this.write_to_device = write_to_device;
const read_device=(path,cb,opts)=>{let dev=devices[path];if(!dev)return cb();let regid=dev.register_cb(ret=>{if(isnull(ret)&& isnum(regid))dev.unregister_cb(regid);cb(ret);},opts);cb(null,killcb=>{dev.unregister_cb(regid);killcb&&killcb();});}
this.read_device = read_device;

//Gamepad«

let GP_MIN_REPEAT_MS = 25;
let GP_INTERVAL_TIMEOUT = 25;
let CUR_GP_INTERVAL_TIMEOUT = GP_INTERVAL_TIMEOUT;
let gp_interval=null;
const gp_interval_on=(req_timeout)=>{let use_timeout=CUR_GP_INTERVAL_TIMEOUT;if(Number.isInteger(req_timeout)&& req_timeout>0 && req_timeout<CUR_GP_INTERVAL_TIMEOUT){if(gp_interval && req_timeout<CUR_GP_INTERVAL_TIMEOUT)clearInterval(gp_interval);CUR_GP_INTERVAL_TIMEOUT=req_timeout;}else if(gp_interval)return;gp_interval=setInterval(get_all_gp_events,CUR_GP_INTERVAL_TIMEOUT);}
const gp_but_to_name=[ "A","B","X","Y","lB","rB","lT","rT","Bk","St","lA","rA","U","D","L","R","Cn" ];

this.gp_buttons = gp_but_to_name;
const gp_axis_to_name=["lX", "lY", "rX", "rY"];
this.gp_axes = gp_axis_to_name;

let gp_cbs=[];
let cur_axis_states=[];
let cur_but_states=[];
const get_all_gp_events=(if_external)=>{if(if_external && gp_interval)return;for(let arr of gp_cbs){if(!arr)continue;get_gp_events(arr[0],arr[1],arr[2]);}}
this.get_all_gp_events = get_all_gp_events;

const get_gp_events=(gpnum,gpvars,cb)=>{const gp_but_is_mask=(but)=>{return(mask_mode &&(but===all_mask||but===posx_mask||but===negx_mask||but===posy_mask||but===negy_mask));};const axis_is_masked=(axis,val)=>{if(!mask_mode)return true;if(all_mask && but_state[all_mask])return true;if(axis==="rX"||axis=="lX"){if(val>=0 && posx_mask && but_state[posx_mask])return true;if(val<0 && negx_mask && but_state[negx_mask])return true;}if(axis==="rY"||axis=="lY"){if(val>=0 && posy_mask && but_state[posy_mask])return true;if(val<0 && negy_mask && but_state[negy_mask])return true;}};let gp=navigator.getGamepads()[gpnum];if(!gp)return cb();let buts=gp.buttons;let axes=gp.axes;let state={};let MIN_AXIS_VAL=0.07;let lx,ly,rx,ry;let motion_mode=gpvars.motion_mode;let repeat_mode=gpvars.repeat_mode;let min_repeat_ms=gpvars.min_repeat_ms;let last_repeat_time=gpvars.last_repeat_time;let mask_mode=gpvars.mask_mode;let all_mask=gpvars.all_mask;let posx_mask=gpvars.posx_mask;let negx_mask=gpvars.negx_mask;let posy_mask=gpvars.posy_mask;let negy_mask=gpvars.negy_mask;let axis_state=cur_axis_states[gpnum];if(!axis_state){axis_state={};cur_axis_states[gpnum]=axis_state;}let but_state=cur_but_states[gpnum];if(!but_state){but_state={};cur_but_states[gpnum]=but_state;}for(let i=0;i<gp_but_to_name.length;i++){let butname=gp_but_to_name[i];let but=buts[i];if(!but)break;let ispressed=but.pressed;if(ispressed){let noevt=false;if(!repeat_mode && but_state[butname]){}else{		if(repeat_mode && but_state[butname]){if(!last_repeat_time)throw new Error("get_gp_events():No last_repeat_time!");if((performance.now()-last_repeat_time)<min_repeat_ms)noevt=true;}if(!noevt && !gp_but_is_mask(butname)){cb(new GPButtonEvent(butname,"down"));if(repeat_mode)gpvars.last_repeat_time=performance.now();}} }else if(!ispressed && but_state[butname]){if(!gp_but_is_mask(butname))cb(new GPButtonEvent(butname,"up"));}but_state[butname]=ispressed;if(motion_mode)state[butname]=ispressed;}for(let i=0;i<gp_axis_to_name.length;i++){let axisname=gp_axis_to_name[i];let val=axes[i];if(Math.abs(val)<MIN_AXIS_VAL)val=0;if(motion_mode){state[axisname]=val;continue;}if(val !==axis_state[axisname]){if(axis_is_masked(axisname,val))cb(new GPAxisEvent(axisname,val));}axis_state[axisname]=val;}if(!motion_mode)return;if(!(state.lX||state.lY||state.rX||state.rY)){if(axis_state){if(axis_state.lX)axis_state.lX=0;if(axis_state.lY)axis_state.lY=0;if(axis_state.rX)axis_state.rX=0;if(axis_state.rY)axis_state.rY=0;}return;}ly=state.lY;ry=state.rY;lx=state.lX;rx=state.rX;if(!ly)axis_state.lY=0;else if(ly>0){let last_ly=axis_state.lY;if(!last_ly)last_ly=0;let ydiff=ly-last_ly;if(ydiff>0){if(axis_is_masked("lY",ydiff))cb(new GPMotionEvent("lY",ydiff));}axis_state.lY=ly;}else if(ly<0){let last_ly=axis_state.lY;if(!last_ly)last_ly=0;let ydiff=Math.abs(ly)-Math.abs(last_ly);if(ydiff>0){if(axis_is_masked("lY",-ydiff))cb(new GPMotionEvent("lY",-ydiff));}axis_state.lY=ly;}if(!ry)axis_state.rY=0;else if(ry>0){let last_ry=axis_state.rY;if(!last_ry)last_ry=0;let ydiff=ry-last_ry;if(ydiff>0){if(axis_is_masked("rY",ydiff))cb(new GPMotionEvent("rY",ydiff));}axis_state.rY=ry;}else if(ry<0){let last_ry=axis_state.rY;if(!last_ry)last_ry=0;let ydiff=Math.abs(ry)-Math.abs(last_ry);if(ydiff>0){if(axis_is_masked("rY",ydiff))cb(new GPMotionEvent("rY",-ydiff));}axis_state.rY=ry;}if(!lx){axis_state.lX=0;}else if(lx>0){let last_lx=axis_state.lX;if(!last_lx)last_lx=0;let xdiff=lx-last_lx;if(xdiff>0){if(axis_is_masked("lX",xdiff))cb(new GPMotionEvent("lX",xdiff));}axis_state.lX=lx;}else if(lx<0){let last_lx=axis_state.lX;if(!last_lx)last_lx=0;let xdiff=Math.abs(lx)-Math.abs(last_lx);if(xdiff>0){if(axis_is_masked("lX",-xdiff))cb(new GPMotionEvent("lX",-xdiff));}axis_state.lX=lx;}if(!rx)axis_state.rX=0;else if(rx>0){let last_rx=axis_state.rX;if(!last_rx)last_rx=0;let xdiff=rx-last_rx;if(xdiff>0){if(axis_is_masked("rX",xdiff))cb(new GPMotionEvent("rX",xdiff));}axis_state.rX=rx;}else if(rx<0){let last_rx=axis_state.rX;if(!last_rx)last_rx=0;let xdiff=Math.abs(rx)-Math.abs(last_rx);if(xdiff>0){if(axis_is_masked("lX",-xdiff))cb(new GPMotionEvent("rX",-xdiff));}axis_state.rX=rx;}}

//»

//MIDI«

let did_get_midi = false;
let num_midi_inputs = 0;
let did_get_inputs = false;
const init_midi = ()=>{

return new Promise(async(y,n)=>{

if (did_get_midi) return y(true);

if (navigator.requestMIDIAccess) {
	const midi_in = (mess) => {
		if (!did_get_midi) {
			cwarn("Midi UP!");
			did_get_midi = true;
		}
		mess.toString = () => {
			var dat = mess.data;
			var str = "[event Midi(" + dat[0] + "," + dat[1];
			if (isnum(dat[2])) str += "," + dat[2];
			str += ")]";
			return str;
		};
		if (Desk) Desk.onmidi(mess);
		for (let cb of midi_cbs) {
			if (cb) cb(mess);
		}
	};
	let midiarg;
	try {
		midiarg	= await navigator.requestMIDIAccess({sysex: false});
	}
	catch(e){
		cerr("navitagor.requestMIDIAccess():", e);
		y();
		return;
	}
	const getinputs = (e) => {//«
		if (e) {
			if (e instanceof MIDIConnectionEvent) {} else {
				cwarn("WHAT MIDISTATECHANGE EVENT?");
				log(e);
			}
		}
		let inputs = midi.inputs.values();
		num_midi_inputs = 0;
		for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
			if (!input.value.name.match(/^Midi Through Port/)) {
				num_midi_inputs++;
				input.value.onmidimessage = midi_in;
			}
		}
		if (num_midi_inputs) {
			if (!did_get_inputs) {
				cwarn("MIDI:connected(" + num_midi_inputs + ")");
				did_get_inputs = true;
			}
		} else {
			for (let cb of midi_cbs) {
				if (cb) cb({
					EOF: true
				});
			}
			did_get_inputs = false;
		}
	};//»
	midi = midiarg;
	midi.onstatechange = getinputs;
	getinputs();
	devices["/dev/midi"] = device_factory("midi");
	root.KIDS.dev.KIDS.midi = {NAME:"midi",APP:"device",root:root.KIDS.dev,par:root.KIDS.dev};
	y(true);
}
else{
cwarn("navigator.requestMIDIAccess: not found!");
	y();
}

})

}
this.init_midi = init_midi;
window.init_midi = init_midi;

//»

//gUM->Microphone«
 
let mic_cbs = [];
let mic_is_going = false;
let mic_track = null;
let mic_media_recorder=null;

async function init_mic(){let BPS=8000;let interval;let srcbuf;let vid=make('audio');let killed=false;let constraints;constraints={audio:true,video:false};let stream=await navigator.mediaDevices.getUserMedia(constraints);mic_is_going=true;mic_track=stream.getTracks()[0];let medrec=new MediaRecorder(stream,{audioBitsPerSecond:BPS});mic_media_recorder=medrec;vid.volume=0;vid.srcObject=stream;vid.play();medrec.onstop=e=>{killed=true;clearInterval(interval);};medrec.ondataavailable=async e=>{if(killed)return;let buf=await Core.api.toBuf(e.data);for(let cb of mic_cbs){if(!cb)continue;cb(buf);}};medrec.start();interval=setInterval(()=>{medrec.requestData();},250);}

//»

//Factory«

const device_factory=(which)=>{//«

function BaseDevice(){let cbs=[];let value;let pos=0;this.cbs=cbs;this.set_value=arg=>{value=arg;};this.register_cb=cb=>{cbs[pos]=cb;pos+=1;return pos-1;};this.unregister_cb=num=>{cbs[num]=undefined;};this.no_cbs=()=>{for(let cb of cbs)if(cb)return false;return true;};this.fire=()=>{for(let cb of cbs){if(!cb)continue;cb(value);}};}
function NullDevice(){this.register_cb=function(cb){setTimeout(cb,10);return 0;};this.unregister_cb=()=>{};}
function MidiDevice() {
	this.register_cb = cb => {
		if (!num_midi_inputs) {
			cb({
				EOF: true
			});
			return;
		}
		midi_cbs.push(cb);
		return (midi_cbs.length - 1);
	};
	this.unregister_cb = num => {
		midi_cbs[num] = null;
	};
}
function GamepadDevice(numarg){const gp_vars={all_mask:false,posx_mask:false,negx_mask:false,posy_mask:false,negy_mask:false,motion_mode:false,mask_mode:false,min_repeat_ms:250,repeat_mode:false};this.register_cb=(cb,opts)=>{if(!opts)opts={};let gotone=false;for(let cb of gp_cbs){if(cb){gotone=true;break;}}if(!gotone)gp_cbs=[];gp_cbs.push([numarg,gp_vars,cb]);if(opts.INTERVAL)gp_interval_on(opts.INTERVAL);return(gp_cbs.length-1);};this.unregister_cb=num=>{if(!gp_cbs[num])return;gp_cbs[num]=null;for(let cb of gp_cbs){if(cb)return;}clearInterval(gp_interval);CUR_GP_INTERVAL_TIMEOUT=GP_INTERVAL_TIMEOUT;gp_interval=null;};this.ioctl=(op,arg,cb)=>{const ok=()=>{cb(true);};const badarg=()=>{cb(null,"Invalid '"+op+"' arg:\x20"+arg)};const err=(str)=>{cb(null,str)};if(!arg)return err("Argument needed!");let marr;if(marr=op.match(/^(motion|repeat|mask)_mode$/)){if(arg==="true"||arg==="false"){gp_vars[marr[1]+"_mode"]=(arg=="true")?true:false;ok();}else badarg();}else if(op=="min_repeat_ms"){let num=strnum(arg);if(!(isint(num)&& num>=GP_MIN_REPEAT_MS))return err("min_repeat_ms:need an integer>="+ GP_MIN_REPEAT_MS);gp_vars.min_repeat_ms=num;ok();}else if(op=="interval"){if(arg=="off"){if(gp_interval){clearInterval(gp_interval);gp_interval=null;}}else if(arg=="on"){if(!gp_interval)gp_interval_on();}else return badarg();ok();}else if(op.match(/^(all|posx|posy|negx|negy)_mask_key$/)){if(arg=="none")arg=null;else if(!gp_but_to_name.includes(arg))return badarg();if(op=="all_mask_key")gp_vars.all_mask=arg;else if(op=="posx_mask_key")gp_vars.posx_mask=arg;else if(op=="negx_mask_key")gp_vars.negx_mask=arg;else if(op=="posy_mask_key")gp_vars.posy_mask=arg;else if(op=="negy_mask_key")gp_vars.negy_mask=arg;ok();}else err("Invalid op:\x20"+op);};}
function MicrophoneDevice(){this.register_cb=cb=>{if(!mic_track)init_mic();mic_cbs.push(cb);return(mic_cbs.length-1);};this.unregister_cb=num=>{mic_cbs[num]({EOF:true});mic_cbs[num]=null;for(let cb of mic_cbs){if(cb)return;}mic_is_going=false;mic_media_recorder.stop();mic_track.stop();mic_media_recorder=null;mic_track=null;};}
function AutoEvtDevice(numarg){const evt_to_func={"NoOp":NoOpEvent,"GPButton":GPButtonEvent,"GPAxis":GPAxisEvent,"GPMotion":GPMotionEvent};const synth_types={"SynthNote":"note","SynthNoteOn":"note","SynthNoteOff":"note","SynthKey":"key","SynthKeyOn":"key","SynthKeyOff":"key","SynthKnob":"knob"};let cur_func=()=>{return new NoOpEvent();};let dev=new BaseDevice();let cbs=dev.cbs;let playing=false;let timer;let BPM=60;let pattern=[1,[]];let repeat=true;let MAX_BPM=360;let MAX_SHIFT=5000;let interval;let start_time=null;let calc_time;let start_align=null;let start_offset=null;let max_offset;let ms_shift=0;let start_time_off;let pattern_pos;let num_neg,num_pos,fudge;let restart=false;let ms_vals={sec:1000,min:60000,hr:3600000};let want_start_time=null;let is_recording=false;const play_init=()=>{var curtime=performance.now();if(start_align){let use_ms=ms_vals[start_align];want_start_time=start_offset+use_ms *(1+Math.floor(curtime/use_ms));if((want_start_time-use_ms)>curtime)want_start_time-=use_ms;setTimeout(play,want_start_time-curtime);}else play();};const play=()=>{playing=true;pattern_pos=0;num_neg=0;num_pos=0;fudge=0;start_time=performance.now();if(want_start_time)calc_time=want_start_time;else calc_time=start_time;let ms_wait;const doevt=()=>{var gotevt;if(is_recording)gotevt=pattern[pattern_pos+1];else gotevt=cur_func(pattern[pattern_pos+1]);pattern_pos+=2;if(pattern_pos>=pattern.length){if(!repeat){stop();return;}pattern_pos=0;}if(gotevt){dev.set_value(gotevt);dev.fire();}if(!playing)return;if(restart){restart=false;return play_init();}let diff=calc_time-performance.now();if(diff<0)num_neg++;else if(diff>0)num_pos++;if(is_recording)ms_wait=pattern[pattern_pos];else ms_wait=pattern[pattern_pos] * 60000/BPM;calc_time+=ms_wait;let timeout=ms_wait+diff;if(ms_shift){timeout+=ms_shift;calc_time+=ms_shift;ms_shift=0;}if(timeout<0){cwarn("Gotta bad timeout:"+timeout+",revert to 0");timeout=0;}timer=setTimeout(doevt,timeout);};if(is_recording)ms_wait=pattern[0];else ms_wait=pattern[0] * 60000/BPM;calc_time+=ms_wait;if(!ms_wait)doevt();else timer=setTimeout(doevt,ms_wait);};const stop=()=>{playing=false;};this.register_cb=cb=>{if(!playing)play_init();return dev.register_cb(cb);};this.unregister_cb=num=>{dev.unregister_cb(num);if(dev.no_cbs())stop();};this.ioctl=(op,arg,cb)=>{const ok=(str)=>{if(str)cb(str);else cb(true);};const operr=(str)=>{cb(null,op+":\x20"+str)};const badarg=()=>{cb(null,"Invalid '"+op+"' arg:\x20"+arg)};const expectargs=(arr)=>{let argstr="";for(let i=0;i<arr.length;i++){if(i>0){if(i+1==arr.length)argstr+=" or ";else argstr+=","}argstr+="'"+arr[i]+"'"}cb(null,"Expected one of:\x20"+argstr)};const err=(str)=>{cb(null,str)};if(op=="is-playing"){if(playing)return ok("true");else return ok("false");}else if(!arg)return err("Argument needed!");else if(op=="bpm"){let num=strnum(arg);if(!(isint(num)&& num>0))return badarg();if(num>MAX_BPM)return err("Maximum bpm:\x20"+MAX_BPM);BPM=num;ok();}else if(op=="evt-type"){if(evt_to_func[arg]){cur_func=args=>{if(!args)args=[];return new evt_to_func[arg](...args);};ok();}else if(synth_types[arg]){cur_func=args=>{if(!(args&&args.length>=1))return null;let val=args[1];if(!val)val=0;let obj={value:val};obj[synth_types[arg]]=args[0];return new SynthEvent(arg.replace(/^Synth/,""),obj);};ok();}else badarg();}else if(op=="set-pattern"){const doset=str=>{let arr;let pat=[];try{arr=JSON.parse(str);}catch(e){return err(e.message);}if(!isarr(arr))return err("Not an array");if(!arr.length || arr.length%2)return err("Invalid array length");for(let i=0;i<arr.length;i+=2){let num=arr[i];if(!(ispos(num)))return err("Invalid wait time at array pos:\x20"+i);pat.push(num);let args=arr[i+1];if(!isarr(args))args=[args];pat.push(args);}pattern=pat;is_recording=false;ok();if(playing)restart=true;};if(arg.match(/^\//)){get_fs_by_path(arg,ret=>{if(!ret)return err("Invalid file arg:\x20"+arg);doset(ret);});}else doset(arg);}else if(op=="set-recording"){if(arg.match(/^\//)){get_fs_by_path(arg,ret=>{if(!ret)return err("Invalid file arg:\x20"+arg);let outarr=[];let start_time=null;let last_time=-1;let arr=ret.split("\n");let obj;for(let i=0;i<arr.length;i++){let ln=arr[i];try{obj=JSON.parse(ln);}catch(e){return err("Invalid JSON at line:\x20"+(i+1));}if(!(isobj(obj)&&obj.type&&obj.data&&obj.t))return err("Invalid object format at line:\x20"+(i+1));let time=obj.t;if(!(isnum(time)&& time>0 && time>last_time))return err("Invalid time at line:\x20"+(i+1));let usetime;if(last_time==-1)usetime=100;else usetime=time-last_time;delete obj.t;outarr.push(usetime,obj);last_time=time;}is_recording=true;pattern=outarr;ok();if(playing)restart=true;});}else operr("Expected a full filepath");}else if(op=="ms-shift"){let num=strnum(arg);if(!isnum(num))return badarg();if(Math.abs(num)>MAX_SHIFT)return err("Maximum absolute value shift:\x20"+MAX_SHIFT);ms_shift=num;ok();}else if(op=="start-align"){let okargs=["none","sec","min","hour"];if(!okargs.includes(arg))return expectargs(okargs);if(arg=="none"){start_align=null;start_offset=null;max_offset=null;}else{start_align=arg;start_offset=0;max_offset=ms_vals[arg]-1;}ok();}else if(op=="start-offset"){if(!start_align)return err("'start-align' is not set!");let num=strnum(arg);if(!isnum(num))return badarg();if(num<0)return err("Non-negative value needed");if(num>max_offset)return err("Maximum offset:\x20"+max_offset+" for start-align,'"+start_align+"'");start_offset=num;ok();}else err("Invalid op:\x20"+op);}}

let marr;
if (which == "null") return new NullDevice();
else if (which == "midi") return new MidiDevice();
else if (which == "mic") return new MicrophoneDevice();
else if (which == "test") return new TestDevice();
else if (marr = which.match(/^gamepad-(\d+)$/)) return new GamepadDevice(parseInt(marr[1]) - 1);
else if (marr = which.match(/^autoevt-(\d+)$/)) return new AutoEvtDevice(parseInt(marr[1]) - 1);
else return new BaseDevice();

}//»

for (let dev of device_arr) devices["/dev/"+dev] = device_factory(dev);
for (let i=0; i < NUM_AUTO_EVENTS; i++) devices["/dev/autoevt/"+(i+1)] = device_factory("autoevt-"+(i+1));
for (let num of ["1","2","3","4"]) devices["/dev/gamepad/"+num] = device_factory("gamepad-"+num);

//»

this.get_device = function(path){return devices[path];}

//»
//Service«

this.start_service = (which, namearg, badarg) => {
//this.start_service = (which, cb, namearg) => {
if (badarg){
	cerr("fs.start_service is now returning a Promise! (Only 2 args used)");
	return;
}
return new Promise((Y,N)=>{

	let servobj = root.KIDS.serv;
	let servkids = servobj.KIDS;
	if (namearg){
		namearg = namearg.toLowerCase();
		if (!namearg.match(/^[a-z]+$/)){
			return N("Module names must have alpha characters only");
		}
		let iter = 0;
		let tryname = namearg + iter;
		while (servkids[tryname]) {
			iter++;
			tryname = namearg + iter;
		}
		namearg = tryname;
	}
	let num;
	let serv;
	const mount = obj => {//«
		let name;
		let is_named;
		if (namearg) {
			name = namearg;
			obj.is_named = true;
		} else {
			let iter = 0;
			let cname = obj.__proto__.constructor.name.toLowerCase();
			let tryname = cname + iter;
			while (servkids[tryname]) {
				iter++;
				tryname = cname + iter;
			}
			name = tryname;
			obj.is_named = false;
		}
		let parobj = {
			"NAME": name,
			"APP": "sys.Explorer",
			done: false,
			"_": obj
		};
		parobj.root = servobj;
		parobj.par = servobj;
		let kids = {
			".": parobj,
			"..": servobj
		};
		parobj.KIDS = kids;
		servkids[name] = parobj;
		globals.services._[name] = obj;
		if (obj.setid) obj.setid(name);
		obj.id = name;
		Y(obj);
		populate_dirobj(parobj);
	};//»
	if (!which) return N("No service type given");
	if (typeof which == "object") {
		if (!(which.setid instanceof Function)) return N("NEED which.setid Function!!!");
		mount(which);
	}
	else if (which == "synth") {
		getmod("av.synth", async mod => {
			if (!mod) return N("No synth.mod");
			mount(mod.get_synth());
		}, {
			STATIC: true
		});
	}
/*
	else if (which == "p2p") {
		let iface = globals.iface;
		if (!iface) return N("NO IFACE IN GLOBALS.IFACE??!?!");
		mount(iface.get_p2p_service());
	}
*/
	else {
		N("Invalid service type:\x20" + which);
		return;
	}
});

}
this.stop_service = (idarg, if_shell) => {
//	let servobj = root.KIDS.serv;
	let servkids = root.KIDS.serv.KIDS;
	let fobj = servkids[idarg];
	if (!fobj) return "Not a running service:\x20" + idarg;
	let obj = fobj._;
	if (if_shell && obj.is_app) return `The service (${idarg}) is owned by an application`;
//	if (servkids[idarg]._.onkill) servkids[idarg]._.onkill();
	if (obj.onkill) obj.onkill();
	delete servkids[idarg];
	globals.services._[idarg] = undefined;
	return true;
}


//»
//FIFO«


const read_fifo=(fobj,cb)=>{let interval;let killed=false;const sendline=_=>{if(killed)return;let line=fobj.BUFFER.shift();cb(line);if(util.isobj(line)&& line.EOF)return;if(fobj.BUFFER.length)sendline();else dowait();};const dowait=_=>{interval=setInterval(_=>{if(killed)return clearInterval(interval);if(fobj.BUFFER.length){clearInterval(interval);sendline();}},100);};if(fobj.BUFFER.length)sendline();else{cb();dowait();}return _=>{killed=true;};}
this.read_fifo = read_fifo;

//»

//API«

const populateDirObjByPath=(patharg, opts={})=>{//«
	return new Promise((Y,N)=>{
		let cb=(rv, e)=>{
			if (!rv){
				if (opts.reject) return N(e);
				NS.error.message=e;
				Y();
				return;
			}
			Y(rv);
		};
		populate_dirobj_by_path(patharg, cb, opts.root, opts.dsk);
	});
};//»
const populateFsDirObjByPath=(patharg, opts={})=>{//«
	return new Promise((Y,N)=>{
		let cb=(rv, e)=>{
			if (!rv){
				if (opts.reject) return N(e);
				NS.error.message=e;
				Y();
				return;
			}
			Y(rv);
		};
		populate_fs_dirobj_by_path(patharg, cb, opts);
//		populate_fs_dirobj_by_path(patharg, cb, opts.par, opts.long, opts.dsk);
	});
};//»
const popDir=(dirobj,opts={})=>{return new Promise((y,n)=>{populate_dirobj(dirobj,y,opts);});};
const popDirProm=(path,opts={})=>{return new Promise((res,rej)=>{path=path.regpath();if(path !="/")path=path.replace(/\/$/,"");populate_fs_dirobj_by_path(path,rv=>{if(rv)return res(rv);if(opts.reject)rej(path+":\x20could not populate the directory");else res(false);})})};
const tryPopDirsCB=async(path_arr,cb)=>{let ok_paths=[];for(let path of path_arr){try{await popDirProm(path);ok_paths.push(path);}catch(e){}}cb(ok_paths);};
const popDirsProm=(path_arr,opts={})=>{let proms=[];for(let path of path_arr)proms.push(popDirProm(path,opts));return Promise.all(proms);};
const touchDirsProm=(path_arr,opts={})=>{let proms=[];for(let path of path_arr)proms.push(touchDirProm(path,opts));return Promise.all(proms);};
const getFsEntryByPath=(path,opts={})=>{return new Promise((res,rej)=>{get_fs_ent_by_path(path,rv=>{if(!rv){if(opts.reject)rej("Could not get the file entry:\x20"+path);else res(false);return}res(rv);},opts.isDir,opts.create,opts.isRoot);});};
const saveFsFileByDirEntry=(dirEnt,name,val,opts={})=>{let optsin={MIMEARG:opts.mime,APPEND:opts.append,ROOT:opts.isRoot};return new Promise((res,rej)=>{save_fs_file(dirEnt,null,name,val,rv=>{if(!rv){if(opts.reject)rej("Could not save the file:\x20"+name);else res(false);return}res(true);},optin);});};
const writeFsFile=(fent,blob,opts={})=>{return new Promise((res,rej)=>{write_fs_file(fent,blob,rv=>{if(!rv){if(opts.reject)rej("Could not write the file");else res(false);return;}res(true);},opts.append,opts.truncate);});};
const cacheFileIfNeeded=(path,opts={})=>{return new Promise((res,rej)=>{if(!path.match(/^\//))return rej("Not a full path:\x20"+path);get_fs_ent_by_path(path,async rv=>{if(rv)return res(true);let ret,blob;try{ret=await fetch("/root"+path);if(!ret.ok){if(opts.reject)return rej("Response not OK:\x20"+"/root"+path+"("+ret.status+")");else if(opts.def)blob=new Blob([opts.def]);else return res(false);}if(!blob)blob=await ret.blob();}catch(e){rej(e);return}save_fs_by_path(path,blob,rv2=>{if(rv2)return res(true);if(opts.reject)rej(path+":could not save the file");else res(false);},{ROOT:true});},false,false,true);});};
const loadMod=(which,opts={})=>{return new Promise((Y,N)=>{getmod(which,rv=>{if(!rv){if(opts.reject)return N("Could load load:\x20"+which);else return Y(false);}Y(true);},opts);});};
const pathToNode = (path, opts = {}) => {//«
	let if_root = opts.ROOT || opts.root || opts.isRoot;
	let if_link = opts.GETLINK || opts.link;
	let use_dsk = opts.DSK||opts.dsk;
	return new Promise((res, rej) => {
		path_to_obj(path, ret => {
			if (ret) return res(ret);
			if (opts.reject) rej(path + ":\x20not found");
			else res(false);
		}, if_root, if_link, use_dsk);
	})
};//»
const touchDirProm=(path,opts={})=>{return new Promise((res,rej)=>{mkdir_by_path(path,rv=>{if(rv)return res(true);if(opts.reject)rej(path+":\x20could not create the directory");else res(false);},opts.DSK);})};
const writeHtml5File=(path,val,opts={})=>{return new Promise(async(res,_rej)=>{const rej=(str)=>{if(opts.reject)_rej(str);else res(false);};let arr=path.split("/");arr.pop();let parpath=arr.join("/");let parobj=await pathToNode(parpath);if(!parobj){rej(parpath+":\x20not found");return;}if(!check_fs_dir_perm(parobj,opts.ROOT||opts.root||opts.isRoot,opts.SYS||opts.sys||opts.isSys)){rej(parpath+":\x20permission denied");return;}save_fs_by_path(path,val,ret=>{if(ret)return res(ret);rej(path+":\x20not found");},opts);})};
const saveRemoteFile=(path,val,opts={})=>{return new Promise((Y,N)=>{save_remote_file(fullpath,val,rv=>{if(rv)return Y(rv);if(opts.reject)N("Could not save remote file:\x20"+path);else Y(false);},opts);});};
const touchHtml5File=(path)=>{return new Promise((y,n)=>{touch_fs_file(path,y);});};
const readFile = (path, opts = {}) => {//«
	return new Promise((Y, N) => {
		let buf = [];
		read_file(path, (rv, path, err) => {
			if (err) {
				if (opts.reject) N(err);
				else Y(false);
				return;
			}
			if (!rv) return;
			if (isEOF(rv)) {
				if (buf.length === 1 && !isstr(buf[0])) Y(buf[0]);
				else Y(buf);
				return;
			}
			if (isArr(rv)) buf = buf.concat(rv);
			else buf.push(rv);
		}, opts);
	});
};//»
const readFileStream=(fullpath,cb)=>{path_to_contents(fullpath,ret=>{if(ret)cb(ret);cb(true);},true,cb);}
this.readFileStream=readFileStream;
const writeFile=(path, val, opts = {}) => {//«
	return new Promise(async (Y, N) => {
		let err = (s) => {
			if (opts.reject) N(e);
			else Y(false);
		};
		let invalid = () => {
			err("Invalid path:\x20" + path);
		};
		let handle = which => {
			err("Implement handling root dir:\x20" + which);
		};
		if (!(path && path.match(/^\//))) return invalid();
		let arr = path.split("/");
		arr.shift();
		let rootdir = arr.shift();
		if (!rootdir) return invalid();
		let if_exists = await pathToNode(path);
		if (root_dirs.includes(rootdir)) {
			let fent;
			fent = await writeHtml5File(path, val, opts);
			if (opts.NOMAKEICON) {} else if (!if_exists) mk_desk_icon(path);
			Y(fent);
		} else if (rootdir === "site") {
			await saveRemoteFile(path, val, opts);
			if (opts.NOMAKEICON) {} else if (!if_exists) mk_desk_icon(path);
			Y(true);
		} else if (rootdir === "dev") {
			handle(rootdir);
		} else if (rootdir === "serv") {
			handle(rootdir);
		} else if (rootdir === "iface") {
			handle(rootdir);
		} else {
			err("Invalid or unsupported root dir:\x20" + rootdir);
		}
	});
}//»
const readHtml5File=(path,opts={})=>{return new Promise((res,rej)=>{get_fs_by_path(path,(ret,err_or_obj,isgood)=>{if(isgood)return res(ret);if(opts.reject)rej(path+":not found");else res(false);},opts);})};
const getUniquePath=(path,opts={})=>{return new Promise(async(Y,N)=>{try{let rv=await get_unique_path(path,opts,opts.ROOT);Y(rv);}catch(e){cerr(e);if(opts.reject)N(e);else Y(false);}});};
const pathExists=(path,opts={})=>{opts.isRoot=true;opts.create=false;opts.isDir=true;return new Promise(async(Y,N)=>{if(await getFsEntryByPath(path,opts))return Y(true);opts.isDir=false;if(await getFsEntryByPath(path,opts))return Y(true);Y(false);});};
const loadModules=(arr,opts_arr=[])=>{let proms=[];for(let i=0;i<arr.length;i++)proms.push(loadMod(arr[i],opts_arr[i]));return Promise.all(proms);};
const getMod=(which,opts={})=>{return new Promise((Y,N)=>{getmod(which,Y,opts);});};
const saveFsByPath=(path,val,opts)=>{return new Promise((Y,N)=>{save_fs_by_path(path,val,Y,opts);});};
const getRoot=(opts={})=>{
return root;
};
//touchDirsProm, //Should always work
//touchDirProm, //Should always work
//popDirsProm, //Will reject if a dir doesn't exist
//popDirProm, //Will reject if it doesn't exist
//tryPopDirsCB, //Not externally async, so need a CB. It ignores failures and 

const api_funcs = [//«
	"getRoot", getRoot,	
	"populateFsDirObjByPath", populateFsDirObjByPath,
	"populateDirObjByPath", populateDirObjByPath,
	"getFsFileData", getFsFileData,
	"getFsDirKids", getFsDirKids,
	"getFsEntry", getFsEntry,

	"getUniquePath", getUniquePath,
	"touchHtml5Dirs", touchDirsProm,
	"touchHtml5Dir", touchDirProm,
	"mkHtml5Dir",touchDirProm,
	"touchHtml5File",touchHtml5File,
	"popDir", popDir,
	"popHtml5Dirs", popDirsProm,
	"popHtml5Dir", popDirProm,
	"tryPopHtml5DirsCB", tryPopDirsCB,
	"writeHtml5File", writeHtml5File,
	"writeRemoteFile", saveRemoteFile,
	"readHtml5File", readHtml5File,
	"pathToNode", pathToNode,
	"pathExists", pathExists,
	"loadModules", loadModules,
	"loadMod", loadMod,
	"loadModule", loadMod,
	"getFsEntryByPath", getFsEntryByPath,
	"saveFsFileByDirEntry", saveFsFileByDirEntry,
	"writeFsFile", writeFsFile,
	"cacheFileIfNeeded", cacheFileIfNeeded,
	"readFile", readFile,
	"getMod", getMod,
	"saveFsByPath", saveFsByPath,
	"writeFile", writeFile

]//»

for (let i=0; i < api_funcs.length; i+=2){
	register_fs_api_func(api_funcs[i], api_funcs[i+1]);
}

this.api=api;

NS.api.fs=api;

//»
















/*

const update_links_or_fifos = (oldpatharg, newpatharg, is_fifo, dsk) => {//«
	let arr;
	let val = null;
	let num;
	if (is_fifo) {
		arr = (dsk&&dsk.fs_fifos)||globals.fs_fifos;
		num = 1;
	} else {
		arr = (dsk&&dsk.fs_links)||globals.fs_links;
		num = 2;
	}
	let oldpatharr = oldpatharg.split("/");
	let oldname = oldpatharr.pop();
	let oldpath = oldpatharr.join("/");
	let oldarr = arr[oldpath];
	if (!oldarr) return cerr("update_links_or_fifos():nothing found for oldpath in globals " + oldpath);
	let pos = oldarr.indexOf(oldname);
	if (pos == -1) return cerr("Name not found:\x20" + oldname, oldarr);
	if (!is_fifo) val = oldarr[pos + 1];
	oldarr.splice(pos, num);
	let newpatharr = newpatharg.split("/");
	let newname = newpatharr.pop();
	let newpath = newpatharr.join("/");
	let newarr = arr[newpath];
	if (!newarr) {
		newarr = [];
		arr[newpath] = newarr;
	}
	newarr.push(newname);
	if (val) newarr.push(val);
}//»
const move_fifo_or_link = (srcpath, destpath, app, dsk) => {//«
	let pref = "LN";
	if (app == "FIFO") pref = "FI";
	pref = (dsk?dsk.fspref:FSPREF) + pref;
	let srckey = pref + "_" + srcpath;
	let destkey = pref + "_" + destpath;
	let val = localStorage[srckey];
	if (!val) cerr('not found:localStorage["' + srckey + '"]... continuing anyway');
	delete localStorage[srckey];
	localStorage[destkey] = val;
	update_links_or_fifos(srcpath, destpath, app === "FIFO", dsk);
}//»
const move_fifos_and_links_of_dir = (srcpath, destpath, fsprefarg) => {//«
	srcpath = srcpath.regpath();
	destpath = destpath.regpath();
	let srclen = srcpath.length;
	const doit = (which, sym, iter) => {
		sym = (fsprefarg||FSPREF) + sym;
		let paths = Object.keys(which);
		for (let oldpath of paths) {
			if ((oldpath === srcpath) || (oldpath.length > srclen && oldpath.slice(0, srclen) === srcpath && oldpath[srclen] === "/")) {
				let newpath;
				if (oldpath === srcpath) newpath = destpath;
				else newpath = destpath + oldpath.slice(srclen);
				let arr = which[oldpath];
				for (let i = 0; i < arr.length; i += iter) {
					let name = arr[i];
					let oldkey = sym + "_" + oldpath + "/" + name;
					let newkey = sym + "_" + newpath + "/" + name;
					let val = localStorage[oldkey];
					if (!val) cerr("Key not found:" + oldkey + "!!!!!");
					else {
						delete localStorage[oldkey];
						localStorage[newkey] = val;
						delete which[oldpath];
						which[newpath] = arr;
					}
				}
			}
		}
	};
	doit(globals.fs_links, "LN", 2);
	doit(globals.fs_fifos, "FI", 1);
}
this.move_fifos_and_links_of_dir=move_fifos_and_links_of_dir;
//»


this.unzip = (ents, base_path, opts = {}) => {//«
	let zip = globals.zip;
	let logger = opts.logger;
	if (!logger) logger = () => {};
	let cb = opts.cb;
	let is_root = opts.isRoot;
	logger("Extracting into:\x20" + base_path);
	let iter = -1;
	const doent = async () => {
		iter++;
		if (iter == ents.length) {
			logger("Done");
			cb && cb();
			return;
		}
		let ent = ents[iter];
		let parr = ent.filename.replace(/\/$/, "").split("/");
		if (!parr[0]) parr.shift();
		let fname = parr.pop();
		let path = parr.join("/");
		let fullpath;
		if (path) fullpath = base_path + "/" + path;
		else fullpath = base_path;
		let savepath = fullpath + "/" + fname;
		if (ent.directory) {
			if (await api.pathToNode(savepath)) return logger("Folder path exists:\x20" + savepath, true);
			fsobj.mk_fs_dir(fullpath, fname, null, (ret, err) => {
				if (!ret) return logger(err, true);
				logger(ent.filename);
				doent();
			}, null, is_root);
		} else {
			if (await api.pathToNode(savepath)) return logger("File path exists:\x20" + savepath, true);
			ent.getData(new zip.BlobWriter(), blob => {
				fsobj.savefile(savepath, blob, ret => {
					if (!ret) return logger("Could not save:\x20" + ent.filename, true);
					logger(ent.filename);
					if (Desk) Desk.make_icon_if_new(savepath);
					doent();
				}, {
					MKDIR: true,
					ROOT: is_root
				});
			})
		}
	};
	doent();
};
//»

*/

//Old stuff in populate_fs_dirobj_by_path:
//		get_fs_ent_by_path(patharg, dirret => {//«
//			if (dirret) {
//				let reader = dirret.createReader();
//				let ents = [];
//				let rootobj = parobj.root;
//				let kids = parobj.KIDS;
/*«
				let links = dsk?dsk.fs_links[patharg]:globals.fs_links[patharg];
				if (links) {
					for (let i = 0; i < links.length; i += 2) {
						kids[links[i]] = {
							NAME: links[i],
							APP: "Link",
							LINK: links[i + 1],
							par: parobj,
							root: rootobj
						};
					}
				}
				let fifos = dsk?dsk.fs_fifos[patharg]:globals.fs_fifos[patharg];
				if (fifos) {
					for (let i = 0; i < fifos.length; i++) kids[fifos[i]] = {
						NAME: fifos[i],
						APP: "FIFO",
						BUFFER: [],
						par: parobj,
						root: rootobj
					};
				}
»*/
//				if (patharg == "/") return cb(kids);
/*
				const readents = () => {//«
					reader.readEntries(ret => {//«
						if (!ret.length) {//«
							let iter = -1;
							let now = Date.now();
							let use_year_before_time = now - (1000 * 86400 * MAX_DAYS);
							const doent = () => {
								iter++;
								if (iter == ents.length) {
									parobj.longdone = true;
									parobj.done = true;
									return cb(kids);
								}
								let ent = ents[iter];


								let name = ent.name;
								if (ent.isDirectory) {
									kids[name] = mkdirkid(parobj, name, true, 0, 0, patharg);
									doent();
								} else {
									ent.file(async file => {
										let tm = file.lastModified;
										let timearr = file.lastModifiedDate.toString().split(" ");
										timearr.shift();
										timearr.pop();
										timearr.pop();
										let timestr = timearr[0] + " " + timearr[1].replace(/^0/, " ") + " ";
										if (file.lastModified < use_year_before_time) timestr += " " + timearr[2];
										else {
											let arr = timearr[3].split(":");
											arr.pop();
											timestr += arr.join(":");
										}
										kids[name] = mkdirkid(parobj, name, false, file.size, timestr, patharg, null, file, ent);
										if (name.match(/\.lnk$/)){
											get_fs_file_from_fent(ent, async(rv)=>{
											if (isstr(rv)){
												kids[name].LINK = rv;
											}
											doent();
											});
										}
										else doent();
									});
								}
							};
							doent();
//							} 

//							else {
//								for (let i = 0; i < ents.length; i++) {
//									let ent = ents[i];
//									let name = ent.name;
//									if (ent.isDirectory && parobj.treeroot) continue;
//									kids[name] = mkdirkid(parobj, name, ent.isDirectory, 0, 0, patharg, null, ent);
//								}
//								parobj.done = true;
//								cb(kids);
//							}

						}//» 
						else {//«
							ents = ents.concat(toArray(ret));
							readents();
						}//»
					}, cb);//»
				};//»
				readents();
*/
//			} else cb();
//		}, true, null, true, dsk);
//»

