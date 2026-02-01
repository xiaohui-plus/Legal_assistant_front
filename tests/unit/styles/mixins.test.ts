/**
 * 样式混入测试
 * 验证 styles/mixins.scss 中的混入是否正确定义
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('styles/mixins.scss', () => {
    const mixinsContent = readFileSync(
        resolve(__dirname, '../../../styles/mixins.scss'),
        'utf-8'
    )

    it('should contain ellipsis mixin for single-line text truncation', () => {
        expect(mixinsContent).toContain('@mixin ellipsis')
        expect(mixinsContent).toContain('overflow: hidden')
        expect(mixinsContent).toContain('text-overflow: ellipsis')
        expect(mixinsContent).toContain('white-space: nowrap')
    })

    it('should contain ellipsis mixin for multi-line text truncation', () => {
        expect(mixinsContent).toContain('display: -webkit-box')
        expect(mixinsContent).toContain('-webkit-box-orient: vertical')
        expect(mixinsContent).toContain('-webkit-line-clamp')
    })

    it('should contain flex-center mixin for centering', () => {
        expect(mixinsContent).toContain('@mixin flex-center')
        expect(mixinsContent).toContain('display: flex')
        expect(mixinsContent).toContain('align-items: center')
        expect(mixinsContent).toContain('justify-content: center')
    })

    it('should contain flex-v-center mixin for vertical centering', () => {
        expect(mixinsContent).toContain('@mixin flex-v-center')
        expect(mixinsContent).toContain('display: flex')
        expect(mixinsContent).toContain('align-items: center')
    })

    it('should contain flex-h-center mixin for horizontal centering', () => {
        expect(mixinsContent).toContain('@mixin flex-h-center')
        expect(mixinsContent).toContain('display: flex')
        expect(mixinsContent).toContain('justify-content: center')
    })

    it('should contain clearfix mixin', () => {
        expect(mixinsContent).toContain('@mixin clearfix')
        expect(mixinsContent).toContain('&::after')
        expect(mixinsContent).toContain("content: ''")
        expect(mixinsContent).toContain('display: table')
        expect(mixinsContent).toContain('clear: both')
    })

    it('should contain hairline mixin for 1px borders', () => {
        expect(mixinsContent).toContain('@mixin hairline')
        expect(mixinsContent).toContain('position: relative')
        expect(mixinsContent).toContain('&::after')
        expect(mixinsContent).toContain('transform: scale')
    })

    it('should support hairline mixin with different directions', () => {
        expect(mixinsContent).toContain('$direction: all')
        expect(mixinsContent).toContain('@if $direction ==all')
        expect(mixinsContent).toContain('@else if $direction ==top')
        expect(mixinsContent).toContain('@else if $direction ==bottom')
        expect(mixinsContent).toContain('@else if $direction ==left')
        expect(mixinsContent).toContain('@else if $direction ==right')
    })

    it('should support hairline mixin with custom color', () => {
        expect(mixinsContent).toContain('$color: $border-color')
        expect(mixinsContent).toContain('border: 1px solid $color')
    })

    it('should have proper structure and comments', () => {
        expect(mixinsContent).toContain('/**')
        expect(mixinsContent).toContain('样式混入')
    })
})
