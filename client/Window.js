'use strict'

const { BrowserWindow } = require('electron')

class Window extends BrowserWindow {
  constructor({ file, defaultProps, ...windowSettings }) {
    super({ ...defaultProps, ...windowSettings })

    this.loadFile(file)
    this.webContents.openDevTools()

    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

module.exports = Window