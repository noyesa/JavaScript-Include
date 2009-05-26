/**
 * @fileOverview This is an example of how a module
 * is generally laid out. You can use a number of
 * different module patterns, but this is the one
 * that I find myself using most of the time, and
 * it's essentially what I wrote JavaScript Include
 * for.
 * 
 * Copyright 2009 Andrew Noyes
 * This program is distributed under the terms 
 * of the GNU General Public License
 *
 * @author Andrew Noyes
 * @version 0.1
 */

(function () {
	/*
		Create reference to namespace so that the
		actual namespace only has to be referenced
		once in the module. This way, if you want to
		change the namespace later, you don't have to
		F&R or go hunting through your code.
	*/
	
	/**
	 * Local Namespace Reference
	 * @type Object
	 */
	var ns = namespace("com.andrew");
	
	/**
	 * Private variable
	 * @type String
	 */
	var privVar = "Private!";
	
	/**
	 * Private function
	 * @type String
	 */
	function privFunc() {
		return privVar;
	}
	
	var count = 0;
	
	/**
	 * Public variable
	 * @type String
	 */
	ns.pubVar = "Public!";
	
	/**
	 * Public function
	 */
	ns.pubFunc = function () {
		alert(privFunc() + "\n" + this.pubVar);
		count++;
	};
	
	ns.getCount = function () {
	    return count;
	};
})();