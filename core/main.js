const startRoom = getParamValue("sr") || "-2";
const RoomsPath = getParamValue("rp") || "../Rooms/Home/";
const VERSION = getParamValue("v") || "0.6.3";
let debug = true;

window.room = startRoom;
let imgId = 0;
let oldRoomSettings;
let roomSettings;
let ImgLoader = new RoomImgLoader(startRoom);
let roomLoader = new RoomLoader(this.canvas, this.context);
let doorsCreator = new DoorsCreator();

let roomsHistory = [];

document.body.onload = () => {
	document.querySelector("p.version").textContent = `v ${VERSION}`;

	this.canvas = document.querySelector("canvas");
	this.context = canvas.getContext("2d");
	this.canvasEditor = new CanvasEditor(this.canvas);

	ChangeRoom(room);
};

window.addEventListener("resize", () => {
	const roomImg = document.querySelector(".roomImg");
	if (window.innerWidth / window.innerHeight < 1) {
		roomImg.style.height = "100%";
		roomImg.style.width = "auto";
	} else {
		roomImg.style.height = "auto";
		roomImg.style.width = "100%";
	}
	ChangeRoom(window.room, null, imgId);
});

function CreateImg(src) {
	const $img = new Image();
	$img.src = src;
	return $img;
}

function ChangeRoom(room, updateDoors, newImgId) {
	if (!updateDoors) {
		//TODO: если фул смена комнаты
		Loading(true);
		if (ImgLoader) {
			ImgLoader.ChangeRoom(room);
		} else {
			ImgLoader = new RoomImgLoader(room);
		}
	}
	window.room = room.toString() || startRoom;

	//Удаление дверей
	document.querySelectorAll(".door").forEach((element) => {
		element.parentNode.removeChild(element);
	});

	//ресайз канваса
	const resizeCanvas = (img) => {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.width * (img.height / img.width);
	};

	if (!updateDoors) {
		document.querySelector("p.info").innerText = `Loading...`;
		fetch(`${RoomsPath}${room}/room.json`)
			.then((response) => response.json())
			.then((data) => {
				Loading(true);

				//TODO: Обработка полученого конфига
				//roomSettings = data;
				if (roomSettings && window.room != startRoom) {
					oldRoomSettings = roomSettings;
				} else {
					oldRoomSettings = undefined;
				}
				roomSettings = data;

				if (newImgId != undefined) imgId = newImgId;
				else imgId = roomSettings.imgId || "0";
				console.log(imgId);

				//TODO: Рисовка комнаты

				roomLoader.LoadRoom(
					room,
					roomSettings,
					null,
					() => {
						LoadDoors(canvas); //отрисовка дверей
						//Рисовка LRNuttons
						CreateLRButtons();

						Loading(false);
						window.scrollTo(
							window.innerWidth / 2,
							document.querySelector("p.info").scrollHeight
						); //автоскрол вниз (скрытие title)
					},
					imgId
				);

				//TODO: Изменение title
				if (roomsHistory.length != 0 && !updateDoors) {
					document.querySelector(
						"p.info"
					).innerText = `Вы в комнате - ${window.room}.`;

					fetch(
						`${RoomsPath}${
							roomsHistory[roomsHistory.length - 1]
						}/room.json`
					)
						.then((response) => response.json())
						.then((data) => {
							let roomName = window.room;
							const doorRoom = data.doors.filter(
								(door) => door.room === window.room
							);
							if (doorRoom && doorRoom[0].description) {
								roomName = doorRoom[0].description;
								document.querySelector(
									"p.info"
								).innerText = `Вы в комнате - ${roomName}.`;
							}
						});
				} else {
					document.querySelector(
						"p.info"
					).innerText = `Вы в начальной комнате`;
				}
			});
	}

	if (updateDoors) {
		resizeCanvas(canvas);
		LoadDoors(canvas);
	}

	console.log(roomsHistory);
	document.querySelectorAll(".back").forEach((element) => {
		element.parentNode.removeChild(element);
	});
	if (roomsHistory.length != 0 && !updateDoors) {
		CreateNavigtionButtons();
	}
}

