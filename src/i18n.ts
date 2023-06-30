interface lang {
    start_message: string;
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
    start_message: 'Welcome to NekoPush 😸!\n\
Before you start, you should read our privacy policy by using /privacy command.\n\
If you do not agree with it, please do not use NekoPush 😾.',
    privacy_description: 'Privacy Policy',
    get_token_description: 'Get token',
    reset_token_description: 'Refresh token',
    get_thread_id_description: 'Get thread id',
    privacy_policy: 'Thank you for using NekoPush 😸!\n\
Continuing to use NekoPush means that you have read and agreed to the following handling of your information:\n\
\n\
1. Anonymous collected information (not associated with your token or ID):\n\
   1.1 Application user agent (UA) for push requests\n\
   1.2 Number of push requests\n\
\n\
2. Information associated with you:\n\
   2.1 Your Telegram account ID and token (required for push functionality)\n\
\n\
3. Information that will not be collected:\n\
   3.1 Messages sent through NekoPush\n\
   3.2 Telegram account information used for message reception (username, avatar, etc)\n\
\n\
If you do not agree with the above privacy policy, please do not use NekoPush 😾.\n\
\n\
<i>Note that NekoPush is still under development, and it may not necessarily collect all of the above information. You can refer to the source code of NekoPush for more information on data collection.</i>',
    not_in_thread: 'Not in thread',
    no_permission: 'No permission!',
    reset_token_confirm: '<b>Sure to reset token?</b>',
    reset_token_yes_button: 'Reset token',
    reset_token_no_button: 'Cancel',
}

const zh_simple: lang = {
    start_message: '欢迎使用NekoPush😸!\n\
在开始之前,您应该使用命令 /privacy 阅读NekoPush的隐私政策。\n\
如果您不同意,请不要使用NekoPush😾。',
    privacy_description: '隐私政策',
    get_token_description: '获取token',
    reset_token_description: '刷新token',
    get_thread_id_description: '获取分组id',
    privacy_policy: '感谢使用NekoPush😸!\n\
继续使用NekoPush即代表您已经阅读并同意NekoPush会对您的信息做如下处理：\n\
    1. 匿名收集的信息（匿名即不与您的token或id关联）：\n\
        1.1 发起推送请求的应用UA\n\
        1.2 推送请求次数\n\
    2. 与您关联的信息\n\
        2.1 您的Telegram账号ID与token（NekoPush需要这些信息来实现推送）\n\
    3. 不会收集的信息：\n\
        3.1 您通过NekoPush推送的消息\n\
        3.2 您用于接收消息的Telegram账号信息（用户名，头像等）\n\
若您不同意以上隐私政策，请不要使用NekoPush😾。\n\
<i>由于NekoPush仍在开发中，并不一定会完整收集上述信息。关于信息的收集可于NekoPush的源代码中查看。</i>',
    not_in_thread: '不在分组中',
    no_permission: '没有权限!',
    reset_token_confirm: '<b>确定要重置token？</b>',
    reset_token_yes_button: '重置token',
    reset_token_no_button: '取消',
}

const zh_traditional: lang = {
    start_message: '歡迎使用NekoPush😸!\n\
    在開始之前，您應該使用命令 /privacy 閱讀NekoPush的隱私政策。\n\
    如果您不同意，請不要使用NekoPush😾。',    
    privacy_description: '隱私權政策',
    get_token_description: '取得token',
    reset_token_description: '刷新token',
    get_thread_id_description: '取得分組id',
    privacy_policy: '感謝使用NekoPush😸!\n\
繼續使用NekoPush即代表您已經閱讀並同意NekoPush會對您的信息做如下處理：\n\
    1. 匿名收集的信息（匿名即不與您的token或id關聯）：\n\
        1.1 發起推送請求的應用UA\n\
        1.2 推送請求次數\n\
    2. 與您關聯的信息\n\
        2.1 您的Telegram帳號ID與token（NekoPush需要這些信息來實現推送）\n\
    3. 不會收集的信息：\n\
        3.1 您通過NekoPush推送的消息\n\
        3.2 您用於接收消息的Telegram帳號信息（用戶名，頭像等）\n\
若您不同意以上隱私政策，請不要使用NekoPush😾。\n\
<i>由於NekoPush仍在開發中，並不一定會完整收集上述信息。關於信息的收集可於NekoPush的源代碼中查看。</i>',
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