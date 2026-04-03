import { useState } from "react";
import API from "../api/axios";

export default function CreatePost() {
    const [content, setContent] = useState("");

    const handleCreate = async () => {
        try {
            await API.post("/posts", {
                content,
                platforms: ["instagram"],
            });
            alert("Post created");
        } catch (err) {
            alert("Error");
        }
    };

    return (
        <div>
            <h2>Create Post</h2>
            <textarea onChange={(e) => setContent(e.target.value)} />
            <button onClick={handleCreate}>Create</button>
        </div>
    );
}