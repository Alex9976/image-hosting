const { ipcRenderer } = require('electron')

function openSignUp() {
    ipcRenderer.send('open-sign-up')
}

function openSignIn() {
    ipcRenderer.send('open-sign-in')
}

function openProfile() {
    ipcRenderer.send('open-profile')
}

function openUpload() {
    ipcRenderer.send('open-upload')
}

function logout() {
    ipcRenderer.send('logout')
}

ipcRenderer.on('authentication', (evt, message) => {
    const items = document.getElementById('items')
    if (message) {
        items.innerHTML = '<div class="item" onclick="openProfile()">Profile</div><div class="item" onclick="openUpload()">Upload</div><div class="item" onclick="logout()">Logout</div>'
    }
    else {
        items.innerHTML = '<div class="item" onclick="openSignIn()">Sign In</div><div class="item" onclick="openSignUp()">Sign Up</div>'
    }
})
