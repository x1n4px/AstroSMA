import React, { useState } from "react";
import "./YoutubeVideo.css";

const YouTubeVideo = () => {
    const [url, setUrl] = useState("");
    const [embedId, setEmbedId] = useState("");

    const extractVideoId = link => {
        try {
            const urlObj = new URL(link);

            // Handle youtu.be short links
            if (urlObj.hostname === "youtu.be") {
                return urlObj.pathname.slice(1);
            }

            // Handle standard YouTube URLs
            if (urlObj.hostname.includes("youtube.com")) {
                // Standard video
                const vParam = urlObj.searchParams.get("v");
                if (vParam) return vParam;

                // Shorts
                const shortsMatch = urlObj.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
                if (shortsMatch) return shortsMatch[1];
            }
        } catch (err) {
            return null;
        }

        return null;
    };

    const handleChange = e => {
        const inputUrl = e.target.value;
        setUrl(inputUrl);
        const id = extractVideoId(inputUrl);
        setEmbedId(id);
    };

    return (
        <div className="youtube-embed">
            <input
                type="text"
                placeholder="Paste YouTube link here"
                value={url}
                onChange={handleChange}
                className="youtube-url-input"
            />
            {embedId && (
                <div className="video-wrapper exportable-content video-embed no-print">
                    <iframe
                        src={`https://www.youtube.com/embed/${embedId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default YouTubeVideo;
