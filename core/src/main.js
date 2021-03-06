import { RoomImgLoader, RoomLoader } from "./ImgLoader";
import DoorsCreator from "./DoorsCreator";
import CanvasEditor from "./CanvasEditor";
import Hammer from "hammerjs";
import Cookie from "js-cookie";
import Analytics from "./Analytics";

import "./style.css";

let rightArrow;

function LoadImgs() {
	toDataUrl(
		require("./imgs/right-arrow128.png").default,
		(img) => (rightArrow = img)
	);
}
LoadImgs();

console.log(rightArrow);

window.startRoom = getParamValue("sr") || "-2";
window.RoomsPath = getParamValue("rp") || "./Rooms/Home/";
window.VERSION = getParamValue("v") || "0.9";
let debug = true;

window.room = startRoom;
let imgId = 0;
let oldRoomSettings;
let roomSettings;

let ImgLoader = new RoomImgLoader(startRoom);
let hammer = new Hammer(document.body);

window.roomsHistory = JSON.parse(getParamValue("h") || "[]");

document.querySelector("body").onload = () => {
	document.querySelector("p.version").textContent = `v ${VERSION}`;

	window.canvas = document.querySelector("canvas");
	window.context = canvas.getContext("2d");
	window.canvasEditor = new CanvasEditor(window.canvas);

	window.roomLoader = new RoomLoader(window.canvas, window.context);
	window.doorsCreator = new DoorsCreator();

	if (window.roomsHistory != []) {
		fetch(
			`${RoomsPath}${
				window.roomsHistory[window.roomsHistory.length - 1]
			}/room.json`
		)
			.then((response) => response.json())
			.then((oldJson) => {
				oldRoomSettings = oldJson;
			});
	}

	ChangeRoom(room);
};

window.addEventListener("resize", () => {
	ChangeRoom(window.room, null, imgId);
});

function CreateImg(src) {
	const $img = new Image();
	$img.src = src;
	return $img;
}

window.ChangeRoom = function (room, updateDoors, newImgId) {
	//anal
	Analytics.Step({
		type: "changeroom",
		roomsHistory: window.roomsHistory,
		RoomsPath: RoomsPath,
		VERSION: window.VERSION,
	});

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

	//Сохранение в cookie
	Cookie.set(
		`${RoomsPath}`,
		JSON.stringify({ room: room, history: window.roomsHistory })
	);

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
				if (window.roomsHistory.length != 0 && !updateDoors) {
					document.querySelector(
						"p.info"
					).innerText = `Вы в комнате - ${window.room}.`;

					fetch(
						`${RoomsPath}${
							window.roomsHistory[window.roomsHistory.length - 1]
						}/room.json`
					)
						.then((response) => response.json())
						.then((data) => {
							let roomName = window.room;
							const doorRoom = data.doors.filter(
								(door) => door.room === window.room
							);
							if (
								doorRoom &&
								doorRoom.length != 0 &&
								doorRoom[0].description
							) {
								roomName = doorRoom[0].description || "ERROR";
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

	document.querySelectorAll(".back").forEach((element) => {
		element.parentNode.removeChild(element);
	});
	if (window.roomsHistory.length != 0 && !updateDoors) {
		CreateNavigtionButtons();
	}
};

hammer.get("pan").set({ enable: true, direction: Hammer.DIRECTION_HORIZONTAL });

hammer
	.get("swipe")
	.set({ direction: Hammer.DIRECTION_HORIZONTAL, enable: true });
hammer.on("swipe", (event) => {
	if (event.direction === 4) {
		if (
			document.querySelector(".lButton") &&
			document.querySelector(".lButton").style.display != "none"
		)
			document.querySelector(".lButton").click();
	}
	if (event.direction === 2) {
		if (
			document.querySelector(".rButton") &&
			document.querySelector(".rButton").style.display != "none"
		)
			document.querySelector(".rButton").click();
	}
});

function CreateLRButtons() {
	const lButton = document.querySelector(".lButton");
	const rButton = document.querySelector(".rButton");

	if (
		!lButton.querySelector("img").src &&
		!rButton.querySelector("img").src
	) {
		lButton.querySelector("img").src = rightArrow;
		rButton.querySelector("img").src = rightArrow;
	}

	window.imgIdChanging = null;

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

import imgHome from "./imgs/sydney-opera-house.png";
import imgBack from "./imgs/back-arrow.png";

//TODO: Кнопки навигации
//Лучше не трогать пока работает))
function CreateNavigtionButtons() {
	const $mb = document.createElement("button");
	const $mr = document.createElement("button");
	let $img = document.createElement("img");

	$img.src = imgBack;
	$img.className = "backImg";

	$mb.className = "back";
	$mb.title = "Назад";
	$mb.appendChild($img);

	$img.onload = () => document.body.appendChild($mb);

	$mb.onclick = () => {
		let prevRoom = window.roomsHistory[window.roomsHistory.length - 1];
		window.roomsHistory.splice(window.roomsHistory.length - 1);
		$mb.parentNode.removeChild($mb);
		$mr.parentNode.removeChild($mr);
		//log(prevRoom)
		//room = prevRoom
		ChangeRoom(prevRoom);
	};

	$img = document.createElement("img");

	$img.src = imgHome;
	$img.className = "backImg";

	$mr.className = "back backToRoot";
	$mr.title = "Вернутся в начало";
	$mr.appendChild($img);

	$img.onload = () => document.body.appendChild($mr);

	$mr.onclick = () => {
		let prevRoom = window.roomsHistory[0];
		window.roomsHistory = [];
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

	$door = doorsCreator.GetDoor($door, img, door, roomSettings.version);

	return $door;
}

let $loading = document.querySelector("div.loading");

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
		if (pArr[0] == paramName) return decodeURI(pArr[1]); //return value
	}
}

function toDataUrl(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var reader = new FileReader();
		reader.onloadend = function () {
			callback(reader.result);
		};
		reader.readAsDataURL(xhr.response);
	};
	xhr.open("GET", url);
	xhr.responseType = "blob";
	xhr.send();
}
