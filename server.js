//Var«

let server;
let port = 8080;
let use_secure = false;
let if_debug = false;

const https = require('https');
const http = require('http');
const spawn = require('child_process').spawn;
const fs = require('fs');
const URL = require('url').URL;
const qs = require('querystring');

let log = function(arg){console.log(arg)}
let debug = function(arg){if (!if_debug) return;console.log(arg);}
let i, arg, marr;

//const index_str = fs.readFileSync('./index.html', 'utf8')

for (i=0; i < process.argv.length; i++) {//«
	arg = process.argv[i];
	if (marr=arg.match(/^--?s(?:ec)?=(.+)$/)) {
		if (marr[1] == "on" || marr[1] == "1") use_secure = true;
		else if (marr[1] == "off" || marr[1] == "0") use_secure = false;
		else {
			err("Unrecognized SSL argument: " + marr[1]);
		}
	}
	else if (marr=arg.match(/^--?p(?:ort)?=(.+)$/)) {
		port = parseInt(marr[1]);
		if (isNaN(port)) {
			err("Invalid port argument: " + marr[1]);
		}
	}
	else if (arg.match(/^--?d(?:ebug)?$/)) {
log("Debugging mode on!");
		if_debug = true;
	}
}
//»
let secopt = {//«
	key: "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQC+adcmhMTEemJ28C/9jCchmZ2p/vjfZXbyOYz3A56FKTQTKeS6\nXjaBc9MAayIkbZvEXSoU0/ULpJTtBrSSn+Vs26hZ2mk3wtutNtAGbfJcKWol/Yjl\nmxLtfsvCnyk8Pr2E7qr7qx+xE1cfgvpNuFvOyKtFnzkOs8Xmw4H+UddSjQIDAQAB\nAoGAYO5cOh2IVUS/7zAiHf5ExVP/8NP9OSvbuz8UxYIwJjVtbvv6lezz7j5aAXKI\nNOcfTnzmuSeVLNIhhe/N6H5BOaHA1gyMbDtpVHmVYl/NXXCfKamGBtZXJNeZj8am\n2TFUEfLqkcuXqN16mIoxUnCAT0eT6BkNdHfbShBLoCb1NDkCQQDuM1jKncfyqkO2\nuU4QZRldigcrwZQC3xiyjcRjKuSpNmIvbYzSSWNKdUUS3Cz+zs9BJY4UITsErltM\n3HinxN2HAkEAzKRZvYBiih91DKqiCsXtWHKSnwOFfp6XAYH/4+H7gH45i3iir/Es\nLosot0goajeoAedqzU13t0Ih/PLlsz00SwJACIQPbZb8egF6UEMJtm5W3NA9d2QB\nTaT6Ng/5cG4tJJuMIRPyj+YNxbCxmn4Coc10/WhBTxjtCjrNis7rBVx1awJBAKc3\nGDkXYe15HNy3xObGqlUecZ5Lc1ZuYfeScTSVIDvzaDQF4/GeQLrbbO6uoI+CYN8F\naKjPRyZQfJNDKtxWA5cCQFzbB42YRXZYaILFnOsc1o+EZpmpX/buSvwtBlo9655j\nX13a6j8Zio5sBKR5Gg9YVs4eCoChbEiPUDlxf/mJLEQ=\n-----END RSA PRIVATE KEY-----",
	cert: "-----BEGIN CERTIFICATE-----\nMIICSzCCAbQCCQDXDyP9WWb/fjANBgkqhkiG9w0BAQUFADBqMQswCQYDVQQGEwJV\nUzEQMA4GA1UECAwHRmxvcmlkYTEOMAwGA1UEBwwFVGFtcGExEjAQBgNVBAoMCUxv\nY2FsIERldjEOMAwGA1UECwwFRGV2ZWwxFTATBgNVBAMMDHd3dy5kZXNrLm5ldDAe\nFw0xNDEyMjMyMjU3MDVaFw0xNTEyMjMyMjU3MDVaMGoxCzAJBgNVBAYTAlVTMRAw\nDgYDVQQIDAdGbG9yaWRhMQ4wDAYDVQQHDAVUYW1wYTESMBAGA1UECgwJTG9jYWwg\nRGV2MQ4wDAYDVQQLDAVEZXZlbDEVMBMGA1UEAwwMd3d3LmRlc2submV0MIGfMA0G\nCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+adcmhMTEemJ28C/9jCchmZ2p/vjfZXby\nOYz3A56FKTQTKeS6XjaBc9MAayIkbZvEXSoU0/ULpJTtBrSSn+Vs26hZ2mk3wtut\nNtAGbfJcKWol/YjlmxLtfsvCnyk8Pr2E7qr7qx+xE1cfgvpNuFvOyKtFnzkOs8Xm\nw4H+UddSjQIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAF+AXjPYUrV++nU+/h7PEcaM\n7XdbfzYe/m7XczyrIJWMe8qJyw++a0luGyIXi/WvJaRbtja2AT/73ERdJggqiAw+\nnmNEasooX1eUB7yJ/ppJ9+cagWFriuJqIQ/KZA/mGOGtUWusxVzY6ilzcQpdgljO\n7TbZkFJQWVy1TOlEQjB6\n-----END CERTIFICATE-----",
	requestCert: false,
	rejectUnauthorized: false
};//»

