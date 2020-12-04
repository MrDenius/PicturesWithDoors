return;
(function (factory) {
	window.SwipeEvent = factory();
})(function () {
	function init() {
		function CreateSwipeEvent(dir) {
			const detail = {
				dir: dir,
			};
			detail[dir] = true;
			return new CustomEvent("swipe", { detail: detail });
		}

		let pixelsForSwipe = 250;
		let startPos = 0;
		let zooming = false;

		if (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			)
		)
			pixelsForSwipe = 150;

		function MouseDown(X) {
			startPos = X;
			document.addEventListener("mousemove", MouseMove);
			document.addEventListener("touchmove", MouseMove);
		}
		function MouseUp(X) {
			document.removeEventListener("mousemove", MouseMove);
			document.removeEventListener("touchmove", MouseMove);
			if (Math.abs(startPos - X) >= pixelsForSwipe && !zooming)
				if (startPos - X < 0) {
					document.dispatchEvent(CreateSwipeEvent("left"));
				} else {
					document.dispatchEvent(CreateSwipeEvent("right"));
				}
		}

		function MouseMove(e) {
			if (
				!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent
				)
			)
				e.preventDefault();
		}

		document.addEventListener("mousedown", (e) => MouseDown(e.screenX));
		document.addEventListener("mouseup", (e) => MouseUp(e.screenX));
		document.addEventListener("touchstart", (e) =>
			MouseDown(e.touches[0].screenX)
		);
		document.addEventListener("touchend", (e) =>
			MouseUp(e.changedTouches[0].screenX)
		);

		const api = function api() {};

		api.ChangePixelsForSwipe = (px) => {
			if (Number.parseInt(px) === Number.NaN && px != undefined) {
				throw "px: is NaN";
			}
			if (px === undefined) {
				return pixelsForSwipe;
			}
			pixelsForSwipe = px;
			return pixelsForSwipe;
		};

		return api;
	}

	return init();
});
