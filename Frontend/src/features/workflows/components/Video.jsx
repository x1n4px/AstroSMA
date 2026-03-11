import React, { useState, useRef } from "react";

const Video = () => {
    const [videoSrc, setVideoSrc] = useState(null);
    const videoRef = useRef(null);

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate video formats (optional)
        const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
        if (!validTypes.includes(file.type)) {
            alert("Unsupported video format. Please upload mp4, webm, ogg, or mov files.");
            return;
        }

        const videoURL = URL.createObjectURL(file);
        setVideoSrc(videoURL);
    };

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleFileChange} style={{ marginBottom: "10px" }} className="no-print" />
            {videoSrc && (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    width="100%"
                    className="exportable-content video-player"
                    style={{ maxHeight: "400px", backgroundColor: "#000" }}
                />
            )}
        </div>
    );
};

export default Video;
