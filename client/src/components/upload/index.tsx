import * as React from "react";
import * as axios from "axios";

import "./index.scss";

export const Upload = () => {
    let [csrf, setCsrf] = React.useState("");
    let [percentdone, setPercentdone] = React.useState(0);
    let [status, setStatus] = React.useState("form");
    let [resdata, setResdata] = React.useState({});

    React.useEffect(() => {
        axios.default.post('/api/csrfgen').then((res) => {
            if (res.data.csrf) {
                setCsrf(res.data.csrf);
            }
        });
    }, []);

    function submitUpload(e: React.SyntheticEvent) {
        e.preventDefault();
        setStatus("uploading");
        let fd = new FormData(e.target as HTMLFormElement);
        axios.default.post('/api/upload', fd, {
            headers: {
                "csrftoken": csrf
            },
            onUploadProgress: (progresse: ProgressEvent) => {
                if (progresse.lengthComputable) {
                    setPercentdone(Math.ceil(100 * progresse.loaded / progresse.total));
                }
            }
        }).then((res) => {
            setResdata(res.data);
            if (res.data.error) {
                setStatus("error");
            }
            else {
                setStatus("success");
            }
        }).catch(err => {
            setStatus("failed");
        });
    }

    return (
        <div className={"upload"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files Upload</h1>
                    <p>Choose a file below and upload it.</p>
                </div>
            </div>
            <div className={"container"} id={"uploaddiv"}>
                <UploadContainer status={status} submitUpload={submitUpload} percentdone={percentdone} resdata={resdata} />
            </div>
        </div>
    )
}

function UploadContainer(props: any) {
    if (props.status === "form") {
        return (<form method={"POST"} encType={"multipart/form-data"} id={"upload"} onSubmit={props.submitUpload}>
            <input className={"form-control-file"} type={"file"} name={"fileToUpload"} id={"fileToUpload"} required={true}></input>
            <br></br>
            <input className={"btn btn-info"} type={"submit"} value={"Upload File"} name={"submit"}></input>
        </form>);
    }
    else if (props.status === "uploading") {
        return (<><div className={"alert alert-warning"}>
            <strong>Uploading...</strong> please wait...
        </div><br></br>
            <div id={"progress-wrp"}><div className={"progress-bar"} style={{ width: `${props.percentdone}%` }}></div><div className={"status"}>{props.percentdone + "%"}</div></div></>)
    }
    else if (props.status === "failed") {
        return (<div className={"alert alert-danger"}><strong>Oops</strong> upload failed!</div>);
    }
    else if (props.status === "error") {
        return (<div className={"alert alert-danger"}><strong>Error</strong> {props.resdata.error}</div>);
    }
    else if (props.status === "success") {
        return (<>
            <div className={"alert alert-success"} id={"successdiv"}>
                <strong>Success!</strong> Uploaded your file <b>{props.resdata.filename}</b> successfully.
            </div>
            <div className={"container"}>
                <p>You can access your uploaded file <a href={`/uploads/${props.resdata.fileid}/${props.resdata.filename}`} target={"_blank"} rel={"noopener noreferrer"}
                    id={"clicklink"}>here</a></p>
            </div></>);
    }
    else {
        return <></>
    }
}
//onsubmit="sendData();return false;"
