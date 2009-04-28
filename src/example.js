(function () {
	/*
		Create reference to namespace so that the
		actual namespace only has to be referenced
		once in the module. This way, if you want to
		change the namespace later, you don't have to
		F&R or go hunting through your code.
	*/
	var ns = namespace("com.andrew");
	
	// Private variable
	var privVar = "Private!";
	
	// Private function
	function priv() {
		return privVar;
	}
	
	ns.pubVar = "Public!";
	
	// Public function; accesses private function through closure
	ns.pub = function () {
		alert(priv() + "\n" + this.pubVar);
	};
})();