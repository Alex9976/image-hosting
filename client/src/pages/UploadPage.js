import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../AppContext";
import { Loader } from "../components/Loader";
import { getCookie } from "../CookieAssistant";


export const UploadPage = () => {
    const authContext = useContext(AppContext)

    const [loading, setLoading] = useState(false);
    const [fileTitle, setFileTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = React.useRef();

    const changeTitleHandler = (event) => {
        setFileTitle(event.target.value);
    };

    const changeFileHandler = (event) => {
        // const reader = new FileReader();
        // reader.onload = function () {
        //     const bytes = new Uint8Array(this.result);
        //     setSelectedFile(bytes)
        // }
        // reader.readAsArrayBuffer(event.target.files[0]);
        setSelectedFile(event.target.files[0])
        setSelectedFileName(event.target.files[0].name);
    };

    const changeFileNameHandler = (event) => {
        setSelectedFileName(event.target.value);
    }

    // const handleSubmit = event => {
    //     event.preventDefault()
    //     const title = document.getElementById('title').value
    //     const jwt = getCookie('jwt')
    //     const file = selectedFile
    //     const fileName = selectedFileName
    //     console.log({ jwt, fileName, title, file })
    //     authContext.socket.emit('upload_image', { jwt, fileName, title, file })
    // }

    const handleSubmit = event => {
        event.preventDefault()

        const data = new FormData();
        data.append("title", fileTitle);
        data.append("image", selectedFile);

        setLoading(true)

        fetch('/api/upload', {
            method: 'POST',
            body: data
        }).then(() => {
            console.log('a')
            setFileTitle('')
            setSelectedFile(null)
            setSelectedFileName('');
            fileInputRef.current.value = ""
            setLoading(false)
        }).catch(() => {
            authContext.signOut()
            setLoading(false)
        })
    }

    return (
        <div className="row" style={{ paddingTop: '64px' }}>
            <div className="col s6 offset-s3">
                <h2 style={{ textAlign: 'center' }}>Upload image</h2>
                {loading ? <Loader /> : <div />}
                <div className="card blue-grey darken-1">
                    <form action="#" onSubmit={handleSubmit}>
                        <div className="card-content white-text">
                            <div className="input-field">
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    autoComplete="off"
                                    value={fileTitle}
                                    onChange={changeTitleHandler}
                                    required
                                />
                                <label htmlFor="title">Title</label>
                            </div>
                        </div>
                        <div className="card-content file-field input-field">
                            <div className="btn">
                                <span>File</span>
                                <input
                                    id='file'
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={changeFileHandler}
                                    required
                                />
                            </div>
                            <div className="file-path-wrapper">
                                <input
                                    className="file-path validate"
                                    type="text"
                                    value={selectedFileName}
                                    onChange={changeFileNameHandler}
                                    placeholder="Select file"
                                />
                            </div>
                        </div>
                        <div className="card-action">
                            <button
                                className="btn yellow darken-4"
                                style={{ marginRight: 10 }}
                                type="submit"
                            >
                                Upload
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}