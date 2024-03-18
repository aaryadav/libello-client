"use client"

import { FiefAuthProvider } from '@fief/fief/react';

const FiefW = ({ children }) => {
    return (
        <FiefAuthProvider
            baseURL="https://libello.fief.dev"
            clientId="94BlEaHQteI4EomEwqRNylDzFFWh-EXh6pmhNay_4bc"
        >
            {children}
        </FiefAuthProvider>
    )
}

export default FiefW;
