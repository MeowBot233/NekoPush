import { Env } from "../worker";
import TgBot, { TgResponse, Message } from '../tgbot'
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
        try {
            const pushBody = await request.json<Push>();
            if(!pushBody.id) return bad('Missing id')
            if(!pushBody.text && !pushBody.type) return bad('Missing content');
            if(!(pushBody.type && pushBody.file)) return bad('Missing type or file');
            let res: TgResponse<Message>;
            if(pushBody.type) res = await bot.sendFile(pushBody.id, pushBody.type, pushBody.file!, pushBody.text, pushBody.html, pushBody.buttons);
            else res = await bot.sendMessage(pushBody.id, pushBody.text!, pushBody.html, pushBody.buttons);
            if(res.ok)
                return new Response('ok');
            return new Response(res.description, { status: 400 });
        } catch (error) {
            return bad(JSON.stringify(error));
        }
    }
    return new Response('Method Not Allowed', { status: 405 })
}

function bad(error: string): Response {
    return new Response(error, { status: 400 });
}

interface Push {
    id: number;
    text?: string;
    html?: boolean;
    type?: string;
    file?: string;
    buttons?: Button[][];
}

interface Button {
    text: string;
    url: string;
}
export type { Button }