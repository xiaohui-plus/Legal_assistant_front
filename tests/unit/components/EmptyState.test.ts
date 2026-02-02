import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/common/EmptyState.vue'

/**
 * EmptyState 组件单元测试
 * 验证需求 1.7: WHEN 会话列表为空，THE 应用系统 SHALL 显示空状态引导界面
 */
describe('EmptyState Component', () => {
    describe('Rendering', () => {
        it('should render with default props', () => {
            const wrapper = mount(EmptyState)

            expect(wrapper.find('.empty-state').exists()).toBe(true)
            expect(wrapper.find('.empty-state__icon').exists()).toBe(true)
            expect(wrapper.find('.empty-state__title').text()).toBe('暂无数据')
        })

        it('should render custom icon', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    icon: '🔍'
                }
            })

            expect(wrapper.find('.empty-state__icon .icon-text').text()).toBe('🔍')
        })

        it('should render custom title', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    title: '暂无会话'
                }
            })

            expect(wrapper.find('.empty-state__title').text()).toBe('暂无会话')
        })

        it('should render description when provided', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    description: '点击下方按钮开始新的咨询'
                }
            })

            expect(wrapper.find('.empty-state__description').exists()).toBe(true)
            expect(wrapper.find('.empty-state__description').text()).toBe('点击下方按钮开始新的咨询')
        })

        it('should not render description when not provided', () => {
            const wrapper = mount(EmptyState)

            expect(wrapper.find('.empty-state__description').exists()).toBe(false)
        })

        it('should render button when buttonText is provided', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    buttonText: '+ 新咨询'
                }
            })

            expect(wrapper.find('.empty-state__button').exists()).toBe(true)
            expect(wrapper.find('.empty-state__button').text()).toBe('+ 新咨询')
        })

        it('should not render button when buttonText is not provided', () => {
            const wrapper = mount(EmptyState)

            expect(wrapper.find('.empty-state__button').exists()).toBe(false)
        })
    })

    describe('Interactions', () => {
        it('should emit buttonClick event when button is clicked', async () => {
            const wrapper = mount(EmptyState, {
                props: {
                    buttonText: '开始使用'
                }
            })

            await wrapper.find('.empty-state__button').trigger('click')

            expect(wrapper.emitted('buttonClick')).toBeTruthy()
            expect(wrapper.emitted('buttonClick')?.length).toBe(1)
        })

        it('should not emit buttonClick when button does not exist', () => {
            const wrapper = mount(EmptyState)

            expect(wrapper.emitted('buttonClick')).toBeFalsy()
        })
    })

    describe('Styling', () => {
        it('should apply correct CSS classes', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    title: '空状态',
                    description: '描述文字',
                    buttonText: '按钮'
                }
            })

            expect(wrapper.find('.empty-state').exists()).toBe(true)
            expect(wrapper.find('.empty-state__icon').exists()).toBe(true)
            expect(wrapper.find('.empty-state__title').exists()).toBe(true)
            expect(wrapper.find('.empty-state__description').exists()).toBe(true)
            expect(wrapper.find('.empty-state__button').exists()).toBe(true)
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty strings gracefully', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    icon: '',
                    title: '',
                    description: '',
                    buttonText: ''
                }
            })

            expect(wrapper.find('.empty-state').exists()).toBe(true)
            // Empty title means v-if="title" is falsy, so element won't render
            expect(wrapper.find('.empty-state__title').exists()).toBe(false)
            expect(wrapper.find('.empty-state__description').exists()).toBe(false)
            expect(wrapper.find('.empty-state__button').exists()).toBe(false)
        })

        it('should handle very long text', () => {
            const longText = '这是一段非常长的描述文字'.repeat(10)
            const wrapper = mount(EmptyState, {
                props: {
                    description: longText
                }
            })

            expect(wrapper.find('.empty-state__description').text()).toBe(longText)
        })
    })

    describe('Accessibility', () => {
        it('should have proper structure for screen readers', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    title: '暂无数据',
                    description: '开始添加内容',
                    buttonText: '添加'
                }
            })

            // Verify the component has a logical structure
            const emptyState = wrapper.find('.empty-state')
            expect(emptyState.exists()).toBe(true)

            // Verify elements are in correct order
            const children = emptyState.element.children
            expect(children.length).toBeGreaterThan(0)
        })
    })

    describe('Complete Use Cases', () => {
        it('should render empty chat list state', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    icon: '💬',
                    title: '暂无会话',
                    description: '点击下方按钮开始新的法律咨询',
                    buttonText: '+ 新咨询'
                }
            })

            expect(wrapper.find('.empty-state__icon .icon-text').text()).toBe('💬')
            expect(wrapper.find('.empty-state__title').text()).toBe('暂无会话')
            expect(wrapper.find('.empty-state__description').text()).toBe('点击下方按钮开始新的法律咨询')
            expect(wrapper.find('.empty-state__button').text()).toBe('+ 新咨询')
        })

        it('should render empty document list state', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    icon: '📄',
                    title: '暂无文书',
                    description: '您还没有生成任何法律文书',
                    buttonText: '生成文书'
                }
            })

            expect(wrapper.find('.empty-state__icon .icon-text').text()).toBe('📄')
            expect(wrapper.find('.empty-state__title').text()).toBe('暂无文书')
            expect(wrapper.find('.empty-state__description').text()).toBe('您还没有生成任何法律文书')
            expect(wrapper.find('.empty-state__button').text()).toBe('生成文书')
        })

        it('should render empty favorites state without button', () => {
            const wrapper = mount(EmptyState, {
                props: {
                    icon: '⭐',
                    title: '暂无收藏',
                    description: '您还没有收藏任何内容'
                }
            })

            expect(wrapper.find('.empty-state__icon .icon-text').text()).toBe('⭐')
            expect(wrapper.find('.empty-state__title').text()).toBe('暂无收藏')
            expect(wrapper.find('.empty-state__description').text()).toBe('您还没有收藏任何内容')
            expect(wrapper.find('.empty-state__button').exists()).toBe(false)
        })
    })
})
