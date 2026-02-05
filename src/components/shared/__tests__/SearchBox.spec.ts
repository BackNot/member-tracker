import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBox from '../SearchBox.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to'],
  },
}))

describe('SearchBox', () => {
  const defaultProps = {
    searchTerm: '',
    createUrl: '/members/create',
    searchPlaceholder: 'Search members...',
    createPlaceholder: 'Add Member',
  }

  const mountSearchBox = (props = {}) => {
    return mount(SearchBox, {
      props: { ...defaultProps, ...props },
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
    it('should render input with placeholder', () => {
      const wrapper = mountSearchBox()
      const input = wrapper.find('input')

      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toBe('Search members...')
    })

    it('should render create button with text', () => {
      const wrapper = mountSearchBox()

      expect(wrapper.text()).toContain('Add Member')
    })

    it('should render search icon', () => {
      const wrapper = mountSearchBox()

      expect(wrapper.find('.pi-search').exists()).toBe(true)
    })

    it('should not show clear button when searchTerm is empty', () => {
      const wrapper = mountSearchBox({ searchTerm: '' })

      expect(wrapper.find('.pi-times').exists()).toBe(false)
    })

    it('should show clear button when searchTerm has value', () => {
      const wrapper = mountSearchBox({ searchTerm: 'test' })

      expect(wrapper.find('.pi-times').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('should emit update:searchTerm on input', async () => {
      const wrapper = mountSearchBox()
      const input = wrapper.find('input')

      await input.setValue('John')

      expect(wrapper.emitted('update:searchTerm')).toBeTruthy()
      expect(wrapper.emitted('update:searchTerm')![0]).toEqual(['John'])
    })

    it('should emit update:searchTerm with empty string when clear button clicked', async () => {
      const wrapper = mountSearchBox({ searchTerm: 'test' })
      const clearButton = wrapper.find('.pi-times').element.parentElement

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('update:searchTerm')).toBeTruthy()
      expect(wrapper.emitted('update:searchTerm')![0]).toEqual([''])
    })
  })

  describe('props', () => {
    it('should display correct input value from searchTerm prop', () => {
      const wrapper = mountSearchBox({ searchTerm: 'existing search' })
      const input = wrapper.find('input')

      expect(input.element.value).toBe('existing search')
    })

    it('should use custom placeholder', () => {
      const wrapper = mountSearchBox({ searchPlaceholder: 'Find users...' })
      const input = wrapper.find('input')

      expect(input.attributes('placeholder')).toBe('Find users...')
    })

    it('should use custom create button text', () => {
      const wrapper = mountSearchBox({ createPlaceholder: 'New User' })

      expect(wrapper.text()).toContain('New User')
    })

    it('should link to correct create URL', () => {
      const wrapper = mountSearchBox({ createUrl: '/users/new' })
      const link = wrapper.find('a')

      expect(link.attributes('href')).toBe('/users/new')
    })
  })
})
