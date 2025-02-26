const baseAPI = `https://talkable.online`;
export const socketIOBaseURL = `${baseAPI}/call`;
export const TalkableSocketBaseURL = `${baseAPI}/talkable`;

export const AppBaseUrl = `https://ugonnatalk.vercel.app`;
export const APIBaseURL = `${baseAPI}/api`;

// export const serverPort = 4000;
// export const appPort = 8100;

// // END DEPLOYED BASES
// //const baseIp = `http://13.60.184.229`;

// const hostname = window.location.hostname;
// const baseIp = `https://${hostname}`;
// const baseWsIp = `wss://${hostname}`;


// export const socketIOBaseURL = `${baseIp}:${serverPort}/call`;
// export const TalkableSocketBaseURL = `${baseWsIp}:${serverPort}/talkable`;

// export const AppBaseUrl = `${baseIp}:${appPort}`;
// export const APIBaseURL = `${baseIp}:${serverPort}/api`;

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