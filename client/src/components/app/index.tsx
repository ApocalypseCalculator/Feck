import * as React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { SessionProvider, SessionContext } from "../../util/session";
import { InfoProvider } from "../../util/info";

import { Home } from "../home";
import { Downloads } from "../downloads";
import { Upload } from "../upload";
import { NotFound } from "../notfound";
import { Login } from "../login";
import { Register } from "../register";
import { Forgot } from "../forgot";

import "./index.scss";

export const _App = () => {
    const nav = useNavigate();
    const session = React.useContext(SessionContext);

    return (
        <div className="page">
            <nav className={"navbar navbar-expand-lg navbar-dark bg-dark"}>
                <a className={"navbar-brand"} href={"/"} onClick={(ev) => {
                    ev.preventDefault();
                    nav("/");
                }}>Home</a>
                <button className={"navbar-toggler navbar-toggler-right"} type={"button"} data-toggle={"collapse"} data-target={"#navb"}>
                    <span className={"navbar-toggler-icon"}></span>
                </button>
                <div className={"collapse navbar-collapse"} id={"navb"}>
                    <ul className={"navbar-nav mr-auto"}>
                        <li className={"nav-item"}>
                            <a className={"nav-link"} href={"/downloads"} onClick={(ev) => {
                                ev.preventDefault();
                                nav("/downloads");
                            }}>Downloads</a>
                        </li>
                        <li className={"nav-item"}>
                            <a className={"nav-link"} href={"/upload"} onClick={(ev) => {
                                ev.preventDefault();
                                nav("/upload");
                            }}>Upload A File</a>
                        </li>
                    </ul>
                    <ul className={"navbar-nav ml-auto"}>
                        <li className={"nav-item"}>
                            <span id={"navbaruser"}>
                                {
                                    session.user.loggedin ? <>
                                        <a className={"nav-link dropdown-toggle"} href={"#"} data-toggle={"dropdown"}>
                                            Hello, <b>{session.user.username}</b>
                                        </a>
                                        <div className={"dropdown-menu dropdown-menu-right"}>
                                            <a className={"dropdown-item"} href={"#"} onClick={(ev) => {
                                                ev.preventDefault();
                                                session.updateToken("");
                                                window.location.reload();
                                            }}>Logout</a>
                                        </div>
                                    </> :
                                        <>
                                            <a href={"/login"} onClick={(ev) => {
                                                ev.preventDefault();
                                                nav("/login");
                                            }}>
                                                <b>Log in</b>
                                            </a>
                                            &nbsp;or&nbsp;
                                            <a href={"/register"} onClick={(ev) => {
                                                ev.preventDefault();
                                                nav("/register");
                                            }}>
                                                <b>Register</b>
                                            </a></>
                                }
                            </span>
                        </li>
                    </ul>
                </div>
            </nav>
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/downloads" element={<Downloads />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot" element={<Forgot />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
}

export const App = () => {
    return (
        <BrowserRouter>
            <InfoProvider>
                <SessionProvider>
                    <_App />
                </SessionProvider>
            </InfoProvider>
        </BrowserRouter>
    );
}