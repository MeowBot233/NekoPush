import type { Button } from "./handler/push";
import i18n from "./i18n";
import type { lang } from "./i18n";

async function readResponse<T>(res: Response): Promise<TgResponse<T>> {
    return res.json<TgResponse<T>>();
}

export default class {
    basePath: string;
    webhook: string;
    constructor(token: string, webhook:string, api: string | undefined) {
        api = api || "https://api.telegram.org/"
        if(!api.endsWith("/")) api += "/";
        this.basePath = api + "bot" + token + "/";
        this.webhook = webhook;
    }

    private headers: Headers = new Headers({
        "Content-Type": "application/json",
    })
    
    public buildRequest(body: Object): RequestInit {
        return {
            method: 'post',
            headers: this.headers,
            body: JSON.stringify(body)
        }
    }

    public buildResponse(body: Object): Response {
        return new Response(JSON.stringify(body), {
            status: 200,
            headers: this.headers,
        })
    }

    public async sendRequest<T>(body: Object, method: string): Promise<TgResponse<T>> {
        return await readResponse<T>(await this.request(body, method));
    }

    public async request(body: Object, method: string): Promise<Response> {
        console.log(JSON.stringify(body));
        return await fetch(this.basePath + method, this.buildRequest(body));
    }

    public async setWebhook(): Promise<string> {
        const body = {
            url: this.webhook,
            max_connections: 1,
            drop_pending_updates: true
        }
        return (await this.sendRequest(body, 'setWebhook')).description || 'ok';
    }

    public async deleteWebhook(): Promise<boolean> {
        const body = { 
            drop_pending_updates: true 
        }
        return (await this.sendRequest(body, 'deleteWebhook')).ok;
    }

    public async setCommands(): Promise<string> {
        const strs: string[] = [];
        for(const [key, lang] of i18n) {
            strs.push('Setting commands for language ' + key);
            strs.push(' ');
            const privateCommandsRes = await this.setPrivateCommands(lang, key);
            strs.push('private commands: ' + (privateCommandsRes.description || 'ok '));
            const groupCommandsRes = await this.setGroupCommands(lang, key);
            strs.push('group commands: ' + (groupCommandsRes.description || 'ok '));
            strs.push('\n');
        }
        return strs.join('');
    }

    public async setPrivateCommands(lang: lang, key: string): Promise<TgResponse<boolean>> {
        const body = {
            commands: [
                {
                    command: 'get_token',
                    description: lang.get_token_description
                },
                {
                    command: 'reset_token',
                    description: lang.refresh_token_description
                },
                {
                    command: 'privacy',
                    description: lang.privacy_description
                }
            ],
            scope: {
                type: 'all_private_chats'
            },
            language_code: key
        }
        return await this.sendRequest<boolean>(body, 'setMyCommands');
    }

    public async setGroupCommands(lang: lang, key: string): Promise<TgResponse<boolean>> {
        const body = {
            commands: [
                {
                    command: 'get_token',
                    description: lang.get_token_description
                },
                {
                    command: 'reset_token',
                    description: lang.refresh_token_description
                },
                {
                    command: 'get_thread_id',
                    description: lang.get_thread_id_description
                }
            ],
            scope: {
                type: 'all_chat_administrators'
            },
            language_code: key
        }
        return await this.sendRequest<boolean>(body, 'setMyCommands');
    }

    public async sendMessage(target: number, text: string, html: boolean = false, thread_id?: number, buttons?: Button[][]): Promise<TgResponse<Message>> {
        const body = {
            chat_id: target,
            text,
            parse_mode: html? 'HTML' : undefined,
            message_thread_id: thread_id,
            reply_markup: {
                inline_keyboard: buttons
            }
        }
        return await this.sendRequest<Message>(body, 'sendMessage');
    }

    public async sendFile(target: number,type: string, file: string, caption?: string, html: boolean = false, buttons?: Button[][]): Promise<TgResponse<Message>> {
        let body: any = {
            chat_id: target,
            caption,
            parse_mode: html? 'HTML' : undefined,
            reply_markup: {
                inline_keyboard: buttons
            }
        }
        body[type] = file;
        const method = 'send' + type[0] + type.slice(1);
        return await this.sendRequest<Message>(body, method);
    }
    
    public async getChatMember(chat_id: number, user_id: number): Promise<TgResponse<ChatMember>> {
        const body = {
            chat_id,
            user_id
        }
        return await this.sendRequest<ChatMember>(body, 'getChatMember');
    }

}

interface TgResponse<T> {
    ok: boolean;
    result?: T;
    description?: string;
}

interface Update {
    update_id: number;
    message?: Message;
}

interface Message {
    message_id: number;
    message_thread_id?: number;
    from?: User;
    text?: string;
    chat: Chat;
}

interface Chat {
    id: number;
    type: string;
    title?: string;
}

interface User {
    id: number;
    language_code?: string;
}

interface ChatMember {
    status: string;
}

export type { TgResponse, Update, Message, Chat, User }