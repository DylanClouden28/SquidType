import React from 'react'

const Modal = ({ isModalOpen, onClose }) => {
    if (!isModalOpen){
        return null;
    }

    const handleClose = (i) => {
        if (i.target.id === 'outside'){
            onClose();
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
    
        try {
            const response = await fetch('http://localhost:8000/auth/images', {
                method: 'POST',
                body: formData,
                headers: {
                    //headers
                },
            });
            if (response.ok) {
                console.log('Uploaded successfully!');
            } else {
                console.error('Failed to upload: ', response.statusText);
            }
        } catch (error) {
            console.error('Error uploading: ', error);
        }
    };

    return(
        <div id="outside" className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center' onClick={handleClose} style={{zIndex: 1000}}>
            <div className='w-[600px] flex flex-col'>
                <button className='text-white text-xl place-self-end' onClick={() => onClose()}>X</button>
                <div className='bg-white p-2 rounded text-black'>
                    <div className='text-xl font-semibold'>
                        Upload Image:
                    </div>
                    <input type="file" onChange={handleFileUpload} />
                </div>
            </div>
        </div>
    )
}

export default Modal