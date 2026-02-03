import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
    it('renders with default size (md)', () => {
        const wrapper = mount(LoadingSpinner)
        expect(wrapper.find('.loading-spinner--md').exists()).toBe(true)
    })

    it('renders with small size', () => {
        const wrapper = mount(LoadingSpinner, {
            props: { size: 'sm' }
        })
        expect(wrapper.find('.loading-spinner--sm').exists()).toBe(true)
    })

    it('renders with large size', () => {
        const wrapper = mount(LoadingSpinner, {
            props: { size: 'lg' }
        })
        expect(wrapper.find('.loading-spinner--lg').exists()).toBe(true)
    })

    it('contains spinner circle element', () => {
        const wrapper = mount(LoadingSpinner)
        expect(wrapper.find('.spinner-circle').exists()).toBe(true)
    })
})
