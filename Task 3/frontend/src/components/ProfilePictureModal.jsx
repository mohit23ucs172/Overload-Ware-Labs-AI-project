import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Slider } from '@mui/material';

export default function ProfilePictureModal({ isOpen, onClose, onSave, currentPicture }) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(currentPicture || '');

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setImage(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to the cropped size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          file: blob,
          url: URL.createObjectURL(blob),
          image: canvas.toDataURL('image/jpeg')
        });
      }, 'image/jpeg');
    });
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onSave(croppedImage);
    } catch (e) {
      console.error('Error cropping image', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        padding: '20px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>Update Profile Picture</h3>
        
        <div style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          background: '#0f3460',
          marginBottom: '20px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {image ? (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: '#0f3460'
                }
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '16px',
              textAlign: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              Select an image to crop
            </div>
          )}
        </div>

        {image && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#fff', marginBottom: '8px' }}>Zoom: {zoom.toFixed(2)}x</div>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e, zoom) => setZoom(zoom)}
              style={{
                color: '#7f5af0',
                padding: '15px 0'
              }}
            />
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '20px',
          gap: '10px'
        }}>
          <label style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#7f5af0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'background-color 0.3s',
            ':hover': {
              backgroundColor: '#6f4bd8'
            }
          }}>
            {image ? 'Change Image' : 'Select Image'}
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
          </label>
          
          <button
            onClick={handleSave}
            disabled={!image}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: image ? '#7f5af0' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: image ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.3s',
              ':hover': {
                backgroundColor: image ? '#6f4bd8' : '#555'
              }
            }}
          >
            Save
          </button>
          
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#2d3748',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              ':hover': {
                backgroundColor: '#4a5568'
              }
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
