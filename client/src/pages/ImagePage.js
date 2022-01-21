import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../AppContext";
import { LoaderScreenCentered } from "../components/LoaderScreenCentered";
import { getCookie } from "../CookieAssistant";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { RiDeleteBinLine } from "react-icons/ri";

export const ImagePage = () => {

    const history = useNavigate();

    const query = new URLSearchParams(useLocation().search)

    const authContext = useContext(AppContext)

    const [likes, setLikes] = useState(-1)

    const [isLoading, setIsLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isAuth, setIsAuth] = useState(false)
    const [isCanDelete, setIsCanDelete] = useState(false)
    const [image, setImage] = useState(null)

    const deleteImage = () => {
        async function deleteAsync() {
            let jwt = getCookie('jwt')
            let id = image._id

            authContext.socket.emit('delete_image', { jwt, id })

            authContext.socket.on('delete_image_result', (data) => {
                history.push('/')
            })
        }

        if (!isDeleting) {
            setIsDeleting(true);
            deleteAsync()
        }
    }

    const likeImage = () => {
        async function likeAsync() {
            let jwt = getCookie('jwt')
            let id = image._id

            authContext.socket.emit('image_like', { jwt, id })

            authContext.socket.on('image_like_result', (data) => {
                setLikes(data.likes)
                setIsLiked(data.isLiked)
            })
        }

        setIsLiked(!isLiked)
        likeAsync()
    }

    useEffect(() => {
        async function fetchImage() {
            const imageId = query.get('id')
            let jwt = getCookie('jwt')

            authContext.socket.emit('get_image', { jwt, imageId })

            authContext.socket.on('get_image_result', (data) => {
                if (data.image) {
                    setLikes(data.image.likes)
                    setImage(data.image)
                    setIsLiked(data.isLiked)
                    setIsAuth(data.isAuth)
                    setIsCanDelete(data.isCanDelete)
                    setIsLoading(false)
                }
            })
        }

        if (isLoading) {
            fetchImage()
        }
    }, [query])

    if (isLoading || isDeleting || !image) {
        return (
            <LoaderScreenCentered />
        )
    }

    return (
        <div className='img-window'>
            <div>
                <div className="image-file" style={{ backgroundImage: `url(/file/${image._id}` }}>
                </div>
                <div className="image-info">
                    <div className='img-title'>{image.title}</div>
                    <div className='image-utils'>
                        <div className='util-item' style={{ cursor: 'pointer' }} onClick={(e) => { likeImage() }}>{(isLiked) ? <FcLike /> : <FcLikePlaceholder />}</div>
                        <div className='util-item' style={{ marginRight: '15px' }}>{likes.toString()}</div>
                        {(isCanDelete) ? <div className='util-item' style={{ cursor: 'pointer' }} onClick={(e) => { deleteImage() }}><RiDeleteBinLine /></div> : ''}
                    </div>
                </div>
            </div>
            <div className="left-bar">Comments</div>
        </div >
    )
}