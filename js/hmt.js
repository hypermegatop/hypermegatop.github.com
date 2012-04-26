jQuery(function($) {
	var $share = $(".share-initial"),
		$h1 = $("h1");

	// Pretty-print the code samples
	$("pre").addClass("prettyprint linenums");
	prettyPrint();

	// Animate immediately to hide the share bar
	$share.animate({
		opacity: 'hide',
		height: 'hide'
	}, 0);

	// Prepare the transitions for the share buttons
	$h1.on("click", function() {
		$share.addClass("share-final");
		$share.animate({
			opacity: 'show',
			height: 'show'
		}, 'fast');
		
		$h1.off("mouseenter mouseleave");
		$h1.addClass("unclikable");
	});
	$h1.hover(function() {
		if (!$share.hasClass("share-final")) {
			$share.animate({
				opacity: 'show',
				height: 'show'
			}, 'fast');
		}
	},
	function() {
		if (!$share.hasClass("share-final")) {
			$share.animate({
				opacity: 'hide',
				height: 'hide'
			}, 'fast');
		}
	});
});
