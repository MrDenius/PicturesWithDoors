const startRoom = "0"
let debug = true

window.room = startRoom
let oldRoomSettings
let roomSettings

let roomImgLow

let roomsHistory = []

document.body.onload = () => {ChangeRoom(room)}

$(window).resize(() => {
    ChangeRoom(window.room, true)
})

function CreateImg(src){
    const $img = new Image()
    $img.src = src
    return $img
}

const fullImgCash = []

function LoadingFullImgAsync(canvas, context, offsetX = 0) {
    setTimeout(() => {
        const w = canvas.width
        const h = canvas.height
        for (let y = 0; y <= 10; y++) {
            for (let x = 0; x <= 10; x++) {
                if (fullImgCash[x] && fullImgCash[x][y]){
                    context.drawImage(fullImgCash[x][y], w/10*x + offsetX, h/10*y, w/10, h/10);
                }else{
                    let $img = CreateImg(`./Rooms/?room=${room}&tile=${x};${y}&q=85`)

                    draw = ($img, x, y) => {
                        $img.onload = () => {
                            context.drawImage($img, w/10*x + offsetX, h/10*y, w/10, h/10);
                            
                            if (fullImgCash[x] !== undefined){
                                fullImgCash[x][y] = $img
                            }else{
                                fullImgCash[x] = []
                                fullImgCash[x][y] = $img
                            }

                            log(`${x};${y} Loaded`)
                        }
    
                    }
                    draw($img, x, y)
                }
            }
            
        }


    }, 0)
}
let ddd

let offsetX = 0;
function CanvasDragAndMove(e, canvas, context) {
    e.preventDefault
    e.target.onmouseup = () => {
        e.preventDefault
        e.target.onmouseup = null;
        e.target.onmousemove = null;
    }
    let lastOffsetX = 0;
    let lastX
    e.target.onmousemove = (e) => {
        e.preventDefault
        log(offsetX)
        if (!isNaN(lastX)){
            offsetX -= lastX - e.clientX
            if (Math.abs(lastOffsetX - offsetX) >= 15){
                LoadingFullImgAsync(canvas, context, offsetX * 1.5)
                log("Move")
                lastOffsetX = offsetX
            }
        }
        lastX = e.clientX
    }
    log("drdrdr")
    
    if (lastX){
    }
}

function ChangeRoom(room, updateDoors){
    if (!updateDoors){
        Loading(true)
        fullImgCash.splice(0, fullImgCash.length)
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

            const $imgLow = CreateImg(`./Rooms/index.php?room=${room}&q=10`)
            
            const canvas = document.querySelector("canvas")
            const context = canvas.getContext("2d")

            document.querySelector(".roomImg").onmousedown = e => {CanvasDragAndMove(e, canvas, context)}

            //ddd = (offsetX) => LoadingFullImgAsync(canvas, context, offsetX);

            //debug =>
            //$img.onclick = (e) => {log(`${100 / e.target.width * e.offsetX}/${100 / e.target.height * e.offsetY}`);log(e);}

            $imgLow.onload = (e) =>{

                //alert($imgLow.naturalWidth + 'x' + $imgLow.naturalHeight);

                canvas.offsetWidth = $imgLow.naturalWidth
                canvas.width = $imgLow.naturalWidth;
                canvas.height = canvas.offsetHeight;

                LoadingFullImgAsync(canvas, context)

                context.drawImage($imgLow, 0, 0, canvas.clientWidth, canvas.clientHeight)
                LoadDoors(canvas)
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
        LoadDoors(document.querySelector(".roomImg"))
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