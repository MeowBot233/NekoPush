interface lang {
    privacy_description: string;
    get_token_description: string;
    refresh_token_description: string;
    get_thread_id_description: string;
    privacy_policy: string;
    not_in_thread: string;
    no_permission: string;
}

const en: lang = {
    privacy_description: 'Privacy Policy',
    get_token_description: 'Get token',
    refresh_token_description: 'Refresh token',
    get_thread_id_description: 'Get thread id',
    privacy_policy: 'TODO',
    not_in_thread: 'Not in thread',
    no_permission: 'No permission!',
}

const zh: lang = {
    privacy_description: '隐私政策',
    get_token_description: '获取token',
    refresh_token_description: '刷新token',
    get_thread_id_description: '获取分组id',
    privacy_policy: '咕咕咕',
    not_in_thread: '不在分组中',
    no_permission: '没有权限!',
}

const i18n = new Map([
    ['en', en],
    ['zh', zh],
])

export default i18n;
export type { lang };