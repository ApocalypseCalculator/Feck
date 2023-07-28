import * as React from 'react';
import jwt_decode from "jwt-decode";

import { test } from './speedtest';

export interface User {
    loggedin: boolean,
    username: string,
    userid: string,
    registertime: number
}

export interface Session {
    user: User,
    token: string,
    updateToken: (token: string) => void,
    ping: number
}

export const SessionContext = React.createContext<Session>({
    user: {
        loggedin: false,
        username: "",
        userid: "",
        registertime: 0
    },
    token: "",
    updateToken: (token: string) => { },
    ping: -1
});

export const SessionProvider = (props: { children: React.ReactNode }) => {
    let [token, setToken] = React.useState("");
    let [user, setUser] = React.useState({
        loggedin: false,
        username: "",
        userid: "",
        registertime: 0
    });
    let [ping, setPing] = React.useState(-1);
    function updateToken(token: string) {
        setToken(token);
        localStorage.setItem("token", token);
        if (token !== "") {
            let decoded: any = jwt_decode(token);
            setUser({
                loggedin: true,
                username: decoded.username,
                userid: decoded.userid,
                registertime: decoded.registertime
            });
        }
        else {
            setUser({
                loggedin: false,
                username: "",
                userid: "",
                registertime: 0
            })
        }
    }
    React.useEffect(() => {
        let storagetoken = localStorage.getItem("token");
        if (storagetoken) {
            updateToken(storagetoken);
        }
        test().then(val => {
            setPing(val);
        });
    }, []);
    return (
        <SessionContext.Provider value={{ user, token, updateToken, ping }}>
            {props.children}
        </SessionContext.Provider>
    )
}
