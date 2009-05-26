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
 * @fileOverview This is a simple module loader for JavaScript. It
 * allows JavaScript files to be loaded and rendered in the browser
 * on-demand. For more details on usage, go to
 * http://www-personal.umd.umich.edu/~aknoyes/articles/2009/04/include.php
 *
 * @author Andrew Noyes noyesa@gmail.com
 * @version 0.1
 */

(function () {
	
	/**
	 * Array of loaded JavaScript files
	 * @type Array
	 */
	var loaded = [];
	
	/**
	 * Returns file name string without directories or domain names.
	 * Throws an exception if file isn't on the same domain as page.
	 * @param {String} file Complete file path
	 * @type String
	 */
	var getBaseName = function (file) {
		var protocol = file.substr(0, file.indexOf(":")),
			nameSplit,
			fileName;
		
		protocol = file.substr(0, file.indexOf(":"));
		if (!!protocol.length) {
			throw new Error("Scripts must be on same domain as document.");
		}
		
		nameSplit = file.split("/");
		fileName = nameSplit[nameSplit.length - 1];
		
		return fileName;
	};	
	
	/**
	 * Cross-browser HTTP object instantiator.
	 * @type XMLHttpRequest
	 */
	var getHttpObject = function () {
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
	};
	
	/**
	 * Creates a namespace and returns a reference to the
	 * last namespace created. Seen in YUI source.
	 * @param {String} Namespace to be created
	 * @type Object
	 */
	window.namespace = function () {
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
	 * Determines whether a module has already been downloaded and parsed.
	 * 
	 * @param {String} file File that will be checked for
	 * @return Indicates whether file has been loaded
	 * @type Bool
	 */
	var isLoaded = function (file) {
	    for (var i = 0, il = loaded.length; i < il; i++) {
	        if (file === loaded[i]) {
	            return true;
	        }
	    }
	    return false;
	};
	
	/**
	 * Wraps response in an anonymous function with anonymous scope and parses
	 * the contents.
	 * 
	 * @param {String} response
	 */
	var parseResponse = function (response) {
	    var wrapper = '(function () {' + response + ' })();';
	    
	    eval(wrapper);
	    loaded.push(name);	// Record that file has been loaded
	};
	
	/**
	 * Download the script and returns the source code.
	 * 
	 * @param {String} url Location fo the script
	 * @return Script source code
	 * @type String
	 */
	var downloadScript = function (url) {
	    var request = getHttpObject();
	    if (request) {
	        request.open('GET', url, false);
	        request.send(null);
	    } else {
	        throw new Error("Couldn't create HTTP object.");
	    }
	    
	    return request.responseText;
	};
	
	/**
	 * Downloads and evaluates script files if they are located on the same
	 * domain as document.
	 * 
	 * @param {String} file Path to script
	 * @type Bool
	 */
	window.include = function (file) {
		var sourceCode,
			fileName = getBaseName(file);
		
		// If file has been loaded, don't load it again
		if (isLoaded(fileName)) {
		    return true;
		}
		
		// Download script
		sourceCode = downloadScript(file);
		
		try {	// Check for errors in script
			parseResponse(sourceCode);
		} catch (e) {
			throw new Error("Exceptions in " + fileName + ": " + e.message);
		}
		
		return true;
	};
	
})();