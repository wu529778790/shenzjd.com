import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import { getEnv } from './env'

const locale = getEnv('LOCALE') ?? 'en'

// Only import the configured locale (not all 6)
if (locale === 'zh-cn') { await import('dayjs/locale/zh-cn.js') }
else if (locale === 'zh-tw') { await import('dayjs/locale/zh-tw.js') }
else if (locale === 'zh') { await import('dayjs/locale/zh.js') }
else if (locale === 'ja') { await import('dayjs/locale/ja.js') }
else if (locale === 'ko') { await import('dayjs/locale/ko.js') }
else { await import('dayjs/locale/en.js') }

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
