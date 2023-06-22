import { Env } from "../worker";
import TgBot from '../tgbot'
import type { Update } from '../tgbot'
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    if(request.method != 'POST') return new Response(null, { status: 405 });
    const update: Update = await request.json<Update>();
    const message = update.message;
    if(message == undefined || message.text == undefined) return new Response(null, { status: 204 })
    if(message.text.startsWith('/chat_id')) {
        const body = {
            method: 'sendMessage',
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text: message.chat.id
        }
        console.log(JSON.stringify(body));
        return bot.buildResponse(body)
    }
    return new Response(null, { status: 204 })
}