let room = "0"
let roomSettings

let roomsHistory = []

document.body.onload = () => {ChangeRoom(room)}

$(window).resize(() => {
    ChangeRoom(window.room, true)
})

function ChangeRoom(room, updateDoors){
    if (!updateDoors){
        Loading(true)
    }
    window.room = room.toString()
    document.querySelector("p").innerText = `Room: ${room}. Rooms history: ${roomsHistory}.`
    document.querySelectorAll(".door").forEach(element => {
        element.parentNode.removeChild(element)
    });

    if (!updateDoors){
        $.getJSON(`./Rooms/${room}/room.json`, "",
        function (data, textStatus, jqXHR) {
            roomSettings = data
            $img = document.querySelector("img.roomImg")
            $img.src = `./Rooms/${room}/${data.img}`

            //debug =>
            $img.onclick = (e) => {console.log(`${100 / e.target.width * e.pageX}/${100 / e.target.height * e.pageY}`);console.log(e);}

            $img.onload = () =>{
                LoadDoors($img)
                Loading(false)
            }
            


        }
        );
    }

    if (updateDoors){
        LoadDoors(document.querySelector("img.roomImg"))
    }

    //console.log(roomsHistory.length)
    if (roomsHistory.length != 0 && !updateDoors){
        const $mb = document.createElement("button")
        $mb.className = "back"
        $mb.textContent = "Назад"

        document.body.appendChild($mb)

        $mb.onclick = () => {
            let prevRoom = roomsHistory[roomsHistory.length-1]
            roomsHistory.splice(roomsHistory.length-1)
            $mb.parentNode.removeChild($mb)
            //console.log(prevRoom)
            //room = prevRoom
            ChangeRoom(prevRoom)
        }
    }
}

function LoadDoors($img){
    roomSettings.doors.forEach(element => {
        $img.parentElement.appendChild(CreateDoor(element, $img))
    });
}

function CreateDoor(door, img) {
    const $door = document.createElement("button")
    $door.className = "door"

    //console.log(img.width)
    $door.style.left = `${img.width * (door.x / 100)}`
    $door.style.top = `${img.height * (door.y / 100)}`

    $door.style.height = img.height * (door.h / 100)
    $door.style.width = img.width * (door.w / 100)

    if (door.description){
        $door.title = door.description
    }else{
        $door.title = `Комната ${room}`
    }
    
    //$door.innerText = "DEBUGDEBUGDEBUGDEBUGDEBUGDEBUGDEBUGDEBUG"
    $door.style.opacity = 0.25

    $door.onclick = () => 
    {
        console.log(room)
        roomsHistory.push(room)
        //room = door.room
        ChangeRoom(door.room)
    }

    return $door
}


$loading = document.querySelector("div.loading")
function Loading(enable){
    if (enable && !$loading.classList.contains("show")){
        $loading.className = "loading show"
    }else if (!$loading.classList.contains("hide")){
        $loading.className = "loading hide"
    }
}