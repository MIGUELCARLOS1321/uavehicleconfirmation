import React, { useState } from 'react';
import PocketBase from 'pocketbase';
import './YourComponent.css';
import UAvehicle from './UAvehicle.png';

const pb = new PocketBase('http://127.0.0.1:8090');

const collectionLabels = {
  '4wheelsinformation': '4 Wheels Information',
  'pickanddropinformation': 'Pick and Drop Information',
  'serviceinformation': 'Service Information',
  'For2WheelVehicle': 'For 2-Wheel Vehicle Information'
};

function LicenseLookup() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [stickerNumber, setStickerNumber] = useState('');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stickerWarning, setStickerWarning] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const collections = ['4wheelsinformation', 'pickanddropinformation', 'serviceinformation', 'For2WheelVehicle'];
      const requests = collections.map((collection) =>
        pb.collection(collection).getFullList({
          filter: `licenseNumber="${licenseNumber}"`,
        }).then(records => records.map(record => ({ ...record, collection })))
      );

      const results = await Promise.all(requests);
      const allRecords = results.flat().filter(record => record);

      if (allRecords.length > 0) {
        setInfo(allRecords[0]);
      } else {
        setError('No information found for the provided license number.');
        setInfo(null);
      }
    } catch (err) {
      setError('Error fetching data from the database.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setModalActive(true);
  };

  const closeModal = () => {
    setModalActive(false);
    setModalImage(null);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  };

  const handleConfirm = async () => {
    setStickerWarning('');
    if (info && stickerNumber >= '001' && stickerNumber <= '999') {
      try {
        const existingRecords = await pb.collection('confirmedInformation').getFullList({
          filter: `stickerNumber="${stickerNumber}"`,
        });

        if (existingRecords.length > 0) {
          setStickerWarning(`Sticker number ${stickerNumber} is already taken by another vehicle.`);
          return;
        }

        const confirmedData = {
          fullName: info.fullName || '',
          address: info.address || '',
          contactNumber: info.contactNumber || '',
          licenseNumber: info.licenseNumber || '',
          expiryDate: info.expiryDate || '',
          registeredOwner: info.registeredOwner || '',
          plateNumber: info.plateNumber || '',
          registrationNumber: info.registrationNumber || '',
          receiptNumber: info.receiptNumber || '',
          stickerNumber: stickerNumber,
          driverLicenseImage: `http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.driverLicenseImage}`,
          ltoRegistrationImage: `http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.ltoRegistrationImage}`,
          ltoReceiptImage: `http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.ltoReceiptImage}`,
          carImage: `http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.carImage}`
        };

        await pb.collection('confirmedInformation').create(confirmedData);
        alert('Information confirmed and saved successfully!');
      } catch (err) {
        console.error('Error saving confirmed information:', err);
        alert(`Failed to save confirmed information: ${err.message}`);
      }
    } else {
      alert('Please enter a valid sticker number between 001 and 999.');
    }
  };

  return (
    <div className="lookup-container">
      <img src={UAvehicle} alt="UA Vehicle" className="top-image" />
      <div className="search-bar">
        <h1>UA Vehicle Confirmation</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="Enter License Number"
            required
          />
          <button type="submit">Search</button>
        </form>
        {error && <p className="error">{error}</p>}
        {isLoading && <p>Loading...</p>}
      </div>

      <div className="columns-container">
        <div className="left-column">
          {info && (
            <div className="info-display">
              <h2>Information Found:</h2>
              <p><b>Database Source:</b> {collectionLabels[info.collection]}</p>
              <p><b>Full Name:</b> {info.fullName}</p>
              <p><b>Student Number:</b> {info.studentNumber}</p>
              <p><b>Role:</b> {info.role}</p>
              <p><b>Address:</b> {info.address}</p>
              <p><b>Contact Number:</b> {info.contactNumber}</p>
              <p><b>License Number:</b> {info.licenseNumber}</p>
              <p><b>Expiry Date:</b> {info.expiryDate}</p>
              <p><b>Vehicle Brand:</b> {info.vehicleBrand}</p>
              <p><b>Vehicle Type:</b> {info.vehicleType}</p>
              <p><b>Vehicle Color:</b> {info.vehicleColor}</p>
              <p><b>Registered Owner:</b> {info.registeredOwner}</p>
              <p><b>Plate Number:</b> {info.plateNumber}</p>
              <p><b>Registration Number:</b> {info.registrationNumber}</p>
              <p><b>Receipt Number:</b> {info.receiptNumber}</p>
            </div>
          )}
        </div>

        <div className="right-column">
          {info && (
            <>
              {info.driverLicenseImage && (
                <div className="image-wrapper">
                  <img
                    src={`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.driverLicenseImage}`}
                    alt="Driver's License"
                    className="info-image"
                    onClick={() => openModal(`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.driverLicenseImage}`)}
                  />
                  <div className="image-label"><b>Driver's License</b></div>
                </div>
              )}
              {info.ltoRegistrationImage && (
                <div className="image-wrapper">
                  <img
                    src={`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.ltoRegistrationImage}`}
                    alt="LTO Registration"
                    className="info-image"
                    onClick={() => openModal(`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.ltoRegistrationImage}`)}
                  />
                  <div className="image-label"><b>LTO Registration</b></div>
                </div>
              )}
              {info.ltoReceiptImage && (
                <div className="image-wrapper">
                  <img
                    src={`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.ltoReceiptImage}`}
                    alt="LTO Receipt"
                    className="info-image"
                    onClick={() => openModal(`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.ltoReceiptImage}`)}
                  />
                  <div className="image-label"><b>LTO Receipt</b></div>
                </div>
              )}
              {info.carImage && (
                <div className="image-wrapper">
                  <img
                    src={`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.carImage}`}
                    alt="Car"
                    className="info-image"
                    onClick={() => openModal(`http://127.0.0.1:8090/api/files/${info.collection}/${info.id}/${info.carImage}`)}
                  />
                  <div className="image-label"><b>Car Image</b></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {info && (
        <>
          <input
            type="text"
            className="sticker-input"
            value={stickerNumber}
            onChange={(e) => setStickerNumber(e.target.value)}
            placeholder="Enter Sticker Number (001-999)"
            required
          />
          <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
          {stickerWarning && <p className="sticker-warning">{stickerWarning}</p>}
        </>
      )}

      {modalActive && (
        <div className="modal" onClick={handleOutsideClick}>
          <div className="modal-content">
            <img src={modalImage} alt="Modal" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default LicenseLookup;
