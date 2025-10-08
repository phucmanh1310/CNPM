// hooks/useGetCurrentUser.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverURL } from "../App";
import { setShopsInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
    const dispatch = useDispatch();
    const { currentCity } = useSelector(state => state.user);
    useEffect(() => {
        const fetchShops = async () => {
            try {
                const result = await axios.get(`${serverURL}/api/shop/get-by-city/${currentCity}`,
                    { withCredentials: true })
                dispatch(setShopsInMyCity(result.data))
                console.log(result.data)
            } catch (error) {
                console.log("No current shop session" + { error });
            }
        }
        fetchShops();
    }, [currentCity, dispatch]);
}

export default useGetShopByCity;
