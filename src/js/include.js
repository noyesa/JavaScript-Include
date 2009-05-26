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
 * @version 0.2
 */

(function () {
    /**
     * Cross-platform compatible HTTP request class
     * 
     * @constructor
     * @author Andrew Noyes noyesa@gmail.com
     * @param {String} url Path to resource
     * @param {Function} callBack Optional callback function
     * @param {Bool} async Syncronous or Asyncronous request
     */
    var HttpRequest = function (url, callBack, async) {
        this.url = url;
        this.callBack = callBack || null;
        this.async = async || false;
        this.start();
    };
    
    HttpRequest.prototype = {
        /**
         * Cross-platform HTTP request instantiator
         * 
         * @return HTTP request object
         * @type XMLHttpRequest
         */
        getRequestObject: function () {
            var xhr = false;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e) {
                        xhr = false;
                    }
                }
            }
            return xhr;
        },
        
        /**
         * Initializes resource download
         */
        start: function () {
            var request = this.getRequestObject();
            if (request) {
                request.open('GET', this.url, this.async);
                request.send(null);
                if (this.async) {
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {
                            if (request.status === 200 || request.status === 304) {
                                this.parseResponse(request.responseText);
                            }
                        }
                    }.apply(this);
                } else {
                    this.parseResponse(request.responseText);
                }
            } else {
                throw new Error("Couldn't create HTTP object.");
            }
        },
        
        /**
         * Passes responseText to callack function and assigns responseText
         * data member
         */
        parseResponse: function (responseText) {
            if (this.callBack) {    
                this.callBack(responseText);
            }
            this.responseText = responseText;
        }
    };
    
    /**
     * Constructor for source file class
     * 
     * @author Andrew Noyes noyesa@gmail.com
     * @param {String} Name File name of source file
     * @param {String} source Source code
     * @constructor
     */
    var SourceFile = function (path) {
        this.path = path;
        this.name = this.fileName();
    };
    
    SourceFile.prototype = {
        /**
         * Parses the source file
         */
        parse: function () {
            var wrapper = '(function () { ' + this.source + '})();';
            eval(wrapper);
        },
        
        /**
         * Downloads the source file
         */
        download: function () {
            var request = new HttpRequest(this.path, null, false);
            this.source = request.responseText;
        },
        
        /**
         * Returns file name string without directories or domain names.
         * Throws an exception if file isn't on the same domain as page.
         * 
         * @return File name without directories or domain
         * @type String
         */
        fileName: function () {
            var nameSplit, fileName;

            nameSplit = this.path.split("/");
            fileName = nameSplit[nameSplit.length - 1];

            return fileName;
        },
        
        /**
         * Returns the file name of the source file.
         * 
         * @return Name of source file
         * @type String
         */
        valueOf: function () {
            return this.fileName();
        },
        
        /**
         * Alias for valueOf method
         * 
         * @return Name of source file
         * @type String
         */
        toString: function () {
            return this.valueOf();
        }
    };
    
    /**
     * Singleton object to keep track of files that have been loaded.
     * 
     * @type Object
     */
    var loaded = function () {
        var files = [];
        
        return {
            /**
             * Adds a file to the collection
             * 
             * @param {String} name
             */
            addFile: function (file) {
               files.push(file);
            },
            
            /**
             * Checks to see if the collection already contains a file.
             * 
             * @param {String} name
             * @return Indicates whether file is already in collection
             * @type Bool
             */
            hasFile: function (file) {
               for (var i = 0, il = files.length; i < il; i++) {
                   if (files[i].name === file.name) {
                       return true;
                   }
               }
               return false;
            },
            
            /**
             * Returns a reference to the named file
             * 
             * @param {String} name Name of file to be loaded
             * @return Reference to file
             * @type Object
             */
            getFile: function (file) {
                for (var i = 0, il = files.length; i < il; i++) {
                    if (files[i].name === file.name) {
                        return files[i];
                    }
                }
            }
        };
    }();
    
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
        
        return root;    // Reference to last object created
    };
    
    /**
     * Downloads and evaluates script files if they are located on the same
     * domain as document.
     * 
     * @param {String} file Path to script
     * @type Bool
     */
    window.include = function (path) {
        var file = new SourceFile(path);
        
        // If file has been loaded, don't load it again
        if (loaded.hasFile(file)) {
            return true;
        }
        
        // Download script
        file.download();
        
        try {   // Check for errors in script
            file.parse();
        } catch (e) {
            throw new Error("Exceptions in " + file + ": " + e.message);
        }
        
        loaded.addFile(file);   // Record that file has been loaded
        
        return true;
    };
    
    /**
     * Parses a file even if it has been already loaded. Avoids making
     * unecessary HTTP request.
     * 
     * @param {String} path Path to source file
     * @type Bool
     */
    window.reload = function (path) {
        var file = new SourceFile(path);
        
        if (loaded.hasFile(file)) {
            loaded.getFile(file).parse();
            return true;
        }
        return include(path);
    };
    
})();