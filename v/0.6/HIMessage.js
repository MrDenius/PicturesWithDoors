let $mess = document.createElement("div")

$mess.style = `
    position: absolute;
    margin: 10px;
    padding: 10px;
    background-color: gray;
    opacity: 0;
    top: 0px;
    left: 0px;
    display: none;
    border-style: inset;
    border-width: 4px;
    box-shadow: -4px -4px 13px 2px black;
    border-color: #a5a5a5;
`

// $mess.style.opacity = 1
// $mess.style.display = "block"
// $mess.innerHTML = "Text logs"

document.body.appendChild($mess)

export function ShowMessage(text, showMs = 5000){
    $mess.innerHTML = text.replace(/\n/g, "<br>")
    Opac(showMs)

}

function Opac(show = 5000){
    let i = 0
    $mess.style.display = "block"
    const interval = setInterval(() => {

        if (i <= 1000){
            $mess.style.opacity = i / 1000
        }else if (i <= 1000 + show){

        }else if (i <= 1000 + show + 1000){
            $mess.style.opacity = 1 - ((i - (1000 + show)) / 1000)
        }else{
            $mess.style.display = "none"
            clearInterval(interval)
        }

        i += 10
    }, 10)
}