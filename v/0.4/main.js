const startRoom = "-2"
const VERSION = 0.3
let debug = true

window.room = startRoom
let oldRoomSettings
let roomSettings
let ImgLoader = new RoomImgLoader(startRoom)

let roomsHistory = []

document.body.onload = () => {
    document.querySelector("p.version").textContent = `v ${VERSION}`

    this.canvas = document.querySelector("canvas")
    this.context = canvas.getContext("2d")

    ChangeRoom(room)
}

$(window).resize(() => {
    ChangeRoom(window.room, true)
})

function CreateImg(src){
    const $img = new Image()
    $img.src = src
    return $img
}

function ChangeRoom(room, updateDoors){
    if (!updateDoors){
        //TODO: если фул смена комнаты
        Loading(true)
        ImgLoader = new RoomImgLoader(room)
    }
    window.room = room.toString()


    //Удаление дверей
    document.querySelectorAll(".door").forEach(element => {
        element.parentNode.removeChild(element)
    });

    if (!updateDoors){
        document.querySelector("p.info").innerText = `Loading...`
        $.getJSON(`./Rooms/${room}/room.json`, "",
        function (data, textStatus, jqXHR) {
            Loading(true)

            //TODO: Обработка полученого конфига
            if (roomSettings && window.room != startRoom){
                oldRoomSettings = roomSettings
            }else{
                oldRoomSettings = undefined
            }

            roomSettings = data

            //TODO: Рисовка комнаты

            //ресайз канваса
            const resizeCanvas = (img) => {
                canvas.width = canvas.clientWidth
                canvas.height = canvas.width * (img.height / img.width)
            }

            //загрузка рум имг лоу качества
            ImgLoader.GetImg({q: 25, s: "160p"}, (img) => {
                //подгон канваса под соотношение старон картинки
                resizeCanvas(img)

                context.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight)

                //синхронная рисовка завершена

                //старт асинк дорисовки картинки в нормальном качестве
                const LoadFullImg = () => {
                    const tx = 5
                    const ty = 5
                    for (let y = 0; y <= ty; y++) {
                        for (let x = 0; x <= tx; x++) {
                            ImgLoader.GetImg({tile:{x: x, y:y}, q:85, s: "720p"}, (img, imgSettings) => {
                                context.drawImage(img, canvas.width/tx*x, canvas.height/ty*y, canvas.clientWidth/tx, canvas.clientHeight/ty)
                            })
                        }
                    }
                }
                LoadFullImg()

                LoadDoors(canvas)//отрисовка дверей
                Loading(false)
                window.scrollTo(0, document.querySelector("p.info").scrollHeight)//автоскрол внис (скрытие тайтла)
            })
            

            //TODO: Изменение тайтла
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
                document.querySelector("p.info").innerText = `Вы в начальной комнате`
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


//TODO: Кнопки навигации
//Лучше не трогать пока работает))
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
    //У $img должна быть width и height
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