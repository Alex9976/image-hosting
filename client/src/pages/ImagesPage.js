import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from "../AppContext";
import { NavLink } from "react-router-dom";
import { LoaderScreenCentered } from "../components/LoaderScreenCentered";

export const ImagesPage = () => {
    const authContext = useContext(AppContext)

    const [isLoading, setIsLoading] = useState(true)
    const [images, setImages] = useState([])

    useEffect(() => {
        async function fetchImages() {
            authContext.socket.emit('get_images', '')

            authContext.socket.on('get_images_result', (data) => {
                setImages(data.images)
                setIsLoading(false)
            })
        }

        if (isLoading) {
            fetchImages()
        }
    }, [authContext.socket, isLoading])

    if (isLoading) {
        return (
            <LoaderScreenCentered />
        )
    }

    return (
        <div>
            <div className="image-collection">
                {
                    images.map(image => {
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


    )
}