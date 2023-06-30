interface lang {
    privacy_description: string;
    get_token_description: string;
    reset_token_description: string;
    get_thread_id_description: string;
    privacy_policy: string;
    not_in_thread: string;
    no_permission: string;
    reset_token_confirm: string;
    reset_token_yes_button: string;
    reset_token_no_button: string;
}

const en: lang = {
    privacy_description: 'Privacy Policy',
    get_token_description: 'Get token',
    reset_token_description: 'Refresh token',
    get_thread_id_description: 'Get thread id',
    privacy_policy: 'TODO',
    not_in_thread: 'Not in thread',
    no_permission: 'No permission!',
    reset_token_confirm: '<b>Sure to reset token?</b>',
    reset_token_yes_button: 'Reset token',
    reset_token_no_button: 'Cancel',
}

const zh_simple: lang = {
    privacy_description: '隐私政策',
    get_token_description: '获取token',
    reset_token_description: '刷新token',
    get_thread_id_description: '获取分组id',
    privacy_policy: '咕咕咕',
    not_in_thread: '不在分组中',
    no_permission: '没有权限!',
    reset_token_confirm: '<b>确定要重置token？</b>',
    reset_token_yes_button: '重置token',
    reset_token_no_button: '取消',
}

const zh_traditional: lang = {
    privacy_description: '隱私權政策',
    get_token_description: '取得token',
    reset_token_description: '刷新token',
    get_thread_id_description: '取得分組id',
    privacy_policy: '咕咕咕',
    not_in_thread: '不在分組中',
    no_permission: '沒有權限!',
    reset_token_confirm: '<b>確定要重置token?</b>',
    reset_token_yes_button: '重置token',
    reset_token_no_button: '取消',
}

const i18n = new Map([
    ['en', en],
    ['zh', zh_simple],
    ['zh-hans', zh_simple],
    ['zh-hant', zh_traditional],
])

export default i18n;
export type { lang };