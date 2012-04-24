jQuery(function($) {
	var $share = $(".share-initial"),
		$h1 = $("h1");

	$("pre").addClass("prettyprint linenums");
	prettyPrint();

	$h1.on("click", function() {
		$share.removeClass("share-tease");
		$share.addClass("share-final");
		$h1.off("mouseenter mouseleave");
		$h1.addClass("unclikable");
	});
	$h1.hover(function() {
		if (!$share.hasClass("share-final")) {
			$share.addClass("share-tease");
		}
	}, function() {
		$share.removeClass("share-tease");
	});
});
