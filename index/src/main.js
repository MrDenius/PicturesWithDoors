const Cookies = require("js-cookie");

import "./style.css";

const roomImgDefault = require("./res/roomImgDefault.jpg");

console.log(roomImgDefault);

fetch("./core/Rooms/rooms.json").then((res) =>
	res.json().then((roomsJson) => {
		RoomsLoad(roomsJson);
	})
);

function RoomsLoad(rooms) {
	const locs = document.querySelector(".locs");
	rooms.Rooms.forEach((element) => {
		locs.appendChild(CreateRoom(element));
	});
}

function CreateRoom(roomSettings) {
	const roomEl = document.createElement("div");
	roomEl.className = "location";

	const roomImg = new Image();
	roomImg.className = "location-img";
	roomImg.src = roomSettings.img || roomImgDefault.default;

	const roomDesc = document.createElement("p");
	roomDesc.className = "location-text";

	const roomHider = document.createElement("div");
	roomHider.className = "hider show";

	roomEl.appendChild(roomImg);
	roomEl.appendChild(roomDesc);
	roomEl.appendChild(roomHider);

	roomDesc.innerHTML = roomSettings.name;

	if (roomSettings.rp) {
		roomEl.addEventListener("click", () => {
			let cSettings = GetRoomSettings(roomSettings.rp) || {};

			if (
				JSON.stringify(cSettings) != JSON.stringify({}) &&
				cSettings.sr != roomSettings.sr
			) {
				if (!confirm("Продолжить с того-же места?")) {
					cSettings = {};
				}
			}

			StartPWDCore({
				sr: cSettings.sr || roomSettings.sr,
				rp: roomSettings.rp,
				h: JSON.stringify(cSettings.h) || "",
			});
		});
		roomEl.style.cursor = "pointer";
	}
	return roomEl;
}

function GetRoomSettings(rp) {
	const cookie = Cookies.getJSON(rp);
	const settings = {};
	if (cookie) {
		settings.sr = cookie.room || "";
		settings.h = cookie.history || "";
	}

	return settings;
}

function StartPWDCore(settings) {
	settings.sr = settings.sr || settings.startRoom || "";
	settings.rp = settings.rp || settings.roomPath || "";
	settings.v = settings.v || settings.VERSION || "";
	settings.h = settings.h || settings.history || "";

	console.log({
		name: "STARTING CORE",
		settings: settings,
		cookie: Cookies.getJSON(settings.rp),
	});

	const frame = document.createElement("iframe");
	frame.className = "fullframe";

	frame.src = `./core/?sr=${settings.sr.toString()}&rp=${settings.rp.toString()}&v=${settings.v.toString()}&h=${settings.h.toString()}`;

	document.body.innerHTML = "";
	document.body.appendChild(frame);
}
