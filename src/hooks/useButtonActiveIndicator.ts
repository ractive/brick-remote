import {useEffect, useState} from "react";

export function useButtonActiveIndicator(): [boolean, () => void] {
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
        if (pressed) {
            setTimeout(() => setPressed(false), 175);
        }
    }, [pressed]);

    return [
        pressed,
        () => setPressed(true)
    ];
}
