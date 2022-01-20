'use strict'

const { io } = require('socket.io-client')
const { session } = require('electron')

class Connection {
    constructor(url) {
        this.url = url
        this.socket = undefined
        this.isAuthenticated = false
        this.jwt = this.getCookie('jwt')
        this.connect()
    }

    connect() {
        this.socket = io(this.url)
        if (this.jwt != null) {
            let data = { jwt: this.jwt }
            socket.emit('restore_auth', data)
        }
    }

    send(message, data) {
        this.socket.emit(message, data)
    }

    setCookie(name, value, days) {
        // let expires = "";
        // if (days) {
        //     let date = new Date();
        //     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        //     expires = "; expires=" + date.toUTCString();
        // }
        // document.cookie = name + "=" + (value || "") + expires + "; path=/";
        const cookie = { url: 'http://localhost', name, value }
        session.defaultSession.cookies.set(cookie)
            .then(() => {
                // success
                this.getCookie('jwt')
            }, (error) => {
                console.error(error)
            })
    }

    getCookie(name) {
        // let nameEQ = name + "=";
        // let ca = document.cookie.split(';');
        // for (let i = 0; i < ca.length; i++) {
        //     let c = ca[i];
        //     while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        //     if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        // }
        // return null;
        session.defaultSession.cookies.get({})
            .then((cookies) => {
                console.log(cookies.find(x => x.name === name))
                return cookies
            }).catch((error) => {
                console.log(error)
                return null
            })
    }

    // eraseCookie(name) {
    //     document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // }
}

module.exports = Connection