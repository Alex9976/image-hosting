import React, { Fragment } from 'react'
import { useState, useEffect } from 'react'
import { AppContext } from "./context/AppContext"
import { getCookie, eraseCookie, setCookie } from './helpers/CookieAssistant'
import { useMessage } from "./hooks/message.hook"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { io } from "socket.io-client"
import { LoaderScreenCentered } from "./components/LoaderScreenCentered"
import { ImagesPage } from "./pages/ImagesPage"
import { NavBar } from "./components/NavBar"
import { UploadPage } from "./pages/UploadPage"
import { SigninPage } from './pages/SigninPage'
import { SignupPage } from './pages/SignupPage'
import { ImagePage } from './pages/ImagePage'
import { ProfilePage } from './pages/ProfilePage'

function App() {
    const [socket, setSocket] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isReady, setIsReady] = useState(false)

    const message = useMessage()

    const signUp = (email, login, password) => {
        let data = { email, login, password }
        socket.emit('sign_up', data)
    }

    const signIn = (login, password) => {
        let data = { login, password }
        socket.emit('sign_in', data)
    }

    const signOut = () => {
        eraseCookie('jwt')
        setIsAuthenticated(false)
    }

    useEffect(() => {
        if (!isReady) {
            const socket = io('')
            setSocket(socket)

            let jwt = getCookie('jwt')
            if (jwt != null) {
                let data = { jwt }
                socket.emit('restore_auth', data)
            } else {
                setIsReady(true)
            }
            socket.emit('get_images', '')

            socket.on('auth_result', (data) => {
                if (JSON.stringify(data)) {
                    let error = data.error
                    if (error) {
                        message(error)
                    } else {
                        let jwt = data.jwt
                        if (jwt) {
                            setCookie('jwt', jwt, 1.0 / 24.0)
                            setIsAuthenticated(true)
                        } else {
                            message('No jwt token received')
                        }
                    }
                } else {
                    message('Invalid auth_result data')
                }
                setIsReady(true)
            })
        }
    }, [isReady, message])

    return (
        <AppContext.Provider value={{
            isAuthenticated,
            isReady,
            signUp,
            signIn,
            signOut,
            socket
        }}>
            <Router>
                <Fragment>
                    <NavBar />
                    {isReady ?
                        <Routes>
                            <Route exact path='/' element={<ImagesPage />} />
                            <Route exact path='/upload' element={<UploadPage />} />
                            <Route exact path='/signin' element={<SigninPage />} />
                            <Route exact path='/signup' element={<SignupPage />} />
                            <Route exact path='/image' element={<ImagePage />} />
                            <Route exact path='/account' element={<ProfilePage />} />
                        </Routes>
                        :
                        <LoaderScreenCentered />
                    }
                </Fragment>
            </Router>
        </AppContext.Provider>
    )
}

export default App

