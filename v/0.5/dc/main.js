//import * as message from "../HIMessage.js"

var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
      var output = document.getElementById('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
    console.log(event.target.files[0])
    InitDC(output, event.target.files[0].name)
};

document.querySelector(".input").onchange = loadFile

InitDaD(document.querySelector("#drop_zone"), document.querySelector(".input"))

function InitDC($img, fName){
    //$img.style.height = "80%"
    //$img.style.width = "auto"

    RoomJson.img = fName

    $img.onclick = ClickHandler
    //$img.onclick = (e) => {console.log(`${100 / e.target.width * e.offsetX}/${100 / e.target.height * e.offsetY}`);console.log(e);}
    document.querySelector(".getJson").onclick = () => GetJson($img) 
    document.querySelector(".saveDoor").onclick = () => SaveDoor()

    document.querySelector(".input").parentNode.removeChild(document.querySelector(".input"))
    document.querySelector(".gui").style.display = "block"
}

let DoorJson = {}
let Doors = []
let RoomJson = {}
function ClickHandler(e){
    const x = 100 / e.target.width * e.offsetX
    const y = 100 / e.target.height * e.offsetY

    if (!DoorJson.x && !DoorJson.y){
        DoorJson.x = x
        DoorJson.y = y
    } else if (!DoorJson.w && !DoorJson.h) {
        DoorJson.w = x - DoorJson.x
        DoorJson.h = y - DoorJson.y
    }

    DrowDoor(e)
}

function SaveDoor(){
    if (DoorIsValid(DoorJson)){
        
        DoorJson.room = document.querySelector(".room").value
        DoorJson.description = document.querySelector(".description").value
        DoorJson.color = document.querySelector(".color").value
        DoorJson.img = document.querySelector(".img").value
        DoorJson.opacity = document.querySelector(".opacity").value

        document.querySelector(".room").value = ""
        document.querySelector(".description").value = ""
        document.querySelector(".img").value = ""
        document.querySelector(".opacity").value = ""
        document.querySelector(".color").value = ""

        Doors.push(DoorJson)

        DoorJson = {}


        $door.onclick = undefined
        $door = undefined

        //message.ShowMessage("Door saved", 1000)
    }
}

function DoorIsValid(door){
    return (door.x, door.y, door.w, door.h)
}

function GetJson($img){
    if (document.querySelector(".jsonText") != null){
        window.location.reload()
    }

    SaveDoor()
    RoomJson.doors = Doors

    const $textJson = document.createElement("textarea")
    $textJson.className = "jsonText"
    $textJson.readOnly = true
    $textJson.cols = "10"
    $textJson.wrap = "hard"
    $textJson.value = JSON.stringify(RoomJson)

    $img.src = ""
    document.body.appendChild($textJson)
    document.querySelector(".getJson").innerText = "New"

    document.querySelector(".jsonText").select()
    document.execCommand("copy")
}

let $door
function DrowDoor(e){
    if (DoorJson == {} || DoorJson.w == undefined){
        $door = document.createElement("button")
        e.target.parentNode.appendChild($door)
        $door.classList.add("door")
        $door.onclick = e => {e.target.parentNode.removeChild(e.target); DoorJson = {}}
    }else{
        const door = DoorJson
        const img = e.target
        //console.log(img.width)
        $door.style.left = `${img.width * (DoorJson.x / 100)}`
        $door.style.top = `${img.height * (DoorJson.y / 100)}`

        $door.style.height = img.height * (DoorJson.h / 100)
        $door.style.width = img.width * (DoorJson.w / 100)

        if (DoorJson.img){
            const $doorImg = document.createElement("img")
            if (door.img[0] === "."){
                $doorImg.src = "." + door.img
            }else{
                $doorImg.src = `../Rooms/${room}/${door.img}}`
            }
            $doorImg.className = "doorImg"
            $door.appendChild($doorImg)
        }
        
        if (door.opacity){
            $door.style.opacity = door.opacity
        }else{
            $door.style.opacity = 0.25
        }


        if (door.color){
            if (door.color === "none"){
                $door.style.backgroundColor = "rgba(0,0,0,0)"
            }else{
                $door.style.backgroundColor = door.color
            }
            
        }
    }

}