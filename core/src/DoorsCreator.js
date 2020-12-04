export default class DoorsCreator {
	GetDoor($door, img, doorCfg, roomCfgVersion) {
		roomCfgVersion = roomCfgVersion || 1;

		switch (roomCfgVersion) {
			case 1:
				$door.style.left = `${img.clientWidth * (doorCfg.x / 100)}`;
				$door.style.top = `${img.clientHeight * (doorCfg.y / 100)}`;

				$door.style.height = img.clientHeight * (doorCfg.h / 100);
				$door.style.width = img.clientWidth * (doorCfg.w / 100);

				if (doorCfg.description) {
					$door.title = doorCfg.description;
				} else {
					$door.title = `Комната ${doorCfg.room}`;
				}

				if (doorCfg.color) {
					if (doorCfg.color === "none") {
						$door.style.backgroundColor = "rgba(0,0,0,0)";
					} else {
						$door.style.backgroundColor = doorCfg.color;
					}
				}

				if (doorCfg.img) {
					const $doorImg = document.createElement("img");
					if (doorCfg.img[0] === ".") {
						$doorImg.src = doorCfg.img;
					} else {
						$doorImg.src = `${RoomsPath}${room}/${doorCfg.img}}`;
					}
					$doorImg.className = "doorImg";
					$door.appendChild($doorImg);
				}

				if (doorCfg.opacity) {
					$door.style.opacity = doorCfg.opacity;
				} else {
					$door.style.opacity = 0.25;
				}

				$door.onclick = () => {
					if (doorCfg.room) {
						if (
							window.roomsHistory[
								window.roomsHistory.length - 1
							] === doorCfg.room
						) {
							window.roomsHistory.splice(
								window.roomsHistory.length - 1
							);
						} else {
							window.roomsHistory.push(room);
						}
						ChangeRoom(doorCfg.room);
					}
				};
				return $door;

			default:
				break;
		}
	}
}
