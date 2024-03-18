"use client"
import { useFiefAuth } from '@fief/fief/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'


const Callback = () => {
    const fiefAuth = useFiefAuth();
    const router = useRouter();

    useEffect(() => {
        fiefAuth.authCallback(`http://localhost:3000/callback`).then(() => {
            router.push('/')
        });
    }, [fiefAuth]);

    return (
        ""
    );
};

export default Callback;
