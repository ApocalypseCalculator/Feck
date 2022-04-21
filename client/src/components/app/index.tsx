import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "../home";
import { Downloads } from "../downloads";
import { Upload } from "../upload";
import { NotFound } from "../notfound";

export const _App = () => {
    return (
        <div className="page">
            <nav className={"navbar navbar-expand-lg navbar-dark bg-dark"}>
                <a className={"navbar-brand"} href={"/"}>Home</a>
                <button className={"navbar-toggler navbar-toggler-right"} type={"button"} data-toggle={"collapse"} data-target={"#navb"}>
                    <span className={"navbar-toggler-icon"}></span>
                </button>
                <div className={"collapse navbar-collapse"} id={"navb"}>
                    <ul className={"navbar-nav mr-auto"}>
                        <li className={"nav-item"}>
                            <a className={"nav-link"} href={"/downloads"}>Downloads</a>
                        </li>
                        <li className={"nav-item"}>
                            <a className={"nav-link"} href={"/upload"}>Upload A File</a>
                        </li>
                    </ul>
                </div>
            </nav>
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/downloads" element={<Downloads />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="*" element={<NotFound />} />
                    {/*<Route path="/" element={<Home />} />
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="/drawing/:page" element={<Drawing />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/settings" element={<Settings />} />
    <Route path="/link-submission" element={<XSSSubmission /> } />*/}
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