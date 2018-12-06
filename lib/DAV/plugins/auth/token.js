/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
"use strict";

var jwt = require('jsonwebtoken');
var fs = require('fs');

var jsDAV_Auth_iBackend = require("./iBackend");

var Exc = require("./../../../shared/exceptions");

var users = null;
/**
 * HTTP Basic authentication backend class
 *
 * This class can be used by authentication objects wishing to use HTTP Basic
 * Most of the digest logic is handled, implementors just need to worry about
 * the validateUserPass method.
 */
var jsDAV_Auth_Backend_AbstractBasic = module.exports = jsDAV_Auth_iBackend.extend({
	initialize: function(filename) {
		users = JSON.parse(fs.readFileSync(filename, 'utf-8'));
		Object.keys(users).forEach(function(key) {
			var user = users[key];
			user.decodedPublicKey = Buffer.from(user.publicKey, 'base64').toString()
		});
	},
	/**
     * This variable holds the currently logged in username.
     *
     * @var string|null
     */
    currentUser: null,

    /**
     * Validates a username and password
     *
     * This method should return true or false depending on if login
     * succeeded.
     *
     * @return bool
     */
    validateUserPass: function(username, password, cbvalidpass) {},

    /**
     * Returns information about the currently logged in username.
     *
     * If nobody is currently logged in, this method should return null.
     *
     * @return string|null
     */
    getCurrentUser: function(callback) {
        return callback(null, this.currentUser);
    },

    /**
     * Returns an HTTP 401 header, forcing login
     *
     * This should be called when username and password are incorrect, or not supplied at all
     *
     * @return void
     */
    requireAuth: function(realm, err, callback) {
        if (!(err instanceof Exc.jsDAV_Exception))
            err = new Exc.NotAuthenticated(err);
        err.addHeader("WWW-Authenticate", "Basic realm=\"" + realm + "\"");
        callback(err, false);
    },

    /**
     * Authenticates the user based on the current request.
     *
     * If authentication is succesful, true must be returned.
     * If authentication fails, an exception must be thrown.
     *
     * @throws Exc.NotAuthenticated
     * @return bool
     */
    authenticate: function(handler, realm, cbauth) {
        var req = handler.httpRequest;
        var res = handler.httpResponse;

        var auth = req.headers["authorization"];
		var token = auth.replace('Bearer ','');
		if (!token) {
			this.requireAuth(realm, "No valid token", cbauth);
			return;
		}

		console.log(token)

		var preDecoded = jwt.decode(token);
		if (!preDecoded) {
			this.requireAuth(realm, "No valid token", cbauth);
			return;
		}

		console.log(preDecoded)

		var user = preDecoded.email || preDecoded.user;
		if (!users[user]) {
			this.requireAuth(realm, "No valid token", cbauth);
			return;
		}

		var cert = users[user].decodedPublicKey
		if (!cert) {
			this.requireAuth(realm, "No valid token", cbauth);
			return;
		}

		jwt.verify(token, cert, function(err, decoded) {
			if (err) {
				this.requireAuth(realm, "No valid token", cbauth);
				return;
			}
			cbauth(null, true);
		});
    }
});
