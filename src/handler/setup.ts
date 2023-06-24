import { Env } from "../worker";
import TgBot from '../tgbot'
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    const url = new URL(request.url);
    if(url.search != "?" + env.ADMIN_SECRET) {
        return new Response(null, { status: 400 })
    }
    const setCommandsResult = await bot.setCommands();
    const setWebhookResult = await bot.setWebhook();
    const res = [
        'SetCommands:\n',
        setCommandsResult,
        'SetWebhook at ',
        bot.webhook,
        '\n',
        setWebhookResult
    ].join('');
    return new Response(res);
}