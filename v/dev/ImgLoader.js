class RoomImgLoader {
    constructor(roomId){
        this.roomId = roomId
    }

    GetImg(imgSettings, callback) {
        let imgSrc = `./Rooms/?room=${this.roomId}`
        if (imgSettings.tile && Number.isInteger(imgSettings.tile.x) && Number.isInteger(imgSettings.tile.y)){
            imgSrc += `&tile=${imgSettings.tile.x};${imgSettings.tile.y}`
        }
        if (imgSettings.q || imgSettings.quality){
            imgSrc += `&q=${imgSettings.q || imgSettings.quality}`
        }
        if (imgSettings.s || imgSettings.scale){
            imgSrc += `&scale=${imgSettings.s || imgSettings.scale}`
        }
        if (imgSettings.imgId){
            imgSrc += `&imgId=${imgSettings.imgId}`
        }


        const img = new Image()
        img.src = imgSrc

        let imgLoaded = false
        img.addEventListener("load", () => {
            callback(img, imgSettings)
        })
    }
}

class RoomLoader {
    canvas
    context
    isRoomLoading = false
    startAbort = false
    constructor(canvas, context){
        RoomLoader.canvas = canvas
        RoomLoader.context = context
    }

    LoadRoom(roomId, roomJson, onFullLoad, onLoad){
        if (this.isRoomLoading){
            this.AbortLoad(() => this.LoadRoom(roomId, roomJson, onLoad))//гдето баг. много онлоадов вызывается
        }

        this.isRoomLoading = true

        const resizeCanvas = (img) => {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.width * (img.height / img.width)
        }

        const drawRoom = (roomJson) => {
            const CheckAbort = () => {
                if (this.startAbort === true){
                    this.startAbort = false
                    this.isRoomLoading = false
                    if (this.onaborted)
                        this.onaborted()
                    return
                }
            }

            const IL = new RoomImgLoader(roomId)
            
            ImgLoader.GetImg({q: 25, s: "160p"}, (img) => {
                //подгон канваса под соотношение старон картинки
                resizeCanvas(img)

                context.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight)
                CheckAbort()

                //синхронная рисовка завершена

                //старт асинк дорисовки картинки в нормальном качестве
                const LoadFullImg = () => {
                    const tx = 5
                    const ty = 5
                    let tLoaded = 0
                    for (let y = 0; y <= ty; y++) {
                        for (let x = 0; x <= tx; x++) {
                            ImgLoader.GetImg({tile:{x: x, y:y}, q:85, s: `${720/ty}p`}, (img, imgSettings) => {
                                context.drawImage(img, canvas.width/tx*x, canvas.height/ty*y, canvas.clientWidth/tx, canvas.clientHeight/ty)
                                tLoaded++
                                if (tLoaded === tx*ty){
                                    if (onFullLoad)
                                        onFullLoad()
                                }
                            })
                            CheckAbort()
                        }
                    }

                }
                LoadFullImg()
                if (onLoad)
                    onLoad()
                

            })
        }


        if (!roomJson){
            $.getJSON(`./Rooms/${room}/room.json`, "",
                function (data, textStatus, jqXHR) {
                    drawRoom(data)
                })
        }else{
            drawRoom(roomJson)
        }
    }

    AbortLoad(onaborted){
        if (!this.isRoomLoading){
            return
        }

        this.onaborted = onaborted
        this.startAbort = true
    }

}