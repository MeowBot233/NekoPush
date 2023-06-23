import { Env } from "../worker";
import TgBot, { TgResponse, Message } from '../tgbot'
const headers = new Headers({
    "Content-Type": "application/json",
})
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    if(request.method == 'GET') {
        const url = new URL(request.url);
        const params = url.searchParams;
        const targetID = Number(params.get('id'));
        const text = params.get('text');
        const html = Boolean(params.get('html'));
        if(targetID == null || text == null) return bad('Missing id or text');
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
            case 1: return await pushV1(body as PushV1, bot);
            case 2: return await pushV2(body as PushV2, bot);
            default: return bad('Push API version ' + version + ' is not supported!')
        }

    }
    return new Response('Method Not Allowed', { status: 405 })
}

async function pushV1(body: PushV1, bot: TgBot): Promise<Response> {
    console.log('pushV1');
    try {
        if(!body.id) return bad('Missing id')
        if(!body.text) return bad('Missing text');
        const res = await bot.sendMessage(body.id, body.text, body.html, body.buttons);
        if(res.ok) return new Response(JSON.stringify(res.result), { headers });
        else return bad(res.description!);
    } catch (error) {
        console.log(error);
        return bad(JSON.stringify(error));
    }
}

async function pushV2(body: PushV2, bot: TgBot): Promise<Response> {
    if(!body.method) return bad('Missing method');
    if(!body.params) return bad('Missing params');
    if(!body.method.startsWith('send')) return bad('Method ' + body.method + ' is not allowed');
    return await bot.request(body.params, body.method);
}

function bad(error: string): Response {
    return new Response(error, { status: 400 });
}

interface Push {
    version?: number;
}

interface PushV1 extends Push {
    id: number;
    text: string;
    html?: boolean;
    buttons?: Button[][];
}

interface PushV2 extends Push {
    method: string
    params: Object
}

interface Button {
    text: string;
    url: string;
}
export type { Button }