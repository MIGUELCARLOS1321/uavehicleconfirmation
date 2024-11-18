import styles from "./SearchConfirmation.module.css";
import UAlogo from "../UAlogo.png";
import { useState } from 'react';
import { db } from '../firebase/firebase'; 
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

export default function SearchConfirmation() {
    const navigate = useNavigate();
    const [infoFound, setInfoFound] = useState(false);
    const [searchValue, setSearchValue] = useState(""); // To track the search input
    const [userData, setUserData] = useState(null); // To store the user data fetched from Firestore
    const [currentDocID, setCurrentDocID] = useState(null); // To store the document ID of the current user data
    const [isOnHold, setIsOnHold] = useState(false); // To track if the document is on hold
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // To control modal visibility
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [editedDocumentData, setEditedDocumentData] = useState(null); // To store edited data
    const [selectedImage, setSelectedImage] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        const q = query(collection(db, "confirmedData"), where("stickerNumber", "==", searchValue));
        
        try {
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                setInfoFound(true);
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    setUserData(data);
                    setCurrentDocID(doc.id); 
                    setIsOnHold(data.onHold || false); 
                });
            } else {
                toast.error("No matching data found.");
                setInfoFound(false);
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
            toast.error("An error occurred.");
        }
    };

    const handleHold = async () => {
        if (currentDocID && !isOnHold) {
            try {
                const docRef = doc(db, "confirmedData", currentDocID);
                await updateDoc(docRef, { onHold: true });
                setIsOnHold(true);
                toast.success("Document is now on hold.");
            } catch (error) {
                console.error("Error updating document: ", error);
                toast.error("Failed to put document on hold.");
            }
        }
    };

    const handleUnHold = async () => {
        if (currentDocID && isOnHold) {
            try {
                const docRef = doc(db, "confirmedData", currentDocID);
                await updateDoc(docRef, { onHold: false });
                setIsOnHold(false);
                toast.success("Document is no longer on hold.");
            } catch (error) {
                console.error("Error updating document: ", error);
                toast.error("Failed to unhold document.");
            }
        }
    };

    const handleEdit = () => {
        setEditedDocumentData(userData); // Set the current data for editing
        setIsEditModalOpen(true); // Open the edit modal
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false); // Close the modal without saving
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDocumentData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        if (editedDocumentData && currentDocID) {
            try {
                const docRef = doc(db, "confirmedData", currentDocID);
                await updateDoc(docRef, editedDocumentData); // Save the changes to Firestore
                setIsEditModalOpen(false); // Close the modal after saving
                toast.success("Document updated successfully.");
            } catch (error) {
                console.error("Error updating document: ", error);
                toast.error("Failed to save changes.");
            }
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image); // Set the clicked image for viewing
    };

    const closeImageViewer = () => {
        setSelectedImage(null); // Close the viewer
    };

    const handleReset = async () => {
        const collectionsToDelete = [
            "confirmedData",
            "parkingfourwheel",
            "parkingtwovehicle",
            "parkingservice",
            "pickndrop",
        ];
    
        try {
            // Delete all documents in the specified collections
            for (const collectionName of collectionsToDelete) {
                const collectionRef = collection(db, collectionName);
                const querySnapshot = await getDocs(collectionRef);
    
                // Delete each document in the collection
                const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
            }
    
            // Clear the 'registeredFor' field for all documents in the 'users' collection
            const usersCollectionRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollectionRef);
    
            const updatePromises = usersSnapshot.docs.map((doc) =>
                updateDoc(doc.ref, { registeredFor: "" }) // Clear the field
            );
    
            await Promise.all(updatePromises);
    
            toast.success("All collections have been reset and 'registeredFor' fields cleared.");
        } catch (error) {
            console.error("Error resetting collections or clearing 'registeredFor' field: ", error);
            toast.error("Failed to reset collections or clear 'registeredFor' fields.");
        }
    };
    

    return (
        <>
            <ToastContainer />
            <div className={styles.container}>
                <div className={styles.mainCard}>
                    <div className={styles.reset} onClick={() => setIsResetModalOpen(true)}>Reset</div>
                    <div className={styles.navSearch} onClick={() => navigate("/")}>Return</div>
                    <div className={styles.leftCard}>
                        <img src={UAlogo} alt="UA Logo" className={styles.ualogo} />
                        <div className={styles.logoTitle}>UAVEHICLE</div>
                        <div className={styles.admin}>ADMIN</div>
                    </div>
                    <div className={styles.rightCard}>
                        <form className={styles.searchHolder} onSubmit={handleSearch}>
                            <input
                                type="search"
                                placeholder="Enter a Sticker Number"
                                className={styles.inputBar}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)} 
                            />
                            <button type="submit" className={styles.checkButton}>Check</button>
                        </form>
                        <div className={styles.detailsHolder}>
                            {infoFound && (
                                <>
                                    {isOnHold ? (
                                        <div className={styles.infoHolder}>
                                            <div className={styles.details} style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "1rem" }}>
                                                Sticker is on hold
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.infoHolder}>
                                            <div className={styles.details} style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "1rem" }}>Sticker Number:</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Type: {userData?.type || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Full Name: {userData?.fullName || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Address: {userData?.address || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Contact Number: {userData?.contactNumber || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>License Number: {userData?.licenseNumber || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Expiry Date: {userData?.expiryDate || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Registered Owner: {userData?.registeredOwner || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Plate Number: {userData?.plateNumber || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Payment Receipt Number: {userData?.receiptNumber || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>Registration Number: {userData?.registrationNumber || "N/A"}</div>
                                            <div className={styles.details} style={{ fontSize: "1rem" }}>LTO Receipt Number: {userData?.ltoReceiptNumber || "N/A"}</div>
                                        </div>
                                    )}
                                    
                                    <div className={styles.picturesHolder}>
                                        <img src={userData?.driverLicenseImage || ''} alt="Driver's License" className={styles.imgCard} onClick={() => handleImageClick(userData?.driverLicenseImage)}/>
                                        <img src={userData?.ltoRegistrationImage || ''} alt="LTO Registration" className={styles.imgCard} onClick={() => handleImageClick(userData?.ltoRegistrationImage)}/>
                                        <img src={userData?.ltoReceiptImage || ''} alt="LTO Receipt" className={styles.imgCard} onClick={() => handleImageClick(userData?.ltoReceiptImage)}/>
                                        <img src={userData?.carImage || ''} alt="Vehicle" className={styles.imgCard} onClick={() => handleImageClick(userData?.carImage)}/>
                                        <img src={userData?.receiptImage || ''} alt="Payment Receipt" className={styles.imgCard} onClick={() => handleImageClick(userData?.receiptImage)}/>
                                    </div>
                                    
                                    <div className={styles.infoFunction}>
                                        <div 
                                            className={styles.holdButton} 
                                            onClick={isOnHold ? handleUnHold : handleHold}
                                        >
                                            {isOnHold ? "UnHold" : "Hold"}
                                        </div>
                                        <div 
                                            className={styles.editButton} 
                                            onClick={handleEdit}
                                        >
                                            Edit
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isResetModalOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsResetModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Warning</h3>
                        <p>
                            This is usually done at the end of the school year when another vehicle registration takes place. 
                            All vehicle information will be deleted and can no longer be retrieved. 
                            Are you sure you want to delete all vehicle information?
                        </p>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.confirmButton} 
                                onClick={() => {
                                    handleReset(); 
                                    setIsResetModalOpen(false); 
                                }}
                            >
                                Yes
                            </button>
                            <button 
                                className={styles.cancelButton} 
                                onClick={() => setIsResetModalOpen(false)}
                            >
                                Nevermind
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedImage && (
                <div className={styles.imageViewer} onClick={closeImageViewer}>
                    <div className={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Selected" className={styles.viewerImage} />
                        <button className={styles.closeButton} onClick={closeImageViewer}>Close</button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
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
                                    value={editedDocumentData ? editedDocumentData.fullName || '' : ''}
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
