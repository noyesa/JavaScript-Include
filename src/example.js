(function () {
	var ns = namespace("com.andrew");
	
	function priv() {
		alert("Private!");
	}
	
	ns.pub = function () {
		priv();
	};
})();