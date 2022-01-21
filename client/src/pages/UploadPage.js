import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../AppContext";
import { Loader } from "../components/Loader";


export const UploadPage = () => {
    const authContext = useContext(AppContext)

    const [loading, setLoading] = useState(false);
    const [fileTitle, setFileTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = React.useRef()
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const changeTitleHandler = (event) => {
        setErrorMessage('')
        setSuccessMessage('')
        setFileTitle(event.target.value);
    };

    const changeFileHandler = (event) => {
        setErrorMessage('')
        setSuccessMessage('')
        setSelectedFile(event.target.files[0])
        setSelectedFileName(event.target.files[0].name);
    };

    const changeFileNameHandler = (event) => {
        setErrorMessage('')
        setSuccessMessage('')
        setSelectedFileName(event.target.value);
    }

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
            setSuccessMessage('Success')
            setFileTitle('')
            setSelectedFile(null)
            setSelectedFileName('');
            fileInputRef.current.value = ""
            setLoading(false)
        }).catch(() => {
            setErrorMessage('Error')
            authContext.signOut()
            setLoading(false)
        })
    }

    return (
        <div className="row" style={{ paddingTop: '64px' }}>
            <div className="col s6 offset-s3">
                <h2 style={{ textAlign: 'center', userSelect: 'none' }}>Upload Image</h2>
                {/* {loading ? <Loader /> : <div />} */}
                <div className="card" style={{ backgroundColor: '#202020' }}>
                    <form action="#" onSubmit={handleSubmit}>
                        <div className="card-content white-text">
                            <label htmlFor="title" style={{ userSelect: 'none', color: 'white', fontSize: '120%' }}>Title</label>
                            <div className="input-field">
                                <input style={{ color: 'white' }} id="title" type="text" name="title" autoComplete="off" value={fileTitle} onChange={changeTitleHandler} required />
                            </div>
                        </div>
                        <div className="card-content file-field input-field" style={{ marginTop: '-20px' }} >
                            <div className="btn" style={{ backgroundColor: '#FF9F5E' }}>
                                <i className="material-icons" style={{ backgroundColor: '#FF9F5E' }}>image</i>
                                <input style={{ color: 'white' }} id='file' type="file" accept="image/*" ref={fileInputRef} onChange={changeFileHandler} required />
                            </div>
                            <div className="file-path-wrapper">
                                <input className="file-path validate" style={{ color: 'white' }} type="text" value={selectedFileName} onChange={changeFileNameHandler} placeholder="Select file" />
                            </div>
                        </div>
                        <div className="card-content white-text" style={{ marginTop: '-50px' }}>
                            <label style={{ userSelect: 'none', color: 'red', fontSize: '100%' }}>{errorMessage}</label>
                            <label style={{ userSelect: 'none', color: 'lightgreen', fontSize: '100%' }}>{successMessage}</label>
                        </div>
                        <div className="card-action">
                            <button className="btn yellow darken-4" style={{ marginRight: 10 }} type="submit">Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}