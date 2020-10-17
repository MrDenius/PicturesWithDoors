fetch("./Rooms/rooms.json").then((res) =>
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
	roomImg.src = roomSettings.img || "./res/roomImgDefault.jpg";

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
			StartPWDCore({ sr: roomSettings.sr, rp: roomSettings.rp });
		});
		roomEl.style.cursor = "pointer";
	}

	console.log(roomEl);
	return roomEl;
}

function StartPWDCore(settings) {
	settings.sr = settings.sr || settings.startRoom || "";
	settings.rp = settings.rp || settings.roomPath || "";
	settings.v = settings.v || settings.VERSION || "";

	const frame = document.createElement("iframe");
	frame.className = "fullframe";

	frame.src = `./core/?sr${settings.sr.toString()}&rp=${settings.rp.toString()}&v=${settings.v.toString()}`;

	document.body.innerHTML = "";
	document.body.appendChild(frame);
}
