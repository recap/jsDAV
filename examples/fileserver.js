/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax.org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
"use strict";
const config = require('./config.json')

var jsDAV = require("./../lib/jsdav");
//jsDAV.debugMode = true;
jsDAV.superUsers = config.Users;
jsDAV.enforceTokenAuth = config.enforceTokenAuth;

Object.keys(jsDAV.superUsers).forEach((k) => {
	const v = jsDAV.superUsers[k];
	v.decodedPublicKey = Buffer.from(v.publicKey, 'base64').toString()
	console.log(v)
})

var jsDAV_Locks_Backend_FS = require("./../lib/DAV/plugins/locks/fs");

jsDAV.createServer({
    node: __dirname + "/../test/assets",
    locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/../test/assets")
}, 8000);
