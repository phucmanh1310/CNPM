import React, { useRef, useState, useEffect } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";

function UserDashboard() {
    const { currentCity, shopsInMyCity, itemsInMyCity } = useSelector(
        (state) => state.user
    );

    const cateScrollRef = useRef();
    const shopScrollRef = useRef();
    // const itemScrollRef = useRef();

    const [showLeftCateButton, setShowLeftCateButton] = useState(false);
    const [showRightCateButton, setShowRightCateButton] = useState(false);
    const [showLeftShopButton, setShowLeftShopButton] = useState(false);
    const [showRightShopButton, setShowRightShopButton] = useState(false);
    // const [showLeftItemButton, setShowLeftItemButton] = useState(false);
    // const [showRightItemButton, setShowRightItemButton] = useState(false);

    const updateButton = (ref, setLeftButton, setRightButton) => {
        const element = ref.current;
        if (element) {
            setLeftButton(element.scrollLeft > 0);
            setRightButton(
                element.scrollLeft + element.clientWidth < element.scrollWidth
            );
        }
    };

    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -250 : 250,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const updateAllButtons = () => {
            updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
            updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
            // updateButton(itemScrollRef, setShowLeftItemButton, setShowRightItemButton);
        };

        updateAllButtons();

        const cateElement = cateScrollRef.current;
        const shopElement = shopScrollRef.current;
        // const itemElement = itemScrollRef.current;

        const handleCateScroll = () =>
            updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
        const handleShopScroll = () =>
            updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
        // const handleItemScroll = () =>
        //     updateButton(itemScrollRef, setShowLeftItemButton, setShowRightItemButton);

        cateElement?.addEventListener("scroll", handleCateScroll);
        shopElement?.addEventListener("scroll", handleShopScroll);
        // itemElement?.addEventListener("scroll", handleItemScroll);

        window.addEventListener("resize", updateAllButtons);

        // update lại khi ảnh load xong
        const timeout = setTimeout(updateAllButtons, 200);

        return () => {
            cateElement?.removeEventListener("scroll", handleCateScroll);
            shopElement?.removeEventListener("scroll", handleShopScroll);
            // itemElement?.removeEventListener("scroll", handleItemScroll);
            window.removeEventListener("resize", updateAllButtons);
            clearTimeout(timeout);
        };
    }, []);

    // helper truyền callback khi ảnh load xong
    const handleImageLoad = () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
        // updateButton(itemScrollRef, setShowLeftItemButton, setShowRightItemButton);
    };

    return (
        <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
            <Nav />

            {/* ==================== Categories Section ==================== */}
            <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
                <h1 className="text-gray-800 text-2xl sm:text-3xl">
                    Inspiration for your first order
                </h1>
                <div className="w-full relative">
                    {showLeftCateButton && (
                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
                            onClick={() => scrollHandler(cateScrollRef, "left")}
                        >
                            <FaCircleChevronLeft />
                        </button>
                    )}

                    <div
                        className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#00BFFF] scrollbar-track-transparent scroll-smooth"
                        ref={cateScrollRef}
                    >
                        {categories.map((cate, index) => (
                            <CategoryCard
                                name={cate.name}
                                image={cate.image}
                                key={index}
                                onImageLoad={handleImageLoad}
                            />
                        ))}
                    </div>

                    {showRightCateButton && (
                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
                            onClick={() => scrollHandler(cateScrollRef, "right")}
                        >
                            <FaCircleChevronRight />
                        </button>
                    )}
                </div>
            </div>

            {/* ==================== Shops Section ==================== */}
            <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
                <h1 className="text-gray-800 text-2xl sm:text-3xl">
                    Best Shop in {currentCity}
                </h1>
                <div className="w-full relative">
                    {showLeftShopButton && (
                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
                            onClick={() => scrollHandler(shopScrollRef, "left")}
                        >
                            <FaCircleChevronLeft />
                        </button>
                    )}

                    <div
                        className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#00BFFF] scrollbar-track-transparent scroll-smooth"
                        ref={shopScrollRef}
                    >
                        {shopsInMyCity?.map((shop, index) => (
                            <CategoryCard
                                name={shop.name}
                                image={shop.image}
                                key={index}
                                onImageLoad={handleImageLoad}
                            />
                        ))}
                    </div>

                    {showRightShopButton && (
                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
                            onClick={() => scrollHandler(shopScrollRef, "right")}
                        >
                            <FaCircleChevronRight />
                        </button>
                    )}
                </div>
            </div>

            {/* ==================== Food Items Section ==================== */}
            <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
                <h1 className="text-gray-800 text-2xl sm:text-3xl">
                    Suggested Food Items
                </h1>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    {itemsInMyCity?.map((item, index) => (
                        <FoodCard key={index} data={item} />
                    ))}
                </div>
            </div>

        </div>
    );
}

export default UserDashboard;
