import * as React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { Home } from "../home";
import { Downloads } from "../downloads";
import { Upload } from "../upload";
import { NotFound } from "../notfound";
import { Login } from "../login";
import { Register } from "../register";

export const _App = () => {
    const nav = useNavigate();

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
                </div>
            </nav>
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/downloads" element={<Downloads />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
}

export const App = () => {
    return (
        <BrowserRouter>
            <_App />
        </BrowserRouter>
    );
}