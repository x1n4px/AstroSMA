import React, { useState, useEffect } from "react";

const Photo = () => {
    const [preview, setPreview] = useState(null);

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        } else {
            alert("Please select a valid image file");
            setPreview(null);
        }
    };

    // Cleanup preview URL on unmount or when preview changes
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="photo-component">
            <input type="file" accept="image/*" onChange={handleFileChange} className="no-print" />
            {preview && <img src={preview} alt="Uploaded preview" className="exportable-content photo-image" style={{ maxWidth: "100%", maxHeight: 300, marginTop: 10 }} />}
        </div>
    );
};

export default Photo;
