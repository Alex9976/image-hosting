const { ipcRenderer } = require('electron')

function signIn() {
    const login = document.getElementById('login').value
    const password = document.getElementById('password').value
    ipcRenderer.send('sign-in', { login, password })
}