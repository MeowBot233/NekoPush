import { Env } from "../worker";
import TgBot, { TgResponse, Message } from '../tgbot'
const headers = new Headers({
    "Content-Type": "application/json",
})
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    if(request.method == 'GET') {
        const url = new URL(request.url);
        const params = url.searchParams;
        const token = params.get('token')
        const text = params.get('text');
        const html = Boolean(params.get('html'));
        if(!token || !text) return bad('Missing token or text');
        const targetID = await getID(token, env);
        if(!targetID) return bad('Token not found');
        const res = await bot.sendMessage(targetID, text, html);
        if(res.ok) return new Response(JSON.stringify(res.ok));
        return new Response(res.description, { status: 400 });
    }
    if(request.method == 'POST') {
        if(request.headers.get('Content-Type') != 'application/json')
            new Response('Unsupported Content-Type:' + request.headers.get('Content-Type'), { status: 415 });
        const body = await request.json<Push>();
        const version = body.version || 1;
        switch (version) {
            case 1: return await pushV1(body as PushV1, env, bot);
            case 2: return await pushV2(body as PushV2, env, bot);
            default: return bad('Push API version ' + version + ' is not supported!')
        }

    }
    return new Response('Method Not Allowed', { status: 405 })
}

async function pushV1(body: PushV1, env: Env, bot: TgBot): Promise<Response> {
    console.log('pushV1');
    try {
        if(!body.token) return bad('Missing token')
        if(!body.text) return bad('Missing text');
        const id = await getID(body.token, env);
        if(!id) return bad('Token not found');
        const res = await bot.sendMessage(id, body.text, body.html, body.buttons);
        if(res.ok) return new Response(JSON.stringify(res.result), { headers });
        else return bad(res.description!);
    } catch (error) {
        console.log(error);
        return bad(JSON.stringify(error));
    }
}

async function pushV2(body: PushV2, env: Env, bot: TgBot): Promise<Response> {
    if(!body.method) return bad('Missing method');
    if(!body.params) return bad('Missing params');
    if(!body.token) return bad('Missing token');
    if(!body.method.startsWith('send')) return bad('Method ' + body.method + ' is not allowed');
    const id = await getID(body.token, env);
    if(!id) return bad('Token not found');
    body.params.chat_id = id;
    return await bot.request(body.params, body.method);
}

async function getID(token: string, env:Env): Promise<number | null> {
    const id = await env.NekoPush.get(token);
    if(id) return Number(id);
    return null;
}

function bad(error: string): Response {
    return new Response(error, { status: 400 });
}

interface Push {
    version?: number;
}

interface PushV1 extends Push {
    token: string;
    text: string;
    html?: boolean;
    buttons?: Button[][];
}

interface PushV2 extends Push {
    token: string;
    method: string;
    params: any;
}

interface Button {
    text: string;
    url: string;
}
export type { Button }