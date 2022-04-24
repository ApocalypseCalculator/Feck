import * as React from "react";
import * as axios from "axios";
import { SessionContext } from "../../util/session";

import "./index.scss";

export const Downloads = () => {
    let session = React.useContext(SessionContext);

    let [loaded, setLoaded] = React.useState(false);
    let [loadtext, setLoadtext] = React.useState("Loading...");
    let [files, setFiles] = React.useState<any[]>([]);
    let [search, setSearch] = React.useState("");
    let [pubview, setPubview] = React.useState(true);

    React.useEffect(() => {
        axios.default.get('/api/downloads').then((res) => {
            if (res.data) {
                setFiles(res.data);
                setLoaded(true);
                setLoadtext("Loaded");
            }
        });
    }, []);

    function updateSearch(event: any) {
        setSearch(event.target.value);
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
                        {pubview ? <th>Uploader</th> : <></>}
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
                            <GenerateTable files={files} search={search} pubview={pubview} />
                    }
                </table>
            </div>
        </div>
    )
}

function GenerateTable(props: any) {
    let session = React.useContext(SessionContext);
    if (props.files.length == 0) {
        return <tr><td>No files to display</td></tr>;
    }
    else {
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
                        </tr>
                    </>);
                }
            }
        });
        return (<>{table}</>);
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