//Imports«
const{NS,xgetobj,globals,}=Core;
const{fs,util,widgets,dev_env,dev_mode}=globals;
const{strnum,isarr,isobj,isstr,mkdv}=util;
const{fmt,read_stdin, woutobj,get_path_of_object,pathToNode,read_file_args_or_stdin,serr,normpath,cur_dir,respbr,set_var_str,get_var_str,refresh,failopts,cbok,cberr,wout,werr,termobj,wrap_line,kill_register,EOF,ENV}=shell_exports;
const fsapi=NS.api.fs;
const capi = Core.api;
const fileorin = read_file_args_or_stdin;
const stdin = read_stdin;
const NUM = Number.isFinite;
//»

//const locport = globals.local_port;
//const LOCURL = `http://${window.location.hostname}:${locport}`
//const wrap = fmt;

const log = (...args)=>console.log(...args);
const cwarn = (...args)=>console.warn(...args);
const cerr = (...args)=>console.error(...args);

const coms={

encrypt:async(args)=>{//«
	let sws = failopts(args,{SHORT:{p:3}});
	if (!sws) return cberr("Failopts");
	let pass_str = sws.p||"password";
	const encrypt=async s=>{//«
		let pass = new TextEncoder().encode(pass_str)
		let mess = new TextEncoder().encode(s)
		let key=await window.crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
		let exp=await crypto.subtle.exportKey("raw", key);
		let rv = await window.crypto.subtle.encrypt({
			name: "AES-GCM",
			iv: pass
		}, key, mess);
		let arr = new Uint8Array(exp);
		let b = '';
		for (let i=0; i < arr.length; i++) b+=String.fromCharCode(arr[i]);
		let s2 = btoa(b);
		werr("The generated key has been set to ENCRYPT_KEY");
		set_var_str("ENCRYPT_KEY", s2);
		woutobj(new Blob([rv],{type:"blob"}));
		cbok();
	};//»
	let arr = [];
	fileorin(args,(rv,fname,err)=>{//«
		if (!rv){
			if (err) werr(err);
			return;
		}   
		if (isobj(rv)&&rv.EOF==true) return encrypt(arr.join("\n"));
		if (isarr(rv) && rv.length && isstr(rv[0])) arr=arr.concat(rv);
		else if (isstr(rv)) arr.push(rv);
		else{
			werr("Dropping non string/array-of-strings input");
		}   
	}, {SENDEOF:true}); //»
},//»
decrypt:async(args)=>{//«

	let sws = failopts(args,{SHORT:{p:3}});
	if (!sws) return cberr("Failopts");
	let pass_str = sws.p||"password";
	const decrypt=async buf=>{//«
		let enckey = get_var_str("ENCRYPT_KEY");
		if (!enckey) return cberr("'ENCRYPT_KEY' is not in the environment!");
		let pass = new TextEncoder().encode(pass_str)
		let s3 = atob(enckey);
		let arr2 = new Uint8Array(s3.length);
		for (let i=0; i < s3.length; i++) arr2[i]=s3[i].charCodeAt();

		let key2 = await window.crypto.subtle.importKey(
			"raw",
			arr2.buffer,
			"AES-GCM",
			true,
			["encrypt", "decrypt"]
		);

		let rv2 = await window.crypto.subtle.decrypt({
			name: "AES-GCM",
			iv: pass
		}, key2, buf);

		let val = new TextDecoder().decode(new Uint8Array(rv2));
		cbok(val);

	};//»

	if (args.length > 1) return cberr("Only want 0 or 1 args!");

	fileorin(args,async(rv,fname,err)=>{//«
		if (!rv){
			if (err) werr(err);
			return;
		}   
//cwarn(rv);
		if (typeof(rv) === "object"){
			if (rv.EOF===true) return;
			decrypt(await capi.toBuf(rv));
		}
		else{
//log(rv);
//log(isobj(rv));
			werr(`decrypt received an unknown object (expected Uint8Array or Blob)`);
		}
//if (typeof(rv)=)
//if (rv instanceof Uint8Array) return decrypt(rv.buffer);
//if (rv instanceof Blob) return 
//log(rv);
//cwarn(rv);
/*
		if (isarr(rv) && rv.length && isstr(rv[0])) decrypt(rv.join("\n"));
		else if (isstr(rv)) {
			decrypt(rv);
		}
		else{
			werr("Dropping non string/array-of-strings input");
		}   
*/
	}, {SENDEOF:true, BINARY: true}); //»


},//»

}

const coms_help={
}
if (!com) return Object.keys(coms)
if (!args) return coms_help[com];
if (!coms[com]) return cberr("No com: " + com + " in crypto!");
if (args===true) return coms[com];
coms[com](args);

