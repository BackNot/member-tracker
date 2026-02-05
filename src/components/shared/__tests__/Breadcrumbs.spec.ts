import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Breadcrumbs from '../Breadcrumbs.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
}))

describe('Breadcrumbs', () => {
  const mountBreadcrumbs = (items: Array<{ text: string; to?: string }>) => {
    return mount(Breadcrumbs, {
      props: { items },
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render nav element', () => {
      const wrapper = mountBreadcrumbs([{ text: 'Home' }])

      expect(wrapper.find('nav').exists()).toBe(true)
    })

    it('should render all breadcrumb items', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Members', to: '/members' },
        { text: 'John Doe' },
      ]
      const wrapper = mountBreadcrumbs(items)

      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('Members')
      expect(wrapper.text()).toContain('John Doe')
    })

    it('should render links for items with to prop', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Current' },
      ]
      const wrapper = mountBreadcrumbs(items)
      const links = wrapper.findAll('a')

      expect(links.length).toBe(1)
      expect(links[0].attributes('href')).toBe('/')
    })

    it('should render span for items without to prop', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Current Page' },
      ]
      const wrapper = mountBreadcrumbs(items)
      const spans = wrapper.findAll('span')

      // Find span with the current page text
      const currentSpan = spans.find(s => s.text() === 'Current Page')
      expect(currentSpan).toBeDefined()
      expect(currentSpan?.classes()).toContain('font-medium')
    })
  })

  describe('separators', () => {
    it('should render separator between items', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Members', to: '/members' },
        { text: 'Current' },
      ]
      const wrapper = mountBreadcrumbs(items)
      const separators = wrapper.findAll('.pi-angle-right')

      // Should have n-1 separators for n items
      expect(separators.length).toBe(2)
    })

    it('should not render separator after last item', () => {
      const items = [{ text: 'Only Item' }]
      const wrapper = mountBreadcrumbs(items)
      const separators = wrapper.findAll('.pi-angle-right')

      expect(separators.length).toBe(0)
    })

    it('should render correct number of separators for two items', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Current' },
      ]
      const wrapper = mountBreadcrumbs(items)
      const separators = wrapper.findAll('.pi-angle-right')

      expect(separators.length).toBe(1)
    })
  })

  describe('styling', () => {
    it('should have correct classes on nav', () => {
      const wrapper = mountBreadcrumbs([{ text: 'Home' }])
      const nav = wrapper.find('nav')

      expect(nav.classes()).toContain('mb-4')
    })

    it('should style current page differently', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Current' },
      ]
      const wrapper = mountBreadcrumbs(items)
      const spans = wrapper.findAll('span').filter(s => s.text() === 'Current')

      expect(spans[0].classes()).toContain('text-gray-700')
      expect(spans[0].classes()).toContain('font-medium')
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      const wrapper = mountBreadcrumbs([{ text: 'Home' }])

      expect(wrapper.text()).toContain('Home')
      expect(wrapper.findAll('.pi-angle-right').length).toBe(0)
    })

    it('should handle empty text', () => {
      const items = [{ text: '', to: '/' }]
      const wrapper = mountBreadcrumbs(items)

      expect(wrapper.find('a').exists()).toBe(true)
    })

    it('should handle many items', () => {
      const items = [
        { text: 'Home', to: '/' },
        { text: 'Category', to: '/category' },
        { text: 'Subcategory', to: '/category/sub' },
        { text: 'Item', to: '/category/sub/item' },
        { text: 'Detail' },
      ]
      const wrapper = mountBreadcrumbs(items)

      expect(wrapper.findAll('a').length).toBe(4)
      expect(wrapper.findAll('.pi-angle-right').length).toBe(4)
    })
  })
})
