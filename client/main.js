const path = require('path')
const url = require('url')
const { app, ipcMain } = require('electron')
const Window = require('./Window')
const Connection = require('./Connection')

const defaultProps = {
  width: 900,
  height: 600,
  show: false,
  title: 'Image Hosting Client',
  icon: path.join(__dirname, '/assets/img/image-icon.png'),
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    preload: path.join(__dirname, 'preload.js')
  }
}

function main() {
  let mainWindow = new Window({
    file: path.join('renderer', 'index.html'),
    defaultProps
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('authentication', false)
  })

  let socket = new Connection('http://localhost:5000')
  let signUpWindow
  let signInWindow
  let uploadWindow

  socket.socket.on('auth_result', (data) => {
    if (JSON.stringify(data)) {
      let error = data.error
      if (error) {
        console.log(error)
      } else {
        let jwt = data.jwt
        if (jwt) {
          socket.setCookie('jwt', jwt, 1.0 / 24.0)
          socket.isAuthenticated = true
          socket.jwt = jwt
          if (signUpWindow && signUpWindow !== null) {
            mainWindow.webContents.send('authentication', true)
            signUpWindow.close()
          }
          if (signInWindow && signInWindow !== null) {
            mainWindow.webContents.send('authentication', true)
            signInWindow.close()
          }
        } else {
          mainWindow.webContents.send('authentication', false)
          message('No jwt token received')
        }
      }
    } else {
      mainWindow.webContents.send('authentication', false)
      message('Invalid auth_result data')
    }
  })

  ipcMain.on('open-sign-up', () => {
    if (!signUpWindow) {
      signUpWindow = new Window({
        file: path.join('renderer', 'signup.html'),
        width: 400,
        height: 400,
        parent: mainWindow,
        icon: path.join(__dirname, '/assets/img/image-icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          preload: path.join(__dirname, 'preload.js')
        }
      })

      signUpWindow.on('closed', () => {
        signUpWindow = null
      })
    }
  })

  ipcMain.on('open-sign-in', () => {
    if (!signInWindow) {
      signInWindow = new Window({
        file: path.join('renderer', 'signin.html'),
        width: 400,
        height: 400,
        parent: mainWindow,
        icon: path.join(__dirname, '/assets/img/image-icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          preload: path.join(__dirname, 'preload.js')
        }
      })

      signInWindow.on('closed', () => {
        signInWindow = null
      })
    }
  })

  ipcMain.on('open-upload', () => {
    if (!uploadWindow) {
      uploadWindow = new Window({
        file: path.join('renderer', 'upload.html'),
        width: 400,
        height: 400,
        parent: mainWindow,
        icon: path.join(__dirname, '/assets/img/image-icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          preload: path.join(__dirname, 'preload.js')
        }
      })

      uploadWindow.on('closed', () => {
        uploadWindow = null
      })
    }
  })

  ipcMain.on('upload-image', (event, title, bytes) => {
    socket.send('upload_image', { jwt: socket.jwt, title, bytes })
    if (!uploadWindow) {
      uploadWindow.close()
    }
  })

  ipcMain.on('sign-up', (event, data) => {
    socket.send('sign_up', data)
  })

  ipcMain.on('sign-in', (event, data) => {
    socket.send('sign_in', data)
  })
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})