//»

function err(str) {throw "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n"+str+"\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";}
function mime_from_path(path, force_bin) {//«
	if (path.match(/\.jpg$/i)) return "image/jpeg"
	else if (path.match(/\.gif$/i)) return "image/gif"
	else if (path.match(/\.png$/i)) return "image/png"
	else if (path.match(/\.webp$/i)) return "image/webp"
	else if (force_bin) return "application/octet-stream";
	else return "text/plain"
}//»
function okay(res, usemime) {//«
	header(res, 200, usemime);
}//»
function okaybin(res) {//«
	header(res, 200, "application/octet-stream");
}//»
function nogo(res, mess) {//«
	header(res, 404);
	if (!mess) mess = "NO";
	res.end(mess+"\n");
}//»
function header(res, code, mimearg) {//«
	var usemime = "text/plain";
	if (mimearg) usemime = mimearg;
	if (code == 200) {
		res.writeHead(200, {'Content-Type': usemime, 'Access-Control-Allow-Origin': "*"});
	}
	else res.writeHead(code, {'Content-Type': usemime, 'Access-Control-Allow-Origin': "*"});
}//»
let OKAY_DIRS=["root","www"];
function handle_request(req, res, url, args) {//«
	"use strict";
	let meth = req.method;
	let body, path, enc, pos;
	let marr;
	if (meth == "GET") {//«
		if (url=="/") {okay(res, "text/html");return res.end(`The server is live!<br>You might want to go to <a href="/desk.os">the desktop</a> or <a href="/shell.os">the shell</a>!`);}
		if (url.match(/^\/(desk|shell).os$/)) return res.end(fs.readFileSync('./os.html', 'utf8'));
		let parts = url.split("/");
		parts.shift();
		let dir = parts.shift();
		if (!(dir&&OKAY_DIRS.includes(dir))) return nogo(res,"Not found");
		let usemime = "application/octet-stream";
		let str;
		let ext_to_mime = {
			"js": "application/javascript",
			"json": "application/javascript",
			"html": "text/html",
			"txt": "text/plain",
			"sh": "text/plain",
			"gz": "application/gzip",
			"wav": "audio/wav"
		}
		if (marr = url.match(/\.(js|html|json|txt|sh|mf)$/)) {
			usemime = ext_to_mime[marr[1]];
			try {
				str = fs.readFileSync("."+decodeURIComponent(url), 'utf8');
			}
			catch(e) {
				str=null
			}
		}
		else {
			if (marr = url.match(/\.(wav|gz)$/)) usemime = ext_to_mime[marr[1]];
			try {
				str = fs.readFileSync("."+decodeURIComponent(url));
			}
			catch(e) {
				str = null
			}
		}
		if (!str) {
			nogo(res, "404: File not found: " + url);
debug("Not found");
			return;
		}
debug("OK: " + (str.length) + " bytes");
		okay(res, usemime);
		res.end(str);
	}//»
	else if (meth == "POST") nogo(res);
	else nogo(res);
}//»

if (use_secure) {//«
	server = https.createServer(secopt, function(req, res) {
		var url_arr = req.url.split("?");
		var len = url_arr.length;
		if (len == 1 || len == 2) {
			var base = url_arr[0];
			var args = url_arr[1];
			if (args) {
				var args_arr = args.split("&");
				var arg_hash = {};
				for (var i=0; i < args_arr.length; i++) {
					var argi = args_arr[i].split("=");
					var key = argi[0];
					var val = argi[1];
					if (!val) val = false;
					arg_hash[key] = val;
				}
			}
			handle_request(req, res, base, arg_hash);
		}
		else {
			nogo(res);
		}
	}).listen(port, 'localhost');
}//»
else {//«
	server = http.createServer(function(req, res) {
		var url_arr = req.url.split("?");
		var len = url_arr.length;
		if (len == 1 || len == 2) {
			var base = url_arr[0];
			var args = url_arr[1];
			if (args) {
				var args_arr = args.split("&");
				var arg_hash = {};
				for (var i=0; i < args_arr.length; i++) {
					var argi = args_arr[i].split("=");
					var key = argi[0];
					var val = argi[1];
					if (!val) val = false;
					arg_hash[key] = val;
				}
			}
			handle_request(req, res, base, arg_hash);
		}
		else {
			nogo(res);
		}
	}).listen(port, 'localhost');
}//»
//«
log("Local node.js server up on: " + port + " (http" + (use_secure?"s)":")"));
log("");
if (use_secure) {
//log("\n!!!!!!!!!!!!!!!!!!!!  IMPORTANT  !!!!!!!!!!!!!!!!!!!\n");
//log("To enable usage of a secure localhost server, please:\n1) In the browser, goto the url: https://127.0.0.1:"+port+"\n2) Click on 'Advanced'\n3) Click on 'Proceed to ... (unsafe)'\n\n*Note: You will only need to perform the above procedure once.");
//log("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
}
//»


