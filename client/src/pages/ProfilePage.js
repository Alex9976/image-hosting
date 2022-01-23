import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from "../context/AppContext"
import { LoaderScreenCentered } from "../components/LoaderScreenCentered"
import { getCookie } from "../helpers/CookieAssistant"
import { NavLink } from "react-router-dom"

export const ProfilePage = () => {
    const authContext = useContext(AppContext)

    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [uploadedImages, setUploadedImages] = useState([])
    const [likedImages, setLikedImages] = useState([])

    const getUploadedImages = () => {

        let jwt = getCookie('jwt')
        authContext.socket.emit('get_uploaded_images', { jwt })

        authContext.socket.on('get_uploaded_images_result', (data) => {
            setUploadedImages(data.images)
        })
    }

    const getLikedImages = () => {

        let jwt = getCookie('jwt')
        authContext.socket.emit('get_liked_images', { jwt })

        authContext.socket.on('get_liked_images_result', (data) => {
            setLikedImages(data.images)
        })
    }

    useEffect(() => {
        async function fetchUser() {
            let jwt = getCookie('jwt')
            authContext.socket.emit('get_user', { jwt })

            authContext.socket.on('get_user_result', (data) => {
                setUser(data.user)
                setIsLoading(false)

                getUploadedImages()
                getLikedImages()
            })
        }

        if (isLoading) {
            fetchUser()
        }
    }, [authContext])

    if (isLoading) {
        return (<LoaderScreenCentered />)
    }

    return (
        <div style={{ marginTop: '64px' }}>
            <div style={{ textAlign: 'center', fontSize: '170%', marginTop: '80px' }}>User {user.login} ({user.email})</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ paddingRight: '10vw', width: '50vw', textAlign: 'right' }}>My images</h3><h3 style={{ paddingLeft: '10vw', width: '50vw', textAlign: 'left' }}>Liked</h3></div>
            <div className='user-collection'>
                <div className="user-image-collection" style={{ height: '75vh' }}>
                    {
                        uploadedImages.map(image => {
                            return (
                                <NavLink key={image._id} className="collection-item" to={`/image?id=${image._id}`}>
                                    <div className="hoverable">
                                        <div className="image-collection-item" style={{ backgroundImage: `url(/file/${image._id}` }}></div>
                                    </div>
                                </NavLink>
                            )
                        })
                    }
                </div>
                <div className="user-image-collection" style={{ justifyContent: 'flex-end', height: '75vh' }}>
                    {
                        likedImages.map(image => {
                            return (
                                <NavLink key={image._id} className="collection-item" to={`/image?id=${image._id}`}>
                                    <div className="hoverable">
                                        <div className="image-collection-item" style={{ backgroundImage: `url(/file/${image._id}` }}></div>
                                    </div>
                                </NavLink>
                            )
                        })
                    }
                </div>
            </div>
        </div>

    )
}