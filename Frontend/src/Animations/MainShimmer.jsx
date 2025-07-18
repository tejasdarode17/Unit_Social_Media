export const MainShimmer = () => {
    return (
        <div className="w-[40%] mx-auto">
            <div className="w-full flex flex-col gap-5 p-5 my-5">
                {Array(10).fill(0).map((_, i) => (
                    <div
                        key={i}
                        className="h-60 rounded-2xl bg-gray-300 myAnimation"
                    ></div>
                ))}
            </div>
        </div>
    );
};