function CreateLRButtons() {
	const lButton = document.querySelector(".lButton");
	const rButton = document.querySelector(".rButton");

	this.imgIdChanging = null;

	if (roomSettings.imgLoop) {
		//Левая кнопка
		lButton.style.display = "block";
		if (imgId > 0) {
			lButton.onclick = () => {
				ChangeRoom(room, null, String(imgId - 1));
			};
		} else {
			lButton.onclick = () => {
				ChangeRoom(room, null, String(roomSettings.imgs.length - 1));
			};
		}

		//Правая кнопка
		rButton.style.display = "block";
		if (imgId < roomSettings.imgs.length - 1) {
			rButton.onclick = () => {
				ChangeRoom(room, null, String(parseInt(imgId) + 1));
			};
		} else {
			rButton.onclick = () => {
				ChangeRoom(room, null, String(0));
			};
		}
	} else {
		//Левая кнопка
		if (imgId > 0) {
			lButton.style.display = "block";

			lButton.onclick = () => {
				ChangeRoom(room, null, String(imgId - 1));
			};
		} else {
			lButton.style.display = "none";
		}

		//Правая кнопка
		if (imgId < roomSettings.imgs.length - 1) {
			rButton.style.display = "block";

			rButton.onclick = () => {
				ChangeRoom(room, null, String(parseInt(imgId) + 1));
			};
		} else {
			rButton.style.display = "none";
		}
	}

	const HideLR = () => {
		if (rButton) rButton.style.display = "none";
		if (lButton) lButton.style.display = "none";
	};
	rButton.addEventListener("click", HideLR);
	lButton.addEventListener("click", HideLR);
}

//TODO: Кнопки навигации
//Лучше не трогать пока работает))
function CreateNavigtionButtons() {
	const $mb = document.createElement("button");
	const $mr = document.createElement("button");
	let $img = document.createElement("img");

	$img.src = "./imgs/back-arrow.png";
	$img.className = "backImg";

	$mb.className = "back";
	$mb.title = "Назад";
	$mb.appendChild($img);

	$img.onload = () => document.body.appendChild($mb);

	$mb.onclick = () => {
		let prevRoom = roomsHistory[roomsHistory.length - 1];
		roomsHistory.splice(roomsHistory.length - 1);
		$mb.parentNode.removeChild($mb);
		$mr.parentNode.removeChild($mr);
		//log(prevRoom)
		//room = prevRoom
		ChangeRoom(prevRoom);
	};

	$img = document.createElement("img");

	$img.src = "./imgs/sydney-opera-house.png";
	$img.className = "backImg";

	$mr.className = "back backToRoot";
	$mr.title = "Вернутся в начало";
	$mr.appendChild($img);

	$img.onload = () => document.body.appendChild($mr);

	$mr.onclick = () => {
		let prevRoom = roomsHistory[0];
		roomsHistory = [];
		$mb.parentNode.removeChild($mb);
		$mr.parentNode.removeChild($mr);
		//log(prevRoom)
		//room = prevRoom
		ChangeRoom(prevRoom);
	};
}

function LoadDoors($img, w, h) {
	if (w && h) {
		$img = {
			width: w,
			height: h,
		};
	}

	//У $img должна быть width и height
	roomSettings.doors.forEach((element) => {
		if (element.imgId == imgId)
			$img.parentElement.appendChild(CreateDoor(element, $img));
	});
}

function CreateDoor(door, img) {
	let $door = document.createElement("button");
	$door.className = "door";

	$door = doorsCreator.GetDoor($door, img, door, roomSettings.VERSION);

	return $door;
}

$loading = document.querySelector("div.loading");

function Loading(enable) {
	if (enable) {
		if (!$loading.classList.contains("show")) {
			$loading.className = "loading show";
		}
	} else if (!$loading.classList.contains("hide")) {
		$loading.className = "loading hide";
	}

	//log("gl oading " + enable)
}

function log(text) {
	if (debug) {
		console.log(text);
	}
}

function getParamValue(paramName) {
	var url = window.location.search.substring(1); //get rid of "?" in querystring
	var qArray = url.split("&"); //get key-value pairs
	for (var i = 0; i < qArray.length; i++) {
		var pArr = qArray[i].split("="); //split key and value
		if (pArr[0] == paramName) return pArr[1]; //return value
	}
}
