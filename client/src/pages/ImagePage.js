import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { LoaderScreenCentered } from "../components/LoaderScreenCentered"
import { getCookie } from "../helpers/CookieAssistant"
import { FcLike, FcLikePlaceholder } from "react-icons/fc"
import { RiDeleteBinLine } from "react-icons/ri"

export const ImagePage = () => {
    const authContext = useContext(AppContext)
    const history = useNavigate()
    const query = new URLSearchParams(useLocation().search)

    const [likes, setLikes] = useState(-1)
    const [isLoading, setIsLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [isAuth, setIsAuth] = useState(false)
    const [isCanDelete, setIsCanDelete] = useState(false)
    const [image, setImage] = useState(null)
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')

    const changeHandler = event => {
        setCommentText(event.target.value)
    }

    const sendHandler = async () => {
        if (commentText !== '') {
            let jwt = getCookie('jwt')
            let id = image._id
            authContext.socket.emit('add_comment', { jwt, id, commentText })
            setCommentText('')
        }
    }

    const deleteImage = () => {
        async function deleteAsync() {
            let jwt = getCookie('jwt')
            let id = image._id

            authContext.socket.emit('delete_image', { jwt, id })

            authContext.socket.on('delete_image_result', (data) => {
                history(-1)
            })
        }
        deleteAsync()
    }

    const deleteComment = (id) => {
        async function deleteAsync() {
            let jwt = getCookie('jwt')
            let imageId = image._id

            authContext.socket.emit('delete_comment', { jwt, id, imageId })
        }

        deleteAsync()

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
        let cleanupFunction = false;

        async function fetchImage() {
            const imageId = query.get('id')
            let jwt = getCookie('jwt')

            authContext.socket.emit('get_image', { jwt, imageId })

            authContext.socket.emit('get_image_comments', { jwt, imageId })

            authContext.socket.on('get_image_result', (data) => {
                if (data.image && !cleanupFunction) {
                    setLikes(data.image.likes)
                    setImage(data.image)
                    setIsLiked(data.isLiked)
                    setIsAuth(data.isAuth)
                    setIsCanDelete(data.isCanDelete)
                    setIsLoading(false)
                }
            })

            authContext.socket.on('get_comments_result', (data) => {
                setComments(data)
            })
        }

        if (isLoading) {
            fetchImage()
        }

        return () => cleanupFunction = true;
    }, [authContext.socket, isLoading, query])

    if (isLoading || !image) {
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
            <div className='left-bar'>
                <div>
                    <div style={{ textAlign: 'center', fontSize: '120%', userSelect: 'none', marginTop: '10px' }}>Comments</div>
                    <div className='comment-items'>
                        {
                            comments.map(comment => {
                                return (
                                    <div key={comment.comment._id} className='comment-item'>
                                        <div className='comment-info'>
                                            <div>{(comment.isYouComment) ? 'You' : comment.username}</div>
                                            {comment.isYouComment ? <div style={{ cursor: 'pointer', fontSize: '110%', marginTop: '3px' }} onClick={(e) => { deleteComment(comment.comment._id) }}><RiDeleteBinLine /></div> : ''}
                                        </div>
                                        <div>{comment.comment.text}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                {
                    (isAuth) ? <div className='add-comment-area'>
                        <div className="input-field" style={{ width: '80%' }}>
                            <input id="text" type="text" name="text" value={commentText} onChange={changeHandler} style={{ color: 'white' }} />
                        </div>
                        <a href="#!" onClick={sendHandler} className="waves-effect waves-circle waves-light btn-floating secondary-content"><i className="material-icons" style={{ margin: '-2px 2px' }}>send</i></a>
                    </div> : ''
                }
            </div>
        </div >
    )
}