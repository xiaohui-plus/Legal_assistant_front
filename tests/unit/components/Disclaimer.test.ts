import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Disclaimer from '@/components/common/Disclaimer.vue'

describe('Disclaimer', () => {
    it('renders short disclaimer by default', () => {
        const wrapper = mount(Disclaimer)
        const text = wrapper.find('.disclaimer__text').text()
        expect(text).toContain('AI生成内容仅供参考')
        expect(text).toContain('不构成正式法律意见')
    })

    it('renders full disclaimer when fullVersion is true', () => {
        const wrapper = mount(Disclaimer, {
            props: { fullVersion: true }
        })
        const text = wrapper.find('.disclaimer__text').text()
        expect(text).toContain('法律免责声明')
        expect(text).toContain('本应用提供的法律咨询和文书生成服务仅供参考')
        expect(text).toContain('不能替代专业律师的法律服务')
    })

    it('applies full version class when fullVersion is true', () => {
        const wrapper = mount(Disclaimer, {
            props: { fullVersion: true }
        })
        expect(wrapper.find('.disclaimer--full').exists()).toBe(true)
    })

    it('does not apply full version class by default', () => {
        const wrapper = mount(Disclaimer)
        expect(wrapper.find('.disclaimer--full').exists()).toBe(false)
    })
})
