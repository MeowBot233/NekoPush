import setup from './handler/setup'
import push from './handler/push';
import telegram from './handler/telegram'
import TgBot from './tgbot'
import unsetup from './handler/unsetup';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
    BOT_TOKEN: string;
    API_ADDRESS: string | undefined;
    ADMIN_SECRET: string
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    // MY_KV_NAMESPACE: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
    //
    // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
    // MY_SERVICE: Fetcher;
    //
    // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
    // MY_QUEUE: Queue;
}

type handler = (request: Request, env: Env, ctx: ExecutionContext, bot: TgBot) => Promise<Response>;

async function defaultHandler(request: Request, env: Env, ctx: ExecutionContext, bot: TgBot): Promise<Response> {
    
    return new Response("Push agent running.");
}
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        console.warn(JSON.stringify(request.url));
        const url = new URL(request.url);
        const webhook = "https://" + url.host + "/telegram";
        const bot = new TgBot(env.BOT_TOKEN, webhook, env.API_ADDRESS);
        const handlerMap: Map<string, handler> = new Map<string, handler>(
            [
                ['/setup', setup],
                ['/unsetup', unsetup],
                ['/telegram', telegram],
                ['/push', push]
            ]
        );
        const handler = handlerMap.get(url.pathname) || defaultHandler;
        return handler(request, env, ctx, bot);
    },
};
