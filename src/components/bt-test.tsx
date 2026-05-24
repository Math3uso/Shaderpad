import { useEffect } from "react";

export function BtTest() {

    useEffect(() => {
        console.log("foi");
    })

    return (
        <button className="p-3 bg-red-300">
            teste
        </button>
    );
}