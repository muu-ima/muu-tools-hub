// app/tools/profit-calc-uk/hooks/useTimeout.ts
"use client";

import { useState, useEffect } from "react";

/**
 * 指定ミリ秒後に true になるフラグを返すフック
 * 例) const timeoutReached = useTimeout(8000);
 */

export function useTimeout(ms: number) {
    const [reached, setReached] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() =>{
            setReached(true);
        }, ms);

        return () => {
            clearTimeout(id);
        };
    },[ms]);
    return reached;
}