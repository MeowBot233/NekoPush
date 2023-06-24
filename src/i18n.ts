interface lang {
    privacy_description: string;
    get_token_description: string;
    refresh_token_description: string;
    privacy_policy: string;
}

const en: lang = {
    privacy_description: 'Privacy Policy',
    get_token_description: 'Get token',
    refresh_token_description: 'Refresh token',
    privacy_policy: 'TODO',
}

const zh: lang = {
    privacy_description: '隐私政策',
    get_token_description: '获取token',
    refresh_token_description: '刷新token',
    privacy_policy: '咕咕咕',
}

const i18n = new Map([
    ['en', en],
    ['zh', zh],
])

export default i18n;
export type { lang };