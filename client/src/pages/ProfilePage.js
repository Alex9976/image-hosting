import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from "../AppContext";
import { LoaderScreenCentered } from "../components/LoaderScreenCentered";
import { getCookie } from "../CookieAssistant";
import { NavLink } from "react-router-dom";
import { FcLike } from "react-icons/fc";
import { Loader } from "../components/Loader";

export const ProfilePage = () => {
    const authContext = useContext(AppContext)

    const [isLoadingUploaded, setIsLoadingUploaded] = useState(true)
    const [isLoadingLiked, setIsLoadingLiked] = useState(true)

    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [uploadedImages, setUploadedImages] = useState([])
    const [likedImages, setLikedImages] = useState([])

    const getUploadedImages = () => {
        setIsLoadingUploaded(true)

        let jwt = getCookie('jwt')
        authContext.socket.emit('get_uploaded_images', { jwt })

        authContext.socket.on('get_uploaded_images_result', (data) => {
            setUploadedImages(data.images)
            setIsLoadingUploaded(false)
        })
    }

    const getLikedImages = () => {
        setIsLoadingLiked(true)

        let jwt = getCookie('jwt')
        authContext.socket.emit('get_liked_images', { jwt })

        authContext.socket.on('get_liked_images_result', (data) => {
            setLikedImages(data.images)
            setIsLoadingLiked(false)
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
            {/* <h3 style={{ padding: '20px' }}>User: {user.email}</h3>
            <h2>My videos</h2> */}
            {/* {
                isLoadingUploaded
                    ? <div style={({ display: "flex", flexDirection: "row", justifyContent: "center" })}><Loader /></div>
                    : <div className="collection">
                        {
                            uploadedImages.map(video => {
                                return (
                                    <NavLink
                                        key={video._id}
                                        className="collection-item"
                                        to={`/watch?id=${video._id}`}
                                        onClick={(event) => video.isProcessing ? event.preventDefault() : null
                                        }
                                    >
                                        {video.title}
                                        {video.isProcessing ? ' (processing...)' : null}
                                        <div className="secondary-content row">
                                            <div className="col"><FcLike /></div>
                                            <div className="col">{video.likes.toString()}</div>
                                        </div>
                                    </NavLink>
                                )
                            })
                        }
                        <NavLink
                            key='length'
                            className="collection-item blue"
                            to={`#`}
                            onClick={(event) => event.preventDefault()}
                        >
                            Count: {uploadedImages.length}
                        </NavLink>
                    </div>
            }

            <h2>Liked</h2>
            {
                isLoadingLiked
                    ? <div style={({ display: "flex", flexDirection: "row", justifyContent: "center" })}><Loader /></div>
                    : <div className="collection">
                        {
                            likedImages.map(video => {
                                return (
                                    <NavLink
                                        key={video._id}
                                        className="collection-item"
                                        to={`/watch?id=${video._id}`}
                                        onClick={(event) => video.isProcessing ? event.preventDefault() : null
                                        }
                                    >
                                        {video.title}
                                        {video.isProcessing ? ' (processing...)' : null}
                                        <div className="secondary-content row">
                                            <div className="col"><FcLike /></div>
                                            <div className="col">{video.likes.toString()}</div>
                                        </div>
                                    </NavLink>
                                )
                            })
                        }
                        <NavLink
                            key='length'
                            className="collection-item blue"
                            to={`#`}
                            onClick={(event) => event.preventDefault()}
                        >
                            Count: {likedImages.length}
                        </NavLink>
                    </div>
            } */}
        </div>

    )
}