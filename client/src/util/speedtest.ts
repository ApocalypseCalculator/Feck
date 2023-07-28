import * as axios from "axios";

export const test = () => {
    let timestamp = Date.now();
    axios.default.post('/api/ping', 'a'.repeat(256), {
        onUploadProgress: (e) => {
            console.log(e);
        },
        headers: {
            "Content-Type": 'text/plain'
        }
    }).then((res) => {
        return Date.now() - timestamp;
    })
}
