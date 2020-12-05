export class RoomImgLoader {
	constructor(roomId) {
		this.roomId = roomId;
	}

	ChangeRoom(roomId) {
		this.roomId = roomId;
	}

	loadHistory = [];

	GetImg(imgSettings, onload) {
		const CreateImage = (src) => {
			const img = new Image();
			const StartLoadImg = () => {
				this.loadHistory.push(img);
				img.src = imgSrc;
			};
			img.StartLoadImg = StartLoadImg;

			img.addEventListener("load", () => {
				this.loadHistory.splice(this.loadHistory.indexOf(img), 1);
				onload(img, imgSettings);
			});
			return img;
		};

		let imgSrc = `${window.RoomsPath}?room=${this.roomId}`;
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

		const img = CreateImage();
		img.StartLoadImg();

		return img;
	}
}

export class RoomLoader {
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

		let ImgLoader = new RoomImgLoader(roomId);

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

			//debug
			let timeStart = Date.now();

			ImgLoader.GetImg(
				{
					q: 50,
					s: "240p",
					imgId: imgId,
				},
				(img) => {
					let abort = false;

					//подгон канваса под соотношение старон картинки
					if (canvas.width === 300) resizeCanvas(img);
					if (canvas.width != canvas.clientWidth) resizeCanvas(img);

					canvasEditor.ChangeImg(img, effect, options).then(() => {
						CheckAbort(() => (abort = true));
						this.lImg = canvas.toDataURL();

						//синхронная рисовка завершена

						//старт асинк дорисовки картинки в нормальном качестве
						const LoadFullImg = () => {
							const tx = 8;
							const ty = 6;
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
													Math.floor(
														((canvas.width - 0) /
															tx) *
															x
													),
													Math.floor(
														((canvas.height - 0) /
															ty) *
															y
													),
													canvas.width / tx,
													canvas.height / ty
												);
												tLoaded++;
												if (tLoaded === tx * ty) {
													this.hImg = canvas.toDataURL();

													//debug
													console.log(
														`Full load end: ${
															Date.now() -
															timeStart
														} ms`
													);

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
			$.getJSON(
				`${RoomsPath}${room}/room.json`,
				"",
				function (data, textStatus, jqXHR) {
					drawRoom(data);
				}
			);
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
