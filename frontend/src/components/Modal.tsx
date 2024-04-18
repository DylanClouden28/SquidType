import React from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

import CropTool from './Cropper'

interface ModalProps{
    cropData: any;
    setCropData: any;
    finalImage: any;
    setFinalImage: any;
  }

const Modal: React.FC<ModalProps> = ({cropData, setCropData, setFinalImage, finalImage}) => {
    // if (!isModalOpen){
    //     return null;
    // }

    // const handleClose = (i) => {
    //     if (i.target.id === 'outside'){
    //         onClose();
    //     }
    // }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        //const formData = new FormData();
        //formData.append('image', file);
        //CropTool(file);
    
        // try {
        //     const response = await fetch('http://localhost:8000/public/images/', {
        //         method: 'POST',
        //         body: formData,
        //         headers: {
        //             //headers
        //         },
        //     });
        //     if (response.ok) {
        //         console.log('Uploaded successfully!');
        //     } else {
        //         console.error('Failed to upload: ', response.statusText);
        //     }
        // } catch (error) {
        //     console.error('Error uploading: ', error);
        // }
    };

    return(
        // <div id="outside" className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center' onClick={handleClose} style={{zIndex: 1000}}>
        //     <div className='w-[600px] flex flex-col'>
        //         <button className='text-white text-xl place-self-end' onClick={() => onClose()}>X</button>
        //         <div className='bg-white p-2 rounded text-black'>
        //             <div className='text-xl font-semibold'>
        //                 Upload Image:
        //             </div>
        //             <input type="file" onChange={handleFileUpload} />
        //         </div>
        //     </div>
        // </div>
        <div>
            <button className="btn btn-neutral mr-2" onClick={()=>document.getElementById('my_modal_2').showModal()}>Change Profile Picture</button>
                <dialog id="my_modal_2" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Change your profile picture below!</h3>
                        <div className='text-md font-semibold'>
                            Upload Image:
                        </div>
                        {/* <input type="file" onChange={handleFileUpload} /> */}
                        <CropTool cropData={cropData} setCropData={setCropData} setFinalImage={setFinalImage} finalImage={finalImage}/>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
        </div>
    )
}

export default Modal