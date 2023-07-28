import * as React from "react";
import * as axios from "axios";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../util/session";

export const Register = () => {
    const nav = useNavigate();
    const session = React.useContext(SessionContext);

    if(session.user.loggedin) {
        nav("/");
    }

    let [username, setUsername] = React.useState("");
    let [pwd1, setPwd1] = React.useState("");
    let [pwd2, setPwd2] = React.useState("");
    let [registering, setRegistering] = React.useState(false);
    let [err, setErr] = React.useState("");
    let [rec, setRec] = React.useState("");

    function register(ev: React.SyntheticEvent) {
        ev.preventDefault();
        setRegistering(true);
        if (!/^\w+$/.test(username) || username.length > 32) {
            setErr("Username can only contain alphanumeric characters or underscore and must be at most 32 characters");
            setRegistering(false);
        }
        else if (!/^\w+$/.test(pwd1) || pwd1.length < 8) {
            setErr("Password can only contain alphanumeric characters or underscore and must be at least 8 characters");
            setRegistering(false);
        }
        else if (pwd1 !== pwd2) {
            setErr("Passwords do not match");
            setRegistering(false);
        }
        else {
            axios.default.post('/api/register', {
                username: username,
                password: pwd1
            }).then(res => {
                if (res.data.recovery) {
                    setRec(res.data.recovery);
                }
                else {
                    setErr(res.data.error);
                }
                setRegistering(false);
            }).catch(err => {
                setErr(err.response.data.error);
                setRegistering(false);
            });
        }
    }

    return (
        <div className={"register"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files</h1>
                    <p>Register for an account to upload private files</p>
                </div>
            </div>
            <div className={"container"}>
                {
                    rec === "" ?
                        <form className={"form-signup"}>
                            <div className="form-label-group">
                                <label htmlFor={"username"}>
                                    Username:
                                </label>
                                <input type={"text"} id={"username"} className={"form-control"} name={"username"} placeholder={"Enter your username"} onChange={text => {
                                    setUsername(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                <label htmlFor={"password"}>
                                    Password:
                                </label>
                                <input type={"password"} id={"password"} className={"form-control"} name={"password"} placeholder={"Enter your password"} onChange={text => {
                                    setPwd1(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                <label htmlFor={"repeatpwd"}>
                                    Confirm password:
                                </label>
                                <input type={"password"} id={"repeatpwd"} className={"form-control"} name={"repeatpwd"} placeholder={"Confirm your password"} onChange={text => {
                                    setPwd2(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                {err !== "" ? <p style={{ textAlign: "center" }}>
                                    {"Error: " + err}
                                </p> : <></>}
                            </div>
                            <br></br>
                            <button className={"btn btn-lg btn-primary btn-block text-uppercase"} disabled={registering} onClick={register}>Register</button>
                            <p style={{ textAlign: "center" }}>Have an account? <a href={"/login"} onClick={(ev) => {
                                ev.preventDefault();
                                nav("/login");
                            }}>Log in</a> instead</p>
                        </form>
                        :
                        <>
                            <div className={"alert alert-success"} id={"successdiv"}>
                                <strong>Success!</strong> Your registration was successful
                            </div>
                            <div className={"container"}>
                                <p>In case you lose your account password, your recovery code is <b>{rec}</b>, please keep this code safe.</p>
                                <p style={{ textAlign: "center" }}><a href={"/login"} onClick={(ev) => {
                                    ev.preventDefault();
                                    nav("/login");
                                }}>Log in</a></p>
                            </div>
                        </>
                }
            </div>
        </div>
    )
}
