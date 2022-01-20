import React, { useState, useContext } from 'react'
import { AppContext } from "../AppContext";

export const SigninPage = () => {
    const authContext = useContext(AppContext)

    const [form, setForm] = useState({
        login: '',
        password: ''
    })

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const signinHandler = async () => {
        authContext.signIn(form.login, form.password)
    }

    return (
        <div className="row" style={{ paddingTop: '64px' }}>
            <div className="col s6 offset-s3">
                <h2 style={{ textAlign: 'center' }}>Sign In</h2>
                <div className="card blue-grey darken-1">
                    <div className="card-content white-text">
                        <div style={{ marginTop: 30 }}>
                            <label htmlFor="login">Login</label>
                            <div className="input-field">
                                <input id="login" type="text" name="login" value={form.login} onChange={changeHandler} />
                            </div>
                            <label htmlFor="password">Password</label>
                            <div className="input-field">
                                <input id="password" type="password" name="password" value={form.password} onChange={changeHandler} />
                            </div>
                        </div>
                    </div>
                    <div className="card-action">
                        <button className="btn yellow darken-4" style={{ marginRight: 10 }} onClick={signinHandler} disabled={authContext.isLoading}>
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}