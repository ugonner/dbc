export const serverPort = 4000;
export const appPort = 8100;

const hostname = window.location.hostname;
const baseIp = /(\d\d\d\.)+/i.test(hostname) ?  `https://${hostname}:${serverPort}` : `https://talkable.online`;

export const socketIOBaseURL = `${baseIp}/call`;
export const APIBaseURL = `${baseIp}/api`;
export const AppBaseUrl = /(\d\d\d\.)+/i.test(hostname) ? `${baseIp.replace(`:${serverPort}`, "")}:${appPort}` : `https://ugonnatalk.vercel.app`;

export const convertObjectLiteralToQueryString = (payload: {[key: string]: unknown}) => {
    let str = "";
    for(let key in payload){
        str += `&${key}=${payload[key]}`
    }
    return str.slice(1);
} 
const token = localStorage.getItem("token");

export const getData = async <TResponse>(url: string, queryPayload?: {[key: string]: unknown}, headers?: {[key: string]: string}): Promise<TResponse> => {
    const queryString = queryPayload ? convertObjectLiteralToQueryString(queryPayload) : "";
    url = queryString ?  `${url}/?${queryString}` : url;
    const res = await fetch(url, {
        method: "get",
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`,
            ...(headers || {})
        }
    });
    const resBody = (await res.json());
    if(!res.ok) throw resBody;
    return resBody.data
}

export const postData = async <TResponse>(url: string, payload: {method: "post" | "put" | "delete"} & {[key: string]: unknown}, queryPayload?: {[key: string]: unknown}, headers?: {[key: string]: string}): Promise<TResponse> => {
    const queryString = queryPayload ? convertObjectLiteralToQueryString(queryPayload) : "";
    const {method, ...body} = payload;
    url = queryString ? `${url}/?${queryString}` : url;
    const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`,
            ...(headers || {})
        }
    });
    const resBody = (await res.json());
    if(!res.ok) throw resBody;
    return resBody.data
}