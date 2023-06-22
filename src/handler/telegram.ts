import { Env } from "../worker";
import TgBot from '../tgbot'
import type { Update, Message } from '../tgbot'
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    if(request.method != 'POST') return new Response(null, { status: 405 });
    const update: Update = await request.json<Update>();
    const message = update.message;
    if(message == undefined || message.text == undefined) return new Response(null, { status: 204 })
    const command = getCommand(message.text);
    if(command) {
        const handler: commandHandler = handlerMap.get(command) || commandNotFound;
        return handler(message, env, ctx, bot);
    } 
    return new Response(null, { status: 204 })
}

const handlerMap = new Map<string, commandHandler>([
    ['/chat_id', chat_id]
])

type commandHandler = (message: Message, env: Env, ctx: ExecutionContext, bot: TgBot) => Promise<Response>

async function chat_id(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    const body = {
        method: 'sendMessage',
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        text: message.chat.id
    }
    console.log(JSON.stringify(body));
    return bot.buildResponse(body)
}

async function commandNotFound(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    return new Response(null, { status: 204 })
}

function getCommand(msg: string): string | null {
    if(!msg.startsWith('/')) return null;
    const i = msg.indexOf('@');
    if(i == -1) return msg;
    return msg.substring(0, i);
}