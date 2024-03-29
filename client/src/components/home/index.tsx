import * as React from "react";
import { InfoContext } from "../../util/info";

export const Home = () => {
    const info = React.useContext(InfoContext);

    return (
        <div className={"home"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Feck Files</h1>
                    <p>Online drive for all your files</p>
                </div>
            </div>
            <div className={"container"}>
                <p>Welcome to Feck Files</p>
                <p>To upload files click on the link in the bar on top</p>
                <p>Developed by ApocalypseCalculator and hosted by {info.name}</p>
            </div>
            <div className={"container"}>
                <h5>Disclaimer</h5>
                <p>The site developer and the site host bear zero responsibility for the content uploaded to this website.
                    Download at your own risk. If you find that there is a malicious file uploaded, you can contact the site
                    host at <a href={"mailto:" + info.email}>{info.email}</a>
                </p>
            </div>
            <div className={"container"}><br></br></div>
            <div className={"jumbotron text-center"} style={{ marginBottom: 0 }}>
                <p>Feck Files By <a href={"https://github.com/ApocalypseCalculator/Feck"} target={"_blank"} rel={"noreferrer noopener"}>ApocalypseCalculator</a><br></br><br></br>This site is using version {info.version}</p>
            </div>
        </div>
    )
}