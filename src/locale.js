import localeDataEn from 'react-intl/locale-data/en';
import localeDataZh from 'react-intl/locale-data/zh';

import messages from '../locale/messages.json'; // eslint-disable-line import/no-unresolved

export default {
    en: {
        name: 'English',
        localeData: localeDataEn,
        messages: messages.en
    },
    zh: {
        name: '简体中文',
        localeData: localeDataZh,
        messages: messages.zh
    }
};
