class RoomImgLoader {
	constructor(roomId) {
		this.roomId = roomId;
	}

	ChangeRoom(roomId) {
		this.roomId = roomId;
	}

	GetImg(imgSettings, onload) {
		let imgSrc = `./Rooms/?room=${this.roomId}`;
		if (
			imgSettings.tile &&
			Number.isInteger(imgSettings.tile.x) &&
			Number.isInteger(imgSettings.tile.y)
		) {
			imgSrc += `&tile=${imgSettings.tile.x};${imgSettings.tile.y}`;
		}
		if (imgSettings.q || imgSettings.quality) {
			imgSrc += `&q=${imgSettings.q || imgSettings.quality}`;
		}
		if (imgSettings.s || imgSettings.scale) {
			imgSrc += `&scale=${imgSettings.s || imgSettings.scale}`;
		}
		if (imgSettings.imgId != undefined) {
			imgSrc += `&imgId=${imgSettings.imgId}`;
		}

		const img = new Image();
		img.src = imgSrc;

		let imgLoaded = false;
		img.addEventListener("load", () => {
			onload(img, imgSettings);
		});

		return img;
	}
}

class RoomLoader {
	canvas;
	context;
	isRoomLoading = false;
	startAbort = false;

	hImg;
	lImg;

	constructor(canvas, context) {
		RoomLoader.canvas = canvas;
		RoomLoader.context = context;
	}

	LoadRoom(roomId, roomJson, onFullLoad, onLoad, imgId) {
		if (this.isRoomLoading) {
			this.AbortLoad(() =>
				this.LoadRoom(roomId, roomJson, onFullLoad, onLoad, imgId)
			);
			return;
		}

		this.isRoomLoading = true;

		const resizeCanvas = (img) => {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.width * (img.height / img.width);
		};

		const drawRoom = (roomJson) => {
			//Фигня для аборта
			const imgsCash = [];
			const CheckAbort = (istrue) => {
				if (this.startAbort === true) {
					this.startAbort = false;
					this.isRoomLoading = false;

					imgsCash.forEach((el) => {
						el.src = "404";
					});

					if (istrue) istrue();
					if (this.onaborted) this.onaborted();
					return;
				}
			};
			this.roomId = this.roomId || roomId;

			if (imgId === undefined) imgId = roomJson.imgId;

			let effect;
			let options = { ms: 1000 };
			if (this.roomId == undefined || this.roomId === roomId) {
				if (
					(this.oldImgId && this.oldImgId != imgId) ||
					imgId != roomJson.imgId
				) {
					if (Math.abs(imgId - this.oldImgId) === 1) {
						if (imgId > this.oldImgId) {
							//left
							effect = "slide";
							options.dir = "left";
						}
						if (imgId < this.oldImgId) {
							//right
							effect = "slide";
							options.dir = "right";
						}
					} else {
						if (imgId > this.oldImgId) {
							effect = "slide";
							options.dir = "right";
						}
						if (imgId < this.oldImgId) {
							effect = "slide";
							options.dir = "left";
						}
					}
				}
				this.oldImgId = imgId;
			} else {
				this.oldImgId = undefined;
			}
			this.oldImgId = imgId;

			ImgLoader.GetImg(
				{
					q: 45,
					s: "360p",
					imgId: imgId,
				},
				(img) => {
					let abort = false;

					//подгон канваса под соотношение старон картинки
					if (canvas.width === 300) resizeCanvas(img);

					log({ effect: effect, options: options });
					canvasEditor.ChangeImg(img, effect, options).then(() => {
						CheckAbort(() => (abort = true));
						this.lImg = canvas.toDataURL();

						//синхронная рисовка завершена

						//старт асинк дорисовки картинки в нормальном качестве
						const LoadFullImg = () => {
							const tx = 5;
							const ty = 5;
							let tLoaded = 0;
							for (let y = 0; y <= ty; y++) {
								for (let x = 0; x <= tx; x++) {
									imgsCash.push(
										ImgLoader.GetImg(
											{
												tile: {
													x: x,
													y: y,
												},
												q: 85,
												s: `${720 / ty}p`,
												imgId: imgId,
											},
											(img, imgSettings) => {
												if (abort) return;
												CheckAbort(
													() => (abort = true)
												);
												context.drawImage(
													img,
													(canvas.width / tx) * x,
													(canvas.height / ty) * y,
													canvas.clientWidth / tx,
													canvas.clientHeight / ty
												);
												tLoaded++;
												if (tLoaded === tx * ty) {
													this.hImg = canvas.toDataURL();

													this.isRoomLoading = false;
													if (onFullLoad) {
														onFullLoad();
													}
												}
											}
										)
									);
									CheckAbort();
								}
							}
						};
						LoadFullImg();

						this.roomId = roomId;
						if (onLoad) onLoad();
					});
				}
			);
		};

		if (!roomJson) {
			$.getJSON(`./Rooms/${room}/room.json`, "", function (
				data,
				textStatus,
				jqXHR
			) {
				drawRoom(data);
			});
		} else {
			drawRoom(roomJson);
		}
	}

	direction = {
		x: 0,
		y: 0,
	};
	Move(direction, distance) {
		//left
		if (direction === 0) {
			this.direction.x += distance;
		}
		//right
		if (direction === 1) {
			this.direction.x -= distance;
		}

		const img = new Image();
		img.src = this.hImg || this.lImg;

		this.Clear();
		context.drawImage(
			img,
			this.direction.x,
			0,
			canvas.width,
			canvas.height
		);
	}

	Clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	AbortLoad(onaborted) {
		if (!this.isRoomLoading) {
			return;
		}
		console.log("START ABORT");

		this.onaborted = onaborted;
		this.startAbort = true;
	}
}
