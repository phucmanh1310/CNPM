import { useState, useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App";

function useGetShopDrones(shopId) {
    const [drones, setDrones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShopDrones = async () => {
        if (!shopId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.get(`${serverURL}/api/drone/getShopDrones/${shopId}`, {
                withCredentials: true
            });
            setDrones(data.drones || []);
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch shop drones");
            console.log("Error fetching shop drones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopDrones();
    }, [shopId]);

    return { drones, loading, error, refetch: fetchShopDrones };
}

export default useGetShopDrones;
