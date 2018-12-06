/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax.org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
"use strict";

var jsDAV = require("./../lib/jsdav"),
    jsDAV_Auth_Backend_Token = require("./../lib/DAV/plugins/auth/token"),
    jsDAV_Locks_Backend_FS = require("./../lib/DAV/plugins/locks/fs");

//jsDAV.debugMode = true;

jsDAV.createServer({
    node: __dirname + "/assets",
    locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/assets"),
    authBackend: jsDAV_Auth_Backend_Token.new(__dirname + "/assets/users"),
    realm: "jsdavtest"
}, 8000);
