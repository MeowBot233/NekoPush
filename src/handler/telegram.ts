import { Env } from "../worker";
import TgBot from '../tgbot';
import type { Update, Message, User, Chat, InlineKeyboardButton, CallbackQuery } from '../tgbot';
import i18n, { lang } from "../i18n";

export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    if(request.method != 'POST') return new Response(null, { status: 405 });
    const update: Update = await request.json<Update>();
    const callback_query = update.callback_query;
    if(callback_query) {
        const query = callback_query.data!.split(':')[0];
        const handler: callbackHandler = callbackHandlerMap.get(query) || defaultCallbackHandler;
        return await handler(callback_query, env, ctx, bot, i18n.get(callback_query.from?.language_code || 'en') || i18n.get('en')!);
    }
    const message = update.message;
    if(message == undefined || message.text == undefined) return new Response(null, { status: 204 })
    const command = getCommand(message.text);
    if(command) {
        const handler: commandHandler = commandHandlerMap.get(command) || commandNotFound;
        return await handler(message, env, ctx, bot, i18n.get(message.from?.language_code || 'en') || i18n.get('en')!);
    } 
    return new Response(null, { status: 204 })
}

const commandHandlerMap = new Map<string, commandHandler>([
    ['/start', startHandler],
    ['/get_token', getTokenHandler],
    ['/reset_token', resetTokenHandler],
    ['/get_thread_id', getThreadIdHandler],
    ['/privacy', privacyHandler]
])

const callbackHandlerMap = new Map<string, callbackHandler>([
    ['reset_token_yes', resetTokenYesHandler],
    ['reset_token_no', resetTokenNoHandler]
])

type commandHandler = (message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang) => Promise<Response>
type callbackHandler = (callback: CallbackQuery, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang) => Promise<Response>

async function resetTokenYesHandler(callback: CallbackQuery, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    const message = callback.message!;
    const token = await resetToken(message.chat.id, env);
    const title = callback.data!.split(':')[1];
    return buildEdit(bot, message, ['<i>', escapeHTML(title) || '', '</i>\n', '<code>', token, '</code>'].join(''), true);
}

async function resetTokenNoHandler(callback: CallbackQuery, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    return buildDelete(bot, callback.message!);    
}

async function defaultCallbackHandler(callback: CallbackQuery, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    return new Response(null, { status: 204 })
}

async function isAdmin(user: User, chat: Chat, bot: TgBot): Promise<boolean> {
    if(chat.type == 'private') return true;
    const res = await bot.getChatMember(chat.id, user.id);
    if(!res.ok) return false;
    if(res.result?.status == 'creator' || res.result?.status == 'administrator') return true;
    return false;
}

async function startHandler(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    if(message.chat.type != 'private') return new Response(null, { status: 204 })
    return buildReply(bot, message, lang.start_message, true, true)
}

async function getTokenHandler(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    if(! await isAdmin(message.from!, message.chat, bot)) 
        return buildReply(bot, message, lang.no_permission, true, true);
    const token = await getOrCreateToken(message.chat.id, env);
    return buildReply(bot, message, ['<i>', escapeHTML(message.chat.title) || '', '</i>\n', '<code>', token, '</code>'].join(''), true);
}

async function resetTokenHandler(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    if(! await isAdmin(message.from!, message.chat, bot)) 
        return buildReply(bot, message, lang.no_permission, true, true);
    const buttons: InlineKeyboardButton[][] = [[
        {
            text: lang.reset_token_yes_button,
            callback_data: 'reset_token_yes:' + (message.chat.title || ''),
        },
        {
            text: lang.reset_token_no_button,
            callback_data: 'reset_token_no',
        }
    ]]
    return buildReply(bot, message, lang.reset_token_confirm, true, false, buttons);
}

async function getThreadIdHandler(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    let text: string;
    const thread_id = message.message_thread_id;
    if(thread_id) 
        text = ['<code>', thread_id, '</code>'].join('');
    else
        text = lang.not_in_thread;
    return buildReply(bot, message, text, true, true)
}

async function privacyHandler(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    if(message.chat.type != 'private') return new Response(null, { status: 204 })
    return buildReply(bot, message, lang.privacy_policy, true, true)
}

async function commandNotFound(message: Message, env: Env, ctx: ExecutionContext, bot: TgBot, lang: lang): Promise<Response> {
    return new Response(null, { status: 204 })
}

function getCommand(msg: string): string | null {
    if(!msg.startsWith('/')) return null;
    const i = msg.indexOf('@');
    if(i == -1) return msg;
    return msg.substring(0, i);
}

async function getOrCreateToken(id: number, env: Env): Promise<string> {
    const token = await env.NekoPush.get(id.toString());
    if(token !== null) return token;
    const newToken = generateRandomToken(32);
    env.NekoPush.put(id.toString(), newToken);
    env.NekoPush.put(newToken, id.toString());
    return newToken;
}

async function resetToken(id: number, env: Env): Promise<string> {
    const token = await env.NekoPush.get(id.toString());
    if(token !== null) await env.NekoPush.delete(id.toString());
    const newToken = generateRandomToken(32);
    env.NekoPush.put(id.toString(), newToken);
    env.NekoPush.put(newToken, id.toString());
    return newToken;
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


function buildReply(bot:TgBot, message: Message, text: string, html: boolean = false, allowGroup: boolean = false, buttons?: InlineKeyboardButton[][]): Response {
    var body = {
        method: 'sendMessage',
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
        text: text,
        parse_mode: html? 'HTML' : undefined,
        reply_markup: {
            inline_keyboard: buttons
        }
    }
    if(message.chat.type != 'private' && !allowGroup) {
        body.chat_id = message.from?.id!;
        body.reply_to_message_id = 0;
    }
    return bot.buildResponse(body);
}

function buildEdit(bot:TgBot, message: Message, text: string, html: boolean = false, buttons?: InlineKeyboardButton[][]): Response {
    const body = {
        method: 'editMessageText',
        chat_id: message.chat.id,
        message_id: message.message_id,
        text,
        parse_mode: html? 'HTML' : undefined,
        reply_markup: {
            inline_keyboard: buttons
        }
    }
    return bot.buildResponse(body);
}

function buildDelete(bot:TgBot, message: Message): Response {
    const body = {
        method: 'deleteMessage',
        chat_id: message.chat.id,
        message_id: message.message_id
    }
    return bot.buildResponse(body);
}


function escapeHTML(text?: string): string | undefined {
    return text?.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&quot;');
}