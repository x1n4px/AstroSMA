import React, { useState, useEffect } from "react";
import { YOUTUBE_API_KEY, YOUTUBE_CLIENT_ID } from "../config/api";

const SCOPES = "https://www.googleapis.com/auth/youtube.upload";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";

export default function UploadVideoToYouTube() {
    const [tokenClient, setTokenClient] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [videoId, setVideoId] = useState(null);

    useEffect(() => {
        // Check if required environment variables are available
        if (!YOUTUBE_API_KEY || !YOUTUBE_CLIENT_ID) {
            console.error("YouTube API configuration missing. Please check your .env file for REACT_APP_YOUTUBE_API_KEY and REACT_APP_YOUTUBE_CLIENT_ID");
            return;
        }

        // Only initialize Google API if the component is actually visible/used
        // This prevents unnecessary API calls and errors
        const loadGapiAndInit = async () => {
            try {
                // Check if scripts are already loaded to avoid duplicates
                if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
                    console.log("GAPI script already loaded, skipping initialization");
                    return;
                }

                const script = document.createElement("script");
                script.src = "https://apis.google.com/js/api.js";
                script.onload = () => {
                    try {
                        window.gapi.load("client", async () => {
                            try {
                                await window.gapi.client.init({
                                    apiKey: YOUTUBE_API_KEY,
                                    discoveryDocs: [DISCOVERY_DOC]
                                });
                                console.log("GAPI client initialized successfully");
                            } catch (error) {
                                console.error("Error initializing GAPI client:", error);
                            }
                        });
                    } catch (error) {
                        console.error("Error loading GAPI client:", error);
                    }
                };
                script.onerror = () => {
                    console.error("Failed to load GAPI script");
                };
                document.body.appendChild(script);

                // Check if GSI script is already loaded
                if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
                    console.log("GSI script already loaded, skipping initialization");
                    return;
                }

                const gisScript = document.createElement("script");
                gisScript.src = "https://accounts.google.com/gsi/client";
                gisScript.onload = () => {
                    try {
                        const client = window.google.accounts.oauth2.initTokenClient({
                            client_id: YOUTUBE_CLIENT_ID,
                            scope: SCOPES,
                            callback: tokenResponse => {
                                setAccessToken(tokenResponse.access_token);
                            }
                        });
                        setTokenClient(client);
                        console.log("Token client initialized successfully");
                    } catch (error) {
                        console.error("Error initializing token client:", error);
                    }
                };
                gisScript.onerror = () => {
                    console.error("Failed to load GSI script");
                };
                document.body.appendChild(gisScript);
            } catch (error) {
                console.error("Error in loadGapiAndInit:", error);
            }
        };

        // Add a small delay to prevent initialization conflicts
        const timeoutId = setTimeout(() => {
            loadGapiAndInit();
        }, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    const handleSignIn = () => {
        if (tokenClient) tokenClient.requestAccessToken();
    };

    const handleFileChange = e => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const uploadVideo = async () => {
        if (!accessToken || !file) return;

        setUploading(true);

        const metadata = {
            snippet: {
                title: file.name,
                description: "Uploaded from the SMA Workflows App",
                categoryId: "28", // Category ID for "Science & Technology"
                tags: ["sma", "sociedad malagueña de astronomía", "meteor", "astronomy", "science", "space", "research"]
            },
            status: {
                privacyStatus: "private"
            }
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("video", file);

        try {
            const res = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: form
            });

            const data = await res.json();
            if (data.id) {
                setVideoId(data.id);
            } else {
                alert("Upload failed. See console for details.");
                console.error(data);
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Error uploading video.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-video-to-youtube-component">
            {!accessToken ? (
                <button onClick={handleSignIn}>Sign in with Google</button>
            ) : (
                <>
                    <input type="file" accept="video/*" onChange={handleFileChange} />
                    <br />
                    {file && !uploading && <button onClick={uploadVideo}>Upload "{file.name}"</button>}
                    {uploading && <p>Uploading...</p>}
                    {videoId && (
                        <p>
                            Uploaded!{" "}
                            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
                                Watch on YouTube
                            </a>
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
