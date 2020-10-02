const startRoom = "-2"
let debug = true

window.room = startRoom
let oldRoomSettings
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


    document.querySelectorAll(".door").forEach(element => {
        element.parentNode.removeChild(element)
    });

    if (!updateDoors){
        document.querySelector("p.info").innerText = `Loading...`
        $.getJSON(`./Rooms/${room}/room.json`, "",
        function (data, textStatus, jqXHR) {
            Loading(true)

            if (roomSettings && window.room != startRoom){
                oldRoomSettings = roomSettings
            }else{
                oldRoomSettings = undefined
            }

            roomSettings = data
            $img = document.querySelector("img.roomImg")
            $img.src = `./Rooms/${room}/${data.img}`

            //debug =>
            //$img.onclick = (e) => {log(`${100 / e.target.width * e.offsetX}/${100 / e.target.height * e.offsetY}`);log(e);}

            $img.onload = () =>{
                LoadDoors($img)
                window.scrollTo(0, document.querySelector("p.info").scrollHeight)
                Loading(false)
                log("loading false")
            }
            

            

            if (roomsHistory.length != 0 && !updateDoors){
                document.querySelector("p.info").innerText = `Вы в комнате - ${window.room}.`
                
                $.getJSON(`./Rooms/${roomsHistory[roomsHistory.length-1]}/room.json`, "",
                    function (data, textStatus, jqXHR) {
                        let roomName = window.room
                        const doorRoom = data.doors.filter(door => door.room === window.room)
                        if (doorRoom && doorRoom[0].description){
                            roomName = doorRoom[0].description
                            document.querySelector("p.info").innerText = `Вы в комнате - ${roomName}.`
                        }
                    }
                );
            }else{
                document.querySelector("p.info").innerText = `Вы в начальной комноте`
            }
            
        }
        );
    }

    if (updateDoors){
        LoadDoors(document.querySelector("img.roomImg"))
    }

    //log(roomsHistory.length)
    if (roomsHistory.length != 0 && !updateDoors){
        CreateNavigtionButtons()
    }
}

function CreateNavigtionButtons(){
    document.querySelectorAll(".back").forEach(element => {
        element.parentNode.removeChild(element)
    })

    const $mb = document.createElement("button")
    const $mr = document.createElement("button")
    let $img = document.createElement("img")

    $img.src = "./imgs/back-arrow.png"
    $img.className = "backImg"


    $mb.className = "back"
    $mb.title = "Назад"
    $mb.appendChild($img)

    document.body.appendChild($mb)

    $mb.onclick = () => {
        let prevRoom = roomsHistory[roomsHistory.length-1]
        roomsHistory.splice(roomsHistory.length-1)
        $mb.parentNode.removeChild($mb)
        $mr.parentNode.removeChild($mr)
        //log(prevRoom)
        //room = prevRoom
        ChangeRoom(prevRoom)
    }

    $img = document.createElement("img")

    $img.src = "./imgs/sydney-opera-house.png"
    $img.className = "backImg"

    $mr.className = "back backToRoot"
    $mr.title = "Вернутся в начало"
    $mr.appendChild($img)

    document.body.appendChild($mr)

    $mr.onclick = () => {
        let prevRoom = roomsHistory[0]
        roomsHistory = []
        $mb.parentNode.removeChild($mb)
        $mr.parentNode.removeChild($mr)
        //log(prevRoom)
        //room = prevRoom
        ChangeRoom(prevRoom)
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

    //log(img.width)
    $door.style.left = `${img.width * (door.x / 100)}`
    $door.style.top = `${img.height * (door.y / 100)}`

    $door.style.height = img.height * (door.h / 100)
    $door.style.width = img.width * (door.w / 100)

    if (door.description){
        $door.title = door.description
    }else{
        $door.title = `Комната ${door.room}`
    }

    if (door.color){
        if (door.color === "none"){
            $door.style.backgroundColor = "rgba(0,0,0,0)"
        }else{
            $door.style.backgroundColor = door.color
        }
        
    }

    if (door.img){
        const $doorImg = document.createElement("img")
        if (door.img[0] === "."){
            $doorImg.src = door.img
        }else{
            $doorImg.src = `./Rooms/${room}/${door.img}}`
        }
        $doorImg.className = "doorImg"
        $door.appendChild($doorImg)
    }
    
    //$door.innerText = "DEBUGDEBUGDEBUGDEBUGDEBUGDEBUGDEBUGDEBUG"
    if (door.opacity){
        $door.style.opacity = door.opacity
    }else{
        $door.style.opacity = 0.25
    }

    $door.onclick = () => 
    {
        if (door.room){
            roomsHistory.push(room)
            //room = door.room
            ChangeRoom(door.room)
        }
    }

    return $door
}


$loading = document.querySelector("div.loading")
function Loading(enable){
    if (enable){
        if (!$loading.classList.contains("show")){
                $loading.className = "loading show"
            }
    }else if (!$loading.classList.contains("hide")){
        $loading.className = "loading hide"
    }

    
    log("gl oading " + enable)
}

function log(text){
    if (debug){
        console.log(text)
    }
}