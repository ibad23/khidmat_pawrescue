'use client';
import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchMessage = async () => {
            const response = await axios.get('/api/hello');
            setMsg(response.data.message);
        };

        fetchMessage();
    }, []);

    return (
        <div>
    <div className="text-3xl font-bold underline">
        Home Page!
    </div>
    <div className="mt-4 text-xl">
        Message from API: {msg}
        </div>
    </div>
    );
};

export default Home;
