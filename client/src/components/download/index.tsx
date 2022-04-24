import * as React from "react";
import * as axios from "axios";
import { SessionContext } from "../../util/session";
import { useNavigate } from "react-router-dom";

export const Download = () => {
    const nav = useNavigate();
    const session = React.useContext(SessionContext);
    let [percentdone, setPercentdone] = React.useState(0);
    let [status, setStatus] = React.useState("info");
    let [downloadurl, setDownloadurl] = React.useState("");
    let [downloadfile, setDownloadfile] = React.useState<any>({
        id: "",
        name: "Not found",
        date: 0,
        size: 0,
        type: "private"
    });
    const btnref = React.useRef(null);

    React.useEffect(() => {
        if (session.user.loggedin) {
            let fileid = new URLSearchParams(window.location.search).get("fileid");
            if (!fileid) {
                nav('/');
            }
            axios.default.get('/api/downloads?fileid=' + fileid, {
                headers: {
                    "authorization": session.token
                }
            }).then(res => {
                if (res.data.id) {
                    if (res.data.type === "private") {
                        setDownloadfile(res.data);
                    }
                    else {
                        window.location.href = "/uploads/?fileid=" + res.data.id;
                    }
                }
                else {
                    nav('/');
                }
            }).catch(err => {
                nav("/");
            })
        }
    }, [session.user.loggedin]);

    function download() {
        if (downloadfile.id !== "") {
            setStatus("downloading");
            axios.default.get('/uploads/?fileid=' + downloadfile.id, {
                headers: {
                    "authorization": session.token
                },
                responseType: "blob",
                onDownloadProgress: (progresse: ProgressEvent) => {
                    if (progresse.lengthComputable) {
                        setPercentdone(Math.ceil(100 * progresse.loaded / progresse.total));
                    }
                }
            }).then((res) => {
                let blob = new Blob([res.data]);
                let url = window.URL.createObjectURL(blob);
                setDownloadurl(url);
                setStatus("success");
            }).catch(err => {
                console.log(err);
                setStatus("failed");
            });
        }
    }

    return (
        <div className={"download"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files Download</h1>
                    <p>Download for private file</p>
                </div>
            </div>
            <div className={"container"} id={"downloaddiv"}>
                <DownloadContainer status={status} downloadurl={downloadurl} downloadfile={downloadfile} download={download} percentdone={percentdone} btnref={btnref} />
            </div>
        </div>
    )
}

function DownloadContainer(props: any) {
    if (props.status === "info") {
        return <table id={"myTable"}>
            <tr>
                <th>Name</th>
                <td>{props.downloadfile.name}</td>
            </tr>
            <tr>
                <th>Size</th>
                <td>{formatSize(props.downloadfile.size)}</td>
            </tr>
            <tr>
                <th>Upload Time</th>
                <td>{new Date(props.downloadfile.date).toLocaleString()}</td>
            </tr>
            <tr>
                <th>Download</th>
                <td>
                    <button type={"button"} className={"btn btn-primary"} onClick={(ev) => {
                        ev.preventDefault();
                        props.download();
                    }}>
                        <svg xmlns={"http://www.w3.org/2000/svg"} width={"16"} height={"16"} fill={"currentColor"} className={"bi bi-download"} viewBox={"0 0 16 16"}>
                            <path d={"M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"} />
                            <path d={"M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"} />
                        </svg> Download
                    </button>
                </td>
            </tr>
        </table>
    }
    else if (props.status === "downloading") {
        return (<><div className={"alert alert-warning"}>
            <strong>Downloading...</strong> please wait...
        </div><br></br>
            <div id={"progress-wrp"}><div className={"progress-bar"} style={{ width: `${props.percentdone}%` }}></div><div className={"status"}>{props.percentdone + "%"}</div></div></>)
    }
    else if (props.status === "failed") {
        return (<div className={"alert alert-danger"}><strong>Oops</strong> download failed</div>);
    }
    else if (props.status === "success") {
        return (<>
            <div className={"alert alert-success"} id={"successdiv"}>
                <strong>Success!</strong> Downloaded your file <b>{props.downloadfile.name}</b> successfully.
            </div>
            <div className={"container"}>
                <p>Save your downloaded file <a href={props.downloadurl} ref={props.btnref} download={props.downloadfile.name} target={"_blank"} rel={"noopener noreferrer"}
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
