import * as React from "react";
import * as axios from "axios";
import { SessionContext } from "../../util/session";

import "./index.scss";

export const Downloads = () => {
    const session = React.useContext(SessionContext);

    let [loaded, setLoaded] = React.useState(false);
    let [loadtext, setLoadtext] = React.useState("Loading...");
    let [files, setFiles] = React.useState<any[]>([]);
    let [search, setSearch] = React.useState("");
    let [pubview, setPubview] = React.useState((new URLSearchParams(window.location.search).get("view") !== "private"));
    let [deletingfile, setDeletingfile] = React.useState<any>({});

    React.useEffect(() => {
        axios.default.get('/api/downloads', {
            headers: {
                "authorization": session.token
            }
        }).then((res) => {
            if (res.data) {
                setFiles(res.data);
                setLoaded(true);
                setLoadtext("Loaded");
            }
        });
    }, [session.user.loggedin]);

    function updateSearch(event: any) {
        setSearch(event.target.value);
    }

    function openDeleteModal(file: any) {
        setDeletingfile(file);
        //@ts-ignore
        $("#deletemodal").modal('show');
    }

    function deleteFile(fileid: string) {
        axios.default.post('/api/delete', {
            fileid: fileid
        }, {
            headers: {
                "authorization": session.token
            }
        }).then((res) => {
            setFiles(files.filter(f => f.id !== fileid));
        });
        //@ts-ignore
        $("#deletemodal").modal('hide');
    }

    return (
        <div className={"downloads"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files Downloads</h1>
                    <p>Download files, all uploaded files will appear here</p>
                </div>
            </div>
            <div className={"container"}>
                <p>Here is a list of all the uploaded files. You can filter the results using the search bar</p>
            </div>
            {
                session.user.loggedin ? <div className={"container"}>
                    <ul className={"pagination"}>
                        <li className={"page-item" + (pubview ? " active" : "")}><a className={"page-link"} href={"#"} onClick={(ev) => {
                            ev.preventDefault();
                            setPubview(true);
                        }}>Public Files</a></li>
                        <li className={"page-item" + (!pubview ? " active" : "")}><a className={"page-link"} href={"#"} onClick={(ev) => {
                            ev.preventDefault();
                            setPubview(false);
                        }}>My Files</a></li>
                    </ul>
                    <p>Currently viewing {pubview ? "public files (excluding your public files)" : "your files"}</p>
                </div> : <></>
            }
            <div className={"container"}>
                <input type={"text"} id={"myInput"} placeholder={"Search for names.."} onInput={updateSearch}></input>
                <table id={"myTable"}>
                    <tr className={"header"}>
                        <th>Name</th>
                        {(pubview && session.user.loggedin) ? <th>Uploader</th> : <></>}
                        <th>Size</th>
                        <th>Upload Time</th>
                        <th>Download Links</th>
                    </tr>
                    {
                        !loaded ?
                            <tr id={"status"}>
                                <td>{loadtext}</td>
                            </tr>
                            :
                            <GenerateTable files={files} search={search} pubview={pubview} opendelete={openDeleteModal} />
                    }
                </table>
            </div>
            <FileModal file={deletingfile} delete={deleteFile} />
        </div>
    )
}

function GenerateTable(props: any) {
    let session = React.useContext(SessionContext);
    let table = props.files.map((file: any) => {
        if (props.search === "" || file.name.toLowerCase().indexOf(props.search.toLowerCase()) > -1) {
            if (!session.user.loggedin || (props.pubview && file.userid !== session.user.userid) || (!props.pubview && file.userid === session.user.userid)) {
                return (<>
                    <tr>
                        <td className="breakname">{file.name}</td>
                        {
                            props.pubview ?
                                (<td className="breakname">{
                                    file.userid ? file.user.username : ""
                                }</td>) : (<></>)
                        }
                        <td>{formatSize(parseInt(file.size))}</td>
                        <td>{new Date(file.date).toLocaleString()}</td>
                        <td>
                            <button className={"btn btn-info btn-sm"}>
                                <a href={`/uploads/?fileid=${file.id}`} style={{ color: 'azure' }} target={"_blank"} rel={"noopener noreferrer"}>Download</a>
                            </button>
                        </td>
                        {
                            !props.pubview ?
                                (<td>{
                                    <button type={"button"} className={"btn btn-outline-danger"} onClick={(ev) => {
                                        ev.preventDefault();
                                        props.opendelete(file);
                                    }}>
                                        <svg xmlns={"http://www.w3.org/2000/svg"} width={"16"} height={"16"} fill={"currentColor"} className={"bi bi-trash"} viewBox={"0 0 16 16"}>
                                            <path d={"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"} />
                                            <path fillRule={"evenodd"} d={"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"} />
                                        </svg>
                                    </button>
                                }</td>) : (<></>)
                        }
                    </tr>
                </>);
            }
        }
    });
    if (!table[0]) {
        return (<tr><td>No files to display</td></tr>);
    }
    else {
        return (<>{table}</>);
    }
}

function FileModal(props: any) {
    return (<div className={"modal fade"} id={"deletemodal"} role={"dialog"}>
        <div className={"modal-dialog modal-dialog-centered"} role={"document"}>
            <div className={"modal-content"}>
                <div className={"modal-header"}>
                    <h5 className={"modal-title"}>Delete File</h5>
                </div>
                <div className={"modal-body"}>
                    <p>You are about to delete your file: {props.file.name}</p>
                </div>
                <div className={"modal-footer"}>
                    <button type={"button"} className={"btn btn-secondary"} onClick={(ev) => {
                        ev.preventDefault();
                        //@ts-ignore
                        $("#deletemodal").modal('hide');
                    }}>Nevermind</button>
                    <button type={"button"} className={"btn btn-primary"} onClick={(ev) => {
                        ev.preventDefault();
                        props.delete(props.file.id);
                    }}>Do it!</button>
                </div>
            </div>
        </div>
    </div>)
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