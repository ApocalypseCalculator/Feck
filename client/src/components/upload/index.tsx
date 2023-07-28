import * as React from "react";
import * as axios from "axios";
import { SessionContext } from "../../util/session";
import { InfoContext } from "../../util/info";

import Uppy from '@uppy/core'
import Tus from "@uppy/tus";
import { Dashboard } from '@uppy/react'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

import "./index.scss";

export const Upload = () => {
    const info = React.useContext(InfoContext);

    return (
        <div className={"upload"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files Upload</h1>
                    <p>Choose a file below and upload it.</p>
                    <p>Anonymous uploaders are limited to {formatSize(info.filelimit.anon)}, registered users can upload up to {formatSize(info.filelimit.registered)}</p>
                </div>
            </div>
            <div className={"container"} id={"uploaddiv"}>
                <UploadContainer />
            </div>
        </div>
    )
}

function UploadContainer(props: any) {
    const session = React.useContext(SessionContext);
    const info = React.useContext(InfoContext);
    const [percentdone, setPercentdone] = React.useState(0);
    const [status, setStatus] = React.useState("form");
    const [fileid, setFileid] = React.useState("");
    enum UploadType {
        PUBLIC = "public",
        PRIVATE = "private",
        UNLISTED = "unlisted",
        UNKNOWN = ""
    }
    const [formdata, setFormdata] = React.useState({
        filename: "",
        type: UploadType.UNKNOWN //unknown means uninitialized = show form
    });
    const uppy = React.useMemo(() => {
        return new Uppy({ restrictions: { maxNumberOfFiles: 1, maxFileSize: 5 * 1024 * 1024 * 1024, minNumberOfFiles: 1 } })
            .use(Tus,
                {
                    endpoint: "/api/upload/create",
                    chunkSize: (function getChunkSize() {
                        // this a very :monke: method but whtv
                        if (session.ping <= 0) {
                            return 10 * 1024 * 1024
                        }
                        else if (session.ping < 30) {
                            return 200 * 1024 * 1024
                        }
                        else if (session.ping < 60) {
                            return 100 * 1024 * 1024
                        }
                        else if (session.ping < 100) {
                            return 50 * 1024 * 1024
                        }
                        else if (session.ping < 250) {
                            return 10 * 1024 * 1024
                        }
                        else {
                            return 5 * 1024 * 1024
                        }
                    })(),
                    retryDelays: [0, 3000, 5000, 10000, 20000],
                    // @ts-ignore
                    onBeforeRequest: function (req) {
                        if (session.token !== "") {
                            req.setHeader("Authorization", `${session.token}`);
                        }
                        if (req.getMethod() === "POST") {
                            setFormdata(oldformdata => {
                                req.setHeader('Base64-Meta', btoa(JSON.stringify(oldformdata)))
                                return oldformdata;
                            })
                        }
                        setFileid((oldfileid) => {
                            if (req.getMethod() === "PATCH" && oldfileid === "") {
                                axios.default.get(req.getURL()).then((res) => {
                                    if (res.data.fileid) {
                                        setFileid(res.data.fileid);
                                    }
                                });
                            }
                            return oldfileid;
                        })
                    },
                    onAfterResponse: function (req, res) {
                        if (req.getMethod() === "POST") {
                            let resobj = JSON.parse(res.getBody());
                            setFileid(resobj.fileid);
                        }
                    }
                });
    }, []);
    React.useEffect(() => {
        uppy.on('file-added', (file) => {
            setFormdata((oldformdata) => {
                return {
                    filename: file.name,
                    type: oldformdata.type
                }
            });
        });
        uppy.on('upload-success', () => {
            setStatus("success");
        });
        uppy.on('upload-error', (file) => {
            if (!isNaN(file?.size!) && file?.size! > (session.user.loggedin ? info.filelimit.registered : info.filelimit.anon)) {
                setStatus("toobig");
            }
            else {
                setStatus("failed");
            }
        });
        uppy.on('upload-progress', (file, record) => {
            setStatus((oldstatus) => {
                if (oldstatus == "form") {
                    return "uploading"
                } else return oldstatus
            });
            setPercentdone(Math.round(100 * record.bytesUploaded / record.bytesTotal));
        });
        return () => {
            if (uppy.getFiles().length == 1) {
                uppy.removeFile(uppy.getFiles()[0].id);
            }
            uppy.close({ reason: "unmount" });
        };
    }, [uppy]);
    if (status === "form") {
        return (
            <>
                {
                    formdata.type === UploadType.UNKNOWN ?
                        <form id={"upload"} onSubmit={(e) => {
                            e.preventDefault();
                            let fd = new FormData(e.target as HTMLFormElement);
                            setFormdata({
                                filename: "",
                                type: fd.get("type") as UploadType
                            })
                        }}>
                            <label htmlFor={"fileToUpload"}>Choose a file to upload:</label>
                            <label htmlFor={"type"}>Upload type: </label>
                            <select name={"type"} id={"type"}>
                                <option value={"public"} selected={true}>Public</option>
                                <option value={"unlisted"}>Unlisted</option>
                                {
                                    session.user.loggedin ? <option value={"private"}>Private</option> : <></>
                                }
                            </select>
                            <br></br>
                            <input className={"btn btn-info"} type={"submit"} value={"Choose File to Upload"} name={"submit"}></input>
                        </form> :
                        <Dashboard uppy={uppy} proudlyDisplayPoweredByUppy={false} />
                }
            </>
        );
    }
    else if (status === "uploading") {
        return (<>
            <div className={"alert alert-warning"}>
                <strong>Uploading...</strong> please wait...
            </div><br></br>
            <div id={"progress-wrp"}>
                <div className={"progress-bar"} style={{ width: `${percentdone}%` }}>
                </div>
                <div className={"status"}>{percentdone + "%"}</div>
            </div>
            <button type="button" className="btn btn-danger" onClick={() => {
                uppy.removeFile(uppy.getFiles()[0].id);
                setStatus("cancelled");
            }}>Cancel</button>
        </>)
    }
    else if (status === "toobig") {
        return (<div className={"alert alert-danger"}><strong>Size limit exceeded</strong> Anonymous uploaders are limited to {formatSize(info.filelimit.anon)}, registered users can upload up to {formatSize(info.filelimit.registered)}</div>);
    }
    else if (status === "failed") {
        return (<div className={"alert alert-danger"}><strong>Oops</strong> upload failed!</div>);
    }
    else if (status === "cancelled") {
        return (<div className={"alert alert-danger"}><strong>Cancelled</strong> The file upload was aborted</div>);
    }
    else if (status === "success") {
        return (<>
            <div className={"alert alert-success"} id={"successdiv"}>
                <strong>Success!</strong> Uploaded your file <b>{formdata.filename}</b> successfully.
            </div>
            <div className={"container"}>
                <p>You can access your uploaded file <a href={formdata.type === UploadType.PRIVATE ? `/download?fileid=${fileid}` : `/uploads/?fileid=${fileid}`} target={"_blank"} rel={"noopener noreferrer"}
                    id={"clicklink"}>here</a></p>
            </div></>);
    }
    else {
        return <></>
    }
}

function formatSize(number: number): string {
    if (number >= 1024 * 1024) {
        let mbSize = number / (1024 * 1024);
        return `${mbSize.toFixed(1)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "MB";
    }
    else if (number >= 1024) {
        let kbSize = number / (1024);
        return `${kbSize.toFixed(1)}KB`;
    }
    else {
        return `${number}B`;
    }
}
