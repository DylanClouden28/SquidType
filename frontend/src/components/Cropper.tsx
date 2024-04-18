import React, { useState, useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import "../App.css";

interface CropProps{
  cropData: any;
  setCropData: any;
  finalImage: any;
  setFinalImage: any;
}

export const CropTool: React.FC<CropProps> = ({cropData, setCropData, finalImage, setFinalImage}) => {
  const [image, setImage] = useState();
  const [isSelected, setSelected]= useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  

  const onChange = (e: any) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as any);
    };
    reader.readAsDataURL(files[0]);
  };

  const handleCropData = () => {
    setSelected(true);
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
    }
  }

  const clearCropData = () => {
    setSelected(false);
    setCropData("");
  }

  const getCropData = async () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
      const file = await fetch(cropperRef.current?.cropper.getCroppedCanvas().toDataURL())
        .then((res) => res.blob())
        .then((blob) => {
          return new File([blob], "newAvatar.png", { type: "image/png" });
        });

        const formData = new FormData();
        formData.append('image', file);
    
        try {
            const response = await fetch('http://localhost:8000/auth/upload', {
                method: 'POST',
                mode: 'cors',
                body: formData,
                headers: {
                    //headers
                },
                credentials: "include"
            });
            if (response.ok) {
                console.log('Uploaded successfully!');
            } else {
                console.error('Failed to upload: ', response.statusText);
            }
        } catch (error) {
            console.error('Error uploading: ', error);
        }
    }
  };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//         const response = await fetch('http://localhost:8000/public/images/', {
//             method: 'POST',
//             body: formData,
//             headers: {
//                 //headers
//             },
//         });
//         if (response.ok) {
//             console.log('Uploaded successfully!');
//         } else {
//             console.error('Failed to upload: ', response.statusText);
//         }
//     } catch (error) {
//         console.error('Error uploading: ', error);
//     }
// };

  return (
    <div>
      <div style={{ width: "100%" }}>
        <input type="file" onChange={onChange} />
        { image && cropperRef && !isSelected && <Cropper
          ref={cropperRef}
          style={{ height: 400, width: "100%" }}
          zoomTo={0.5}
          initialAspectRatio={1}
          aspectRatio={1}
          preview=".img-preview"
          src={image}
          viewMode={1}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          background={false}
          responsive={true}
          autoCropArea={1}
          checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
          guides={true}
        />}
      </div>

      {image && !cropData &&
            <div className=" mt-4 flex justify-center">
              <button className="btn btn-primary w-full" onClick={() => {handleCropData()}}>
                Crop Image
              </button>
            </div>
          }
      <div>

      {cropData && 
      <>
        <div className="box flex justify-center"> 
          <div className="avatar">
              <div className="rounded-full w-64 h-64">
              <img style={{ width: "100%" }} src={cropData} alt="cropped" />
              </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-neutral w-1/3" onClick={() => {clearCropData()}}>
          Change Crop
          </button>

          <button className="btn btn-primary w-2/3" onClick={() => {
            getCropData();
            setFinalImage(cropData);
            clearCropData();
            setImage(null);
            document.getElementById('my_modal_2').close();
          }}>
          Use Image
          </button>
        </div>
      </>
      }

      </div>
      <br style={{ clear: "both" }} />
    </div>
  );
};

export default CropTool;
