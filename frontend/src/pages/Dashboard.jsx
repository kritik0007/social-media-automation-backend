import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard() {
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        const res = await API.get("/posts");
        setPosts(res.data.data);
    };

    const publishPost = async (id) => {
        await API.post(`/posts/${id}/publish`);
        fetchPosts();
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            {posts.map((p) => (
                <div key={p._id}>
                    <p>{p.content}</p>
                    <button onClick={() => publishPost(p._id)}>Publish</button>
                </div>
            ))}
        </div>
    );
}