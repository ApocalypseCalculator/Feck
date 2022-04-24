import * as axios from 'axios';
import * as React from 'react';

export interface Info {
    name: string,
    email: string,
    version: string,
    filelimit: {
        anon: number,
        registered: number
    }
}

export const InfoContext = React.createContext<Info>({
    name: "",
    email: "",
    version: "",
    filelimit: {
        anon: 0,
        registered: 0
    }
});

export const InfoProvider = (props: { children: React.ReactNode }) => {
    let [info, setInfo] = React.useState<Info>({
        name: "unknown",
        email: "someone@example.com",
        version: "0.0.0",
        filelimit: {
            anon: 0,
            registered: 0
        }
    });
    React.useEffect(() => {
        axios.default.get('/api/info').then(res => {
            setInfo(res.data as Info);
        }).catch(() => {});
    }, []);
    return (
        <InfoContext.Provider value={info}>
            {props.children}
        </InfoContext.Provider>
    )
}
