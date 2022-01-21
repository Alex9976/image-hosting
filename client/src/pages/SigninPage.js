import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from "../AppContext";

export const SigninPage = () => {
    const authContext = useContext(AppContext)

    const [form, setForm] = useState({
        login: '',
        password: ''
    })
    const [errorMessage, setErrorMessage] = useState('')

    const changeHandler = event => {
        setErrorMessage('')
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const signinHandler = async () => {
        setErrorMessage('')
        if (form.login === '' || form.password === '') {
            setErrorMessage('All fields must be filled')
        }
        else {
            authContext.signIn(form.login, form.password)
        }
    }

    useEffect(() => {
        authContext.socket.on('sign_in_result', (data) => {
            if (data.error) {
                setErrorMessage(data.error)
            }
            else {
                console.log('need to redirect')
            }
        })

    }, [authContext.socket])

    return (
        <div className="row" style={{ paddingTop: '64px' }}>
            <div className="col s6 offset-s3">
                <h2 style={{ textAlign: 'center', userSelect: 'none' }}>Sign In</h2>
                <div className="card" style={{ backgroundColor: '#202020' }}>
                    <div className="card-content white-text">
                        <div style={{ marginTop: 30 }}>
                            <label htmlFor="login" style={{ userSelect: 'none', color: 'white', fontSize: '120%' }}>Login</label>
                            <div className="input-field">
                                <input id="login" style={{ color: 'white' }} type="text" name="login" value={form.login} onChange={changeHandler} />
                            </div>
                            <label htmlFor="password" style={{ userSelect: 'none', color: 'white', fontSize: '120%' }}>Password</label>
                            <div className="input-field">
                                <input id="password" style={{ color: 'white' }} type="password" name="password" value={form.password} onChange={changeHandler} />
                            </div>
                        </div>
                        <label style={{ userSelect: 'none', color: 'red', fontSize: '100%' }}>{errorMessage}</label>
                    </div>
                    <div className="card-action">
                        <button className="btn" style={{ marginRight: 10, background: '#FF9F5E', color: 'black' }} onClick={signinHandler} disabled={authContext.isLoading}>
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div >
    )
}