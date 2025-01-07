//export const baseURL = `http://localhost:3001/api`
//export const baseURL = "https://calm-waters-32279-ef7987f39fe6.herokuapp.com/api"
export const baseURL = `https://simple-marrilee-jonapwd-35da245f.koyeb.app/api`;

export interface IRequest {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    payload?: any;
    headers?: {[key: string]: string};
} 

export function requestApi(req: IRequest){
    const token = localStorage.getItem("token");
    const url = `${baseURL}${req.url}`;
    const headers =  {
        "Content-Type": "Application/json",
        "Authorization": `Bearer ${token}`,
        ...req.headers
    };
    const body = req.payload  ? JSON.stringify(req.payload) : null;
    const res = fetch(url, {
        method: req.method,
        body,
        headers
    })
    return res;

}

export function requestApiFormData(req: IRequest){
    const token = localStorage.getItem("token");
    const url = `${baseURL}${req.url}`;
    const headers =  {
               //'Content-Type': 'multipart/form-data', // This is automatically set by FormData
                "Authorization": `Bearer ${token}`,
        //...req.headers
    };
    const body = req.payload;
    console.log("headers", headers)
    console.log("body", body)
    const res = fetch(url, {
        method: req.method,
        body,
        headers
    })
    return res;

}