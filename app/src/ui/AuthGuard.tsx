import {FC, ReactNode, useEffect, useState} from 'react'
import Auth from './custom-components/Auth'

interface Props {
    children: ReactNode
}

const AuthGuard: FC<Props> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Check if the user is authenticated
    }, [])

    if (!isAuthenticated) {
        return <Auth onAuthenticated={() => setIsAuthenticated(true)} />
    }

    return <>{children}</>
}

export default AuthGuard;