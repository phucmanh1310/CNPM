import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
    setCurrentAddress,
    setCurrentCity,
    setCurrentState
} from "../redux/userSlice.js";

function useGetCity() {
    const dispatch = useDispatch();
    const apiKey = import.meta.env.VITE_GEOAPIKEY;

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const { data } = await axios.get(
                        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                    );

                    if (data?.results?.length) {
                        const loc = data.results[0];
                        const city = loc.city || loc.town || loc.county || "";
                        const state = loc.state || loc.region || "";
                        const address = loc.formatted || "";
                        dispatch(setCurrentCity(city));
                        dispatch(setCurrentState(state));
                        dispatch(setCurrentAddress(address));
                    }
                    // Nếu không có results thì không dispatch gì
                } catch (err) {
                    console.error("Error fetching location:", err);
                    // Không dispatch fallback
                }
            },
            (err) => {
                console.error("Error getting position:", err);
                // Không dispatch fallback
            }
        );
    }, [dispatch, apiKey]);
}

export default useGetCity;
