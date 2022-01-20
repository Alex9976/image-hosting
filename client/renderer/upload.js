const { ipcRenderer } = require('electron')

let file
let fileName

function upload() {
    const title = document.getElementById('title').value
    if (file)
        ipcRenderer.send('upload-image', title, fileName, file)

}

document.getElementById('file').addEventListener('change', function () {

    const reader = new FileReader();
    reader.onload = function () {
        const bytes = new Uint8Array(this.result);
        file = bytes
    };
    fileName = this.files[0].name
    reader.readAsArrayBuffer(this.files[0]);

}, false);