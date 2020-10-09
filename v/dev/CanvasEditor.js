class CanvasEditor {
	canvas;
	context;
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	GetContext() {
		return canvas.toDataURL();
	}

	GetImg() {
		const img = new Image();
		return new Promise((resolve, reject) => {
			img.onload = () => resolve(img);
			img.src = this.GetContext();
		});
	}

	DrawImg(img, x, y, w, h) {
		let s = {};
		if (typeof x === "object") s = x;
		else {
			s.x = x | 0;
			s.y = y | 0;
			s.w = w | canvas.clientWidth;
			s.h = h | canvas.clientHeight;
		}
		this.context.drawImage(img, s.x, s.y, s.w, s.h);
	}

	ChangeImg(newImg, effect, options) {
		options = options || {};

		switch (effect) {
			case "slide":
				return new Promise((resolve, reject) => {
					this.GetImg().then((res) => {
						const oldImg = res;
						const dir = options.dir || "left";
						const drawImgs = (offset) => {
							this.DrawImg(oldImg, offset, 0);
							if (offset < 0)
								this.DrawImg(
									newImg,
									this.canvas.clientWidth + offset
								);
							else
								this.DrawImg(
									newImg,
									offset - this.canvas.clientWidth
								);
						};
						//TODO: Max кадров
						const maxI = 60 * ((options.ms || 5000) / 1000);
						let i = 0;
						const interval = setInterval(() => {
							if (i <= maxI) {
								let offset =
									this.canvas.clientWidth *
									(i / (maxI / 100) / 100);
								if (dir === "left") {
									drawImgs(-offset);
								}
								if (dir === "right") {
									drawImgs(offset);
								}
							} else {
								clearInterval(interval);
								resolve();
							}
							i++;
						}, options.ms / maxI || 5000 / maxI);
					});
				});

			default:
				return new Promise((resolve, reject) => {
					this.DrawImg(newImg);
					resolve();
				});
		}
	}

	Clear() {
		this.context.clearRect(0, 0, canvas.width, canvas.height);
	}
}
