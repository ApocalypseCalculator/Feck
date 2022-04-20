import * as React from "react";
import * as axios from "axios";

import "./index.scss";

export const Downloads = () => {
    let [loaded, setLoaded] = React.useState(false);
    let [loadtext, setLoadtext] = React.useState("Loading...");
    let [files, setFiles] = React.useState<any[]>([])

    React.useEffect(() => {
        axios.default.get('/api/downloads').then((res) => {
            if (res.data) {
                setFiles(res.data);
                if (res.data.length == 0) {
                    setLoadtext("No uploads to display");
                }
                else {
                    setLoaded(true);
                    setLoadtext("Loaded");
                }
            }
        });
    }, []);

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
            <div className={"container"}>
                <input type={"text"} id={"myInput"} placeholder={"Search for names.."}></input>
                <table id={"myTable"}>
                    <tr className={"header"}>
                        <th>Name</th>
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
                            <GenerateTable files={files} />
                    }
                </table>
            </div>
        </div>
    )
}

function GenerateTable(files: any) {
    console.log(files.files);
    let table = files.files.map((file: { name: string; size: string; date: number; id: string; }) => {
        return (<>
            <td>{file.name}</td>
            <td>{formatSize(parseInt(file.size))}</td>
            <td>{new Date(file.date).toLocaleString()}</td>
            <td>
                <button className={"btn btn-info btn-sm"}>
                    <a href={`/uploads/${file.id}/${encodeURIComponent(file.name)}`} style={{ color: 'azure' }} target={"_blank"} rel={"noopener noreferrer"}>Download</a>
                </button>
            </td>
        </>);
    });
    return (<>{table}</>);
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