/*globals jQuery, window, prettyPrint*/

jQuery(function($) {

	// Return immediately if not on an article page (js is still loaded because minified as
	// a single file with bootstrap)
	if (!window.prettyPrint) { return false; }

	var $share = $(".share-initial"),
		$openshare = $(".share"),
		$spanshare = $("span.share"),
		$h1 = $("h1");

	function showShare() {
		$share.addClass("share-final");
		$share.animate({
			opacity: 'show',
			height: 'show'
		}, 'fast');
		
		$h1.off("mouseenter mouseleave");
		$h1.off("click");
		$h1.addClass("unclikable");

		return false;
	}

	// Pretty-print the code samples
	$("pre").addClass("prettyprint linenums");
	prettyPrint();

	// Animate immediately to hide the share bar
	$share.animate({
		opacity: 'hide',
		height: 'hide'
	}, 0);

	// Prepare the transitions for the share buttons
	$openshare.on("click", function() {
		return showShare();
	});

	$spanshare.on("click", function() {
		return showShare();
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
