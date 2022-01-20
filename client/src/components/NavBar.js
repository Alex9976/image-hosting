import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AppContext } from "../AppContext";

export const NavBar = () => {
    const authContext = useContext(AppContext)

    const logoutHandler = async (event) => {
        event.preventDefault()
        authContext.signOut()
    }

    const location = useLocation().pathname
    return (
        <nav style={{ position: 'fixed', left: '0', top: '0' }}>
            <div className="nav-wrapper" style={{ padding: '0 2rem', background: '#876191' }}>
                <span className="brand-logo"><NavLink to={'/'}><i className="material-icons">camera</i></NavLink></span>
                {(authContext.isAuthenticated)
                    ?
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li style={location === '/account' ? { background: '#FF9F5E' } : {}}><NavLink to={'/account'}><i className="material-icons">account_circle</i></NavLink></li>
                        <li style={location === '/upload' ? { background: '#FF9F5E' } : {}}><NavLink to={'/upload'}><i className="material-icons">upload</i></NavLink></li>
                        <li><a href='/' onClick={logoutHandler}><i className="material-icons">logout</i></a></li>
                    </ul>
                    :
                    location !== '/auth' ?
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            <li style={location === '/signin' ? { background: '#FF9F5E' } : {}}><NavLink to={'/signin'}><i className="material-icons">login</i></NavLink></li>
                            <li style={location === '/signup' ? { background: '#FF9F5E' } : {}}><NavLink to={'/signup'}><i className="material-icons"><span className="material-icons-outlined">
                                person_add
                            </span></i></NavLink></li>
                        </ul>
                        :
                        <div />
                }
            </div>
        </nav>
    )
}