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


        const img = new Image()
        img.src = imgSrc

        let imgLoaded = false
        img.addEventListener("load", () => {
            callback(img, imgSettings)
        })
    }
}