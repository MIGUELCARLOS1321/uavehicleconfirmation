import styles from "./Confirmation.module.css";
import UAlogo from "../UAlogo.png";
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { db } from '../firebase/firebase'; 
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Confirmation() {
    const [infoFound, setInfoFound] = useState(false);
    const [receiptNumber, setReceiptNumber] = useState('');
    const [documentData, setDocumentData] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // For image viewer
    const [stickerNumber, setStickerNumber] = useState(''); // State to store the sticker number input
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Control modal visibility
    const [editedDocumentData, setEditedDocumentData] = useState(documentData); // For storing edited data

    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setInfoFound(false);
        setDocumentData(null);

        const collections = [
            'parkingfourwheel',
            'parkingtwovehicle',
            'parkingservice',
            'pickndrop'
        ];

        try {
            let found = false;
            for (const collectionName of collections) {
                const q = query(collection(db, collectionName), where("receiptNumber", "==", receiptNumber));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    querySnapshot.forEach(doc => {
                        console.log("Found document with docuID:", doc.id);

                        setDocumentData({ 
                            ...doc.data(), 
                            type: collectionName, 
                            docuID: doc.id // Adding the document ID here
                        });
                    });
                    setInfoFound(true);
                    toast.success("Receipt number found!", { position: "top-right" });
                    found = true;
                    break;
                }
            }

            if (!found) {
                toast.error("No matching receipt number found.", { position: "top-right" });
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("An error occurred while fetching data.", { position: "top-right" });
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image); // Set the clicked image for viewing
    };

    const closeImageViewer = () => {
        setSelectedImage(null); // Close the viewer
    };

    const handleConfirm = async () => {
        if (!stickerNumber) {
            toast.error("Please assign a sticker number.", { position: "top-right" });
            return;
        }
    
        try {
            const q = query(collection(db, "confirmedData"), where("stickerNumber", "==", stickerNumber));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                toast.error("This sticker number is already assigned to another person.", { position: "top-right" });
                return;
            }
    
            const { docuID, type } = documentData;
    
            await setDoc(doc(db, "confirmedData", docuID), {
                ...documentData, 
                stickerNumber: stickerNumber, 
                type: type 
            });
    
            const docRef = doc(db, type, docuID);
            await deleteDoc(docRef);
    
            toast.success("Document confirmed and sticker number assigned!", { position: "top-right" });
    
            setDocumentData(null);
            setStickerNumber('');
            setInfoFound(false);
        } catch (err) {
            console.error("Error confirming data:", err);
            toast.error("An error occurred while confirming the data.", { position: "top-right" });
        }
    };

    const handleEditClick = () => {
        // Only open the modal if documentData is not null
        if (documentData) {
            setEditedDocumentData({ ...documentData }); // Ensure that editedDocumentData is initialized
            setIsEditModalOpen(true); // Open the modal
        }
    };
    

    const handleModalClose = () => {
        setIsEditModalOpen(false); // Close the modal
        setEditedDocumentData(documentData); // Reset the edited data to the original document
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDocumentData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveChanges = async () => {
        try {
            const { docuID, type } = documentData;
            // Save the changes to Firestore
            await setDoc(doc(db, type, docuID), editedDocumentData); 
    
            // After saving, update the documentData state with the new edited data
            setDocumentData(prevData => ({
                ...prevData,
                ...editedDocumentData, // Spread to keep existing data and update the edited ones
            }));
    
            toast.success("Document updated successfully!", { position: "top-right" });
            handleModalClose(); // Close the modal after saving
        } catch (err) {
            console.error("Error saving changes:", err);
            toast.error("An error occurred while saving the changes.", { position: "top-right" });
        }
    };

    const handleSearchNav = () => {
        navigate("/search");
    };

    return (
        <>
            <ToastContainer />
            <div className={styles.container}>
                <div className={styles.mainCard}>
                    <div className={styles.navSearch} onClick={handleSearchNav}>Search</div>
                    <div className={styles.leftCard}>
                        <img src={UAlogo} alt="UA Logo" className={styles.ualogo} />
                        <div className={styles.logoTitle}>UAVEHICLE</div>
                        <div className={styles.admin}>ADMIN</div>
                    </div>
                    <div className={styles.rightCard}>
                        <form className={styles.searchHolder} onSubmit={handleSearch}>
                            <input
                                type="search"
                                value={receiptNumber}
                                onChange={(e) => setReceiptNumber(e.target.value)}
                                placeholder="Enter Payment Receipt Number for Confirmation"
                                className={styles.inputBar}
                            />
                            <button type="submit" className={styles.checkButton}>Check</button>
                        </form>
                        <div className={styles.detailsHolder}>
                            {infoFound && documentData && (
                                <>
                                    <div className={styles.infoHolder}>
                                        <div className={styles.details} style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "1rem" }}>Information Found:</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Type: {documentData.type}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Full Name: {documentData.fullName}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Address: {documentData.address}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Contact Number: {documentData.contactNumber}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>License Number: {documentData.licenseNumber}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Expiry Date: {documentData.expiryDate}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Registered Owner: {documentData.registeredOwner}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Plate Number: {documentData.plateNumber}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Payment Receipt Number: {documentData.receiptNumber}</div>
                                        <div className={styles.details} style={{ fontSize: "1rem" }}>Registration Number: {documentData.registrationNumber}</div>
                                        <input 
                                            type="text" 
                                            placeholder="Assign a sticker number" 
                                            className={styles.assignBar} 
                                            value={stickerNumber}
                                            onChange={(e) => setStickerNumber(e.target.value)} 
                                        />
                                    </div>
                                    <div className={styles.picturesHolder}>
                                        {documentData.driverLicenseImage && <img src={documentData.driverLicenseImage} alt="Driver's License" className={styles.imgCard} onClick={() => handleImageClick(documentData.driverLicenseImage)} />}
                                        {documentData.ltoRegistrationImage && <img src={documentData.ltoRegistrationImage} alt="LTO Registration" className={styles.imgCard} onClick={() => handleImageClick(documentData.ltoRegistrationImage)} />}
                                        {documentData.ltoReceiptImage && <img src={documentData.ltoReceiptImage} alt="LTO Receipt" className={styles.imgCard} onClick={() => handleImageClick(documentData.ltoReceiptImage)} />}
                                        {documentData.carImage && <img src={documentData.carImage} alt="Vehicle" className={styles.imgCard} onClick={() => handleImageClick(documentData.carImage)} />}
                                        {documentData.receiptImage && <img src={documentData.receiptImage} alt="Payment Receipt" className={styles.imgCard} onClick={() => handleImageClick(documentData.receiptImage)} />}
                                    </div>
                                    <div className={styles.infoFunction}>
                                        <div className={styles.confirmButton} onClick={handleConfirm}>Confirm</div>
                                        <div className={styles.editButton} onClick={handleEditClick}>Edit</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div className={styles.imageViewer} onClick={closeImageViewer}>
                    <div className={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Selected" className={styles.viewerImage} />
                        <button className={styles.closeButton} onClick={closeImageViewer}>Close</button>
                    </div>
                </div>
            )}

            {/* Modal for Editing */}
            {isEditModalOpen && (
                <div className={styles.editModalBackdrop} onClick={handleModalClose}>
                    <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Document</h2>
                        <form>
                            <div className={styles.modalField}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={editedDocumentData ? editedDocumentData.fullName || '' : ''} // Ensure there's a fallback value
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editedDocumentData ? editedDocumentData.address || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={editedDocumentData ? editedDocumentData.contactNumber || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>License Number</label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={editedDocumentData ? editedDocumentData.licenseNumber || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={editedDocumentData ? editedDocumentData.expiryDate || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Registered Owner</label>
                                <input
                                    type="text"
                                    name="registeredOwner"
                                    value={editedDocumentData ? editedDocumentData.registeredOwner || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Plate Number</label>
                                <input
                                    type="text"
                                    name="plateNumber"
                                    value={editedDocumentData ? editedDocumentData.plateNumber || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Payment Receipt Number</label>
                                <input
                                    type="text"
                                    name="receiptNumber"
                                    value={editedDocumentData ? editedDocumentData.receiptNumber || '' : ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={handleSaveChanges} className={styles.saveButton}>Save Changes</button>
                                <button type="button" onClick={handleModalClose} className={styles.cancelButton}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
