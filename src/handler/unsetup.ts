import { Env } from "../worker";
import TgBot from '../tgbot'
export default async function (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    const url = new URL(request.url);
    if(url.search != "?" + env.ADMIN_SECRET) {
        return new Response(null, { status: 400 })
    }
    return new Response(JSON.stringify(await bot.deleteWebhook()));
}