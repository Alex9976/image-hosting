const { ipcRenderer } = require('electron')

let file

function upload() {
    const title = document.getElementById('title').value
    if (file)
        ipcRenderer.send('upload-image', title, file)

}

document.getElementById('file').addEventListener('change', function () {

    const reader = new FileReader();
    reader.onload = function () {
        const bytes = new Uint8Array(this.result);
        file = bytes
    };
    reader.readAsArrayBuffer(this.files[0]);

}, false);