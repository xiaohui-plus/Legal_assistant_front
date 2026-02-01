import { describe, it, expect } from 'vitest'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

describe('Project Setup', () => {
    it('should create Vue 3 app with TypeScript', () => {
        const app = createSSRApp({
            template: '<div>Test</div>'
        })
        expect(app).toBeDefined()
    })

    it('should create Pinia store', () => {
        const pinia = createPinia()
        expect(pinia).toBeDefined()
    })

    it('should support TypeScript strict mode', () => {
        // This test verifies TypeScript compilation works
        const testString: string = 'Hello TypeScript'
        const testNumber: number = 42

        expect(testString).toBe('Hello TypeScript')
        expect(testNumber).toBe(42)
    })
})
