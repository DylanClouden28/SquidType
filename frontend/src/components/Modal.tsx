import React, { useState } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

import LiterallyHim from '../assets/LiterallyHim.jpg'
import squid1 from '../assets/squid1.jpg'
import squid2 from '../assets/squid2.jpg'
import squid3 from '../assets/squid3.jpg'
import squid4 from '../assets/squid4.jpg'
import squid5 from '../assets/squid5.jpg'

import CropTool from './Cropper'

interface ModalProps{
    cropData: any;
    setCropData: any;
    finalImage: any;
    setFinalImage: any;
  }

const Modal: React.FC<ModalProps> = ({cropData, setCropData, setFinalImage, finalImage}) => {
    const [image, setImage] = useState();
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
                        <div className="grid grid-cols-3 gap-y-4">
                            <img className='btn h-fit w-fit' src={squid1} onClick={() => setImage(squid1)}></img>
                            <img className='btn h-fit w-fit' src={squid2} onClick={() => setImage(squid2)}></img>
                            <img className='btn h-fit w-fit' src={squid3} onClick={() => setImage(squid3)}></img>
                            <img className='btn h-fit w-fit' src={squid4} onClick={() => setImage(squid4)}></img>
                            <img className='btn h-fit w-fit' src={squid5} onClick={() => setImage(squid5)}></img>
                            <img className='btn h-fit w-fit' src={LiterallyHim} onClick={() => setImage(LiterallyHim)}></img>
                        </div>
                        <h3 className="font-bold text-lg">OR:</h3>
                        <div className='text-md font-semibold'>
                            Upload Image:
                        </div>
                        {/* <input type="file" onChange={handleFileUpload} /> */}
                        <CropTool cropData={cropData} setCropData={setCropData} setFinalImage={setFinalImage} finalImage={finalImage} image={image} setImage={setImage}/>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
        </div>
    )
}

export default Modal