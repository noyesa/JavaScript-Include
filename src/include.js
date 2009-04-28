/*
    Copyright 2009 Andrew Noyes

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview JavaScript Module Loader. This will
 * download a JavaScript file via HTTP and process it.
 * If your script requires another script, simply use
 *     include("path/to/file.js");
 * before calling any functions within the file, and
 * the file will be downloaded and evaluated for use.
 * Note that when evaluated, scripts are eval'd in an
 * anonymous scope. Therefore, somewhere in your script,
 * you must use some kind of namespace mechanism to
 * create a namespace in the global namespace, or simply
 * assign any of your functions to the global namespace
 * using window.yourFunction = function etc...
 * 
 * For more details on usage, go to
 * http://www-personal.umd.umich.edu/~aknoyes/articles/2009/04/include.php
 * @author Andrew Noyes noyesa@gmail.com
 */

(function () {
	
	/**
	 * Array of loaded JavaScript files
	 */
	var loaded = [];
	
	/**
	 * Returns file name string without
	 * directories or domain names. Throws
	 * an exception if file isn't on the
	 * same domain as page.
	 * @params file {String} location of script
	 * @returns File name string without directories or domain
	 * @type String
	 */
	function getBaseName(file) {
		var protocol, nameSplit, fileName;
		
		protocol = file.substr(0, file.indexOf(":"));
		if (!!protocol.length) {
			throw new Error("Scripts must be on same domain as document.");
		}
		
		nameSplit = file.split("/");
		fileName = nameSplit[nameSplit.length - 1];
		
		return fileName;
	}	
	
	/**
	 * Cross-browser HTTP object instantiator.
	 * @returns XMLHttpRequest Object
	 * @type XMLHttpRequest
	 */
	function getHttpObject() {
		var xhr = false;
		if (window.XMLHttpRequest) {	// Standard HTTP request
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {	// IE HTTP request
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
					xhr = false;
				}
			}
		}
		return xhr;
	}
	
	/**
	 * Creates a namespace and returns a reference to the
	 * last namespace created. Seen in YUI source.
	 * @param namespace {String} Namespace to be created
	 * @type Object
	 */
	window.namespace = window.namespace || function () {
		var i, il, objects, start, root, j, jl;
		
		for (i = 0, il = arguments.length; i < il; i++) {
			objects = arguments[i].split(".");
			start = (objects[0] === "window") ? 1 : 0;
			root = window;
			
			for (j = start, jl = objects.length; j < jl; j++) {
				root[objects[j]] = root[objects[j]] || {};
				root = root[objects[j]];
			}
		}
		
		return root;	// Reference to last object created
	};
	
	/**
	 * Downloads and evaluates script files if
	 * they are located on the same domain as
	 * document.
	 * @params file {String} URL location of script
	 * @returns Boolean if download and eval is successful
	 * @type Bool
	 */
	window.include = window.include || function (file) {
		// Variable declarations
		var i, il, name, request, wrapper;
		
		// Get file name and check on same domain
		name = getBaseName(file);
		
		// If file has been loaded, don't load it again
		for (i = 0, il = loaded.length; i < il; i++) {
			if (name === loaded[i]) {
				return true;
			}
		}
		
		// Download script
		request = getHttpObject();
		if (request) {
			request.open("GET", file, false);
			request.send(null);
		} else {
			throw new Error("Couldn't create HTTP object.");
		}
		
		// Eval script in anonymous scope to protect global namespace
		wrapper = "(function () {" + request.responseText + "})();";
		try {	// Check for exceptions in script
			eval(wrapper);
		} catch (e) {
			throw new Error("Exceptions thrown in " + name + ": " + e.message);
		}
		loaded.push(name);	// Record that file has been loaded
		
		return true;
	};
	
})();