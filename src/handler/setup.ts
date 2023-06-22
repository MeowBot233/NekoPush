import { Env } from "../worker";
import TgBot from '../tgbot'
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    const url = new URL(request.url);
    if(url.search != "?" + env.ADMIN_SECRET) {
        return new Response(null, { status: 400 })
    }
    const setCommandsResult = await bot.setMyCommands();
    const setWebhookResult = await bot.setWebhook();
    const res = [
        'SetCommands',
        setCommandsResult,
        'SetWebhook at',
        bot.webhook,
        setWebhookResult
    ].join(' ');
    return new Response(res);
}