const { ipcRenderer } = require('electron')

function signUp() {
    const email = document.getElementById('email').value
    const login = document.getElementById('login').value
    const password = document.getElementById('password').value
    ipcRenderer.send('sign-up', { email, login, password })
}