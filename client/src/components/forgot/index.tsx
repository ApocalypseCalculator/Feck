import * as React from "react";
import * as axios from "axios";
import { useNavigate } from "react-router-dom";

export const Forgot = () => {
    const nav = useNavigate();

    let [csrf, setCsrf] = React.useState("");
    let [username, setUsername] = React.useState("");
    let [pwd1, setPwd1] = React.useState("");
    let [pwd2, setPwd2] = React.useState("");
    let [registering, setRegistering] = React.useState(false);
    let [err, setErr] = React.useState("");
    let [recover, setRecover] = React.useState("");
    let [rec, setRec] = React.useState("");

    React.useEffect(() => {
        getCsrf();
    }, []);

    function getCsrf() {
        axios.default.post('/api/csrfgen').then((res) => {
            if (res.data.csrf) {
                setCsrf(res.data.csrf);
            }
        });
    }

    function register(ev: React.SyntheticEvent) {
        ev.preventDefault();
        setRegistering(true);
        if (!/^\w+$/.test(pwd1) || pwd1.length < 8) {
            setErr("New password can only contain alphanumeric characters or underscore and must be at least 8 characters");
            setRegistering(false);
        }
        else if (pwd1 !== pwd2) {
            setErr("New passwords do not match");
            setRegistering(false);
        }
        else {
            axios.default.post('/api/recover', {
                username: username,
                password: pwd1,
                recovery: recover
            }, {
                headers: {
                    "csrftoken": csrf
                }
            }).then(res => {
                if (res.data.recovery) {
                    setRec(res.data.recovery);
                }
                else {
                    setErr(res.data.error);
                    getCsrf();
                }
                setRegistering(false);
            }).catch(err => {
                setErr(err.response.data.error);
                getCsrf();
                setRegistering(false);
            });
        }
    }

    return (
        <div className={"register"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files</h1>
                    <p>Recover your account and reset your password</p>
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
                                <label htmlFor={"recovery"}>
                                    Account recovery code:
                                </label>
                                <input type={"text"} id={"recovery"} className={"form-control"} name={"recovery"} placeholder={"Enter recovery code"} onChange={text => {
                                    setRecover(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                <label htmlFor={"password"}>
                                    New password:
                                </label>
                                <input type={"password"} id={"password"} className={"form-control"} name={"password"} placeholder={"Enter your password"} onChange={text => {
                                    setPwd1(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                <label htmlFor={"repeatpwd"}>
                                    Confirm new password:
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
                            <button className={"btn btn-lg btn-primary btn-block text-uppercase"} disabled={registering} onClick={register}>Go</button>
                        </form>
                        :
                        <>
                            <div className={"alert alert-success"} id={"successdiv"}>
                                <strong>Success!</strong> Your password was reset successfully
                            </div>
                            <div className={"container"}>
                                <p>In case you lose your account password again, your recovery code is <b>{rec}</b>, please keep this code safe.</p>
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
