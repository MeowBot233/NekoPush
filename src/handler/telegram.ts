import { Env } from "../worker";
import TgBot from '../tgbot';
import type { Update, Message, User, Chat } from '../tgbot';
import i18n, { lang } from "../i18n";

export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    if(request.method != 'POST') return new Response(null, { status: 405 });
    const update: Update = await request.json<Update>();
    const message = update.message;
    if(message == undefined || message.text == undefined) return new Response(null, { status: 204 })
    const command = getCommand(message.text);
    if(command) {
        const handler: commandHandler = handlerMap.get(command) || commandNotFound;
        return handler(message, env, ctx, bot, i18n.get(message.from?.language_code || 'en') || i18n.get('en')!);
    } 
    return new Response(null, { status: 204 })
}

const handlerMap = new Map<string, commandHandler>([
    // ['/chat_id', chat_id],
    ['/get_token', get_token],
    ['/reset_token', reset_token],
    ['/get_thread_id', get_thread_id],
    ['/privacy', privacy]
])

type commandHandler = (message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, i18n: lang) => Promise<Response>

async function isAdmin(user: User, chat: Chat, bot: TgBot): Promise<boolean> {
    if(chat.type == 'private') return true;
    const res = await bot.getChatMember(chat.id, user.id);
    if(!res.ok) return false;
    if(res.result?.status == 'creator' || res.result?.status == 'administrator') return true;
    return false;
}

async function get_token(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, i18n: lang): Promise<Response> {
    if(! await isAdmin(message.from!, message.chat, bot)) 
        return buildReply(bot, message, i18n.no_permission, true, true);
    const token = await env.NekoPush.get(message.chat.id.toString());
    if(token === null) return reset_token(message, env, ctx, bot, i18n);
    return buildReply(bot, message, ['<i>', escapeHTML(message.chat.title) || '', '</i>\n', '<code>', token, '</code>'].join(''), true);
}

async function reset_token(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, i18n: lang): Promise<Response> {
    if(! await isAdmin(message.from!, message.chat, bot)) 
        return buildReply(bot, message, i18n.no_permission, true, true);
    const token = await env.NekoPush.get(message.chat.id.toString());
    if(token !== null) env.NekoPush.delete(message.chat.id.toString());
    const newToken = generateRandomToken(32);
    env.NekoPush.put(message.chat.id.toString(), newToken);
    env.NekoPush.put(newToken, message.chat.id.toString());
    return buildReply(bot, message, ['<code>', newToken, '</code>'].join(''), true)
}

async function get_thread_id(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, i18n: lang): Promise<Response> {
    return buildReply(bot, message, message.message_thread_id?.toString() || i18n.not_in_thread, true, true)
}

async function privacy(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, i18n: lang): Promise<Response> {
    if(message.chat.type != 'private') return new Response(null, { status: 204 })
    return buildReply(bot, message, 'TODO')
}

async function commandNotFound(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, i18n: lang): Promise<Response> {
    return new Response(null, { status: 204 })
}

function getCommand(msg: string): string | null {
    if(!msg.startsWith('/')) return null;
    const i = msg.indexOf('@');
    if(i == -1) return msg;
    return msg.substring(0, i);
}

function generateRandomToken(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenArray = [];
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      tokenArray.push(characters[randomIndex]);
    }
  
    return tokenArray.join('');
}


function buildReply(bot:TgBot, message: Message, text: string, html: boolean = false, allowGroup: boolean = false): Response {
    var body = {
        method: 'sendMessage',
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
        text: text,
        parse_mode: html? 'HTML' : undefined
    }
    if(message.chat.type != 'private' && !allowGroup) {
        body.chat_id = message.from?.id!;
        body.reply_to_message_id = 0;
    }
    return bot.buildResponse(body);
}


function escapeHTML(text?: string): string | undefined {
    return text?.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&quot;');
}