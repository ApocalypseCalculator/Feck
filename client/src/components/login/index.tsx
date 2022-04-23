import * as React from "react";
import * as axios from "axios";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../util/session";

import "./index.scss";

export const Login = () => {
    const nav = useNavigate();
    const session = React.useContext(SessionContext);

    let [csrf, setCsrf] = React.useState("");
    let [username, setUsername] = React.useState("");
    let [pwd, setPwd] = React.useState("");
    let [logging, setLogging] = React.useState(false);
    let [err, setErr] = React.useState("");

    function getCsrf() {
        axios.default.post('/api/csrfgen').then((res) => {
            if (res.data.csrf) {
                setCsrf(res.data.csrf);
            }
        });
    }

    React.useEffect(() => {
        document.body.style.backgroundColor = "#007bff";
        document.body.style.background = "linear-gradient(to right, #0062E6, #33AEFF)";
        getCsrf();
        return () => {
            document.body.style.backgroundColor = "";
            document.body.style.background = "";
        }
    }, []);

    function login(e: React.SyntheticEvent) {
        e.preventDefault();
        setLogging(true);
        axios.default.post('/api/login', {
            username: username,
            password: pwd
        }, {
            headers: {
                "csrftoken": csrf
            }
        }).then((res) => {
            if (res.data.token) {
                session.updateToken(res.data.token);
                nav("/");
            }
            else {
                setErr(res.data.error);
                setLogging(false);
                getCsrf();
            }
        }).catch(err => {
            setErr(err.response.data.error);
            setLogging(false);
            getCsrf();
        });
    }

    return (
        <div className={"login"}>
            <div className={"row"}>
                <div className={"col-sm-9 col-md-7 col-lg-5 mx-auto"}>
                    <div className={"card card-signin my-5"}>
                        <div className={"card-body"}>
                            <h5 className={"card-title text-center"}>Sign In</h5>
                            <form className={"form-signin"}>
                                <div className={"form-label-group loginformlblgrp"}>
                                    <input type={"username"} id="username" className={"form-control"} name={"username"}
                                        placeholder={"Username"} required={true} autoFocus={true} onChange={text => {
                                            setUsername(text.target.value);
                                        }}></input>
                                    <label htmlFor={"username"}>Username</label>
                                </div>
                                <div className={"form-label-group loginformlblgrp"}>
                                    <input type={"password"} id={"password"} className={"form-control"} name={"password"}
                                        placeholder={"Password"} required={true} onChange={text => {
                                            setPwd(text.target.value);
                                        }}></input>
                                    <label htmlFor={"password"}>Password</label>
                                </div>
                                <br></br>
                                {err !== "" ? <p style={{ textAlign: "center" }}>Error: {err}</p> : <></>}
                                <button className={"btn btn-lg btn-primary btn-block text-uppercase"} type={"submit"} disabled={logging} onClick={login}>Sign
                                    in</button>
                                <hr className={"my-4"}></hr>
                                <p style={{ textAlign: "center" }}>Don't have an account? <a href={"/login"} onClick={(ev) => {
                                    ev.preventDefault();
                                    nav("/register");
                                }}>Register</a> instead</p>
                                <p style={{ textAlign: "center" }}>Forgot your password? Reset it <a href={"/login"} onClick={(ev) => {
                                    ev.preventDefault();
                                    nav("/forgot");
                                }}>here</a></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
