import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../Pagination.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
  }

  const mountPagination = (props = {}) => {
    return mount(Pagination, {
      props: { ...defaultProps, ...props },
    })
  }

  describe('rendering', () => {
    it('should not render when totalPages is 1', () => {
      const wrapper = mountPagination({ totalPages: 1 })
      expect(wrapper.find('nav').exists()).toBe(false)
    })

    it('should render when totalPages is greater than 1', () => {
      const wrapper = mountPagination({ totalPages: 5 })
      expect(wrapper.find('nav').exists()).toBe(true)
    })

    it('should display correct pagination info', () => {
      const wrapper = mountPagination({
        currentPage: 2,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
      })

      const text = wrapper.text()
      expect(text).toContain('11') // paginationStart
      expect(text).toContain('20') // paginationEnd
      expect(text).toContain('50') // totalItems
    })
  })

  describe('computed properties', () => {
    it('should calculate paginationStart correctly', () => {
      const wrapper = mountPagination({ currentPage: 3, itemsPerPage: 10 })
      expect(wrapper.text()).toContain('21')
    })

    it('should return 0 for paginationStart when totalItems is 0', () => {
      const wrapper = mountPagination({ totalItems: 0, currentPage: 1 })
      expect(wrapper.text()).toContain('0')
    })

    it('should calculate paginationEnd correctly on last page', () => {
      const wrapper = mountPagination({
        currentPage: 5,
        totalPages: 5,
        totalItems: 47,
        itemsPerPage: 10,
      })
      expect(wrapper.text()).toContain('47')
    })
  })

  describe('displayedPages', () => {
    it('should show all pages when totalPages <= 7', () => {
      const wrapper = mountPagination({ totalPages: 5 })
      const nav = wrapper.find('nav')
      const buttons = nav.findAll('button')
      // First, Prev, 1, 2, 3, 4, 5, Next, Last = 9 buttons
      expect(buttons.length).toBe(9)
    })

    it('should show ellipsis when totalPages > 7 and currentPage near start', () => {
      const wrapper = mountPagination({
        totalPages: 10,
        currentPage: 2,
        totalItems: 100,
      })
      expect(wrapper.text()).toContain('...')
    })

    it('should show ellipsis when totalPages > 7 and currentPage near end', () => {
      const wrapper = mountPagination({
        totalPages: 10,
        currentPage: 9,
        totalItems: 100,
      })
      expect(wrapper.text()).toContain('...')
    })

    it('should show two ellipses when currentPage is in middle', () => {
      const wrapper = mountPagination({
        totalPages: 10,
        currentPage: 5,
        totalItems: 100,
      })
      const ellipses = wrapper.findAll('span').filter(s => s.text() === '...')
      expect(ellipses.length).toBe(2)
    })
  })

  describe('events', () => {
    it('should emit update:currentPage with 1 when first button clicked', async () => {
      const wrapper = mountPagination({ currentPage: 3 })
      const firstButton = wrapper.findAll('button')[0]

      await firstButton.trigger('click')

      expect(wrapper.emitted('update:currentPage')).toBeTruthy()
      expect(wrapper.emitted('update:currentPage')![0]).toEqual([1])
    })

    it('should emit update:currentPage with previous page when prev button clicked', async () => {
      const wrapper = mountPagination({ currentPage: 3 })
      const prevButton = wrapper.findAll('button')[1]

      await prevButton.trigger('click')

      expect(wrapper.emitted('update:currentPage')![0]).toEqual([2])
    })

    it('should emit update:currentPage with next page when next button clicked', async () => {
      const wrapper = mountPagination({ currentPage: 3 })
      const nav = wrapper.find('nav')
      const buttons = nav.findAll('button')
      const nextButton = buttons[buttons.length - 2]

      await nextButton.trigger('click')

      expect(wrapper.emitted('update:currentPage')![0]).toEqual([4])
    })

    it('should emit update:currentPage with last page when last button clicked', async () => {
      const wrapper = mountPagination({ currentPage: 3, totalPages: 5 })
      const nav = wrapper.find('nav')
      const buttons = nav.findAll('button')
      const lastButton = buttons[buttons.length - 1]

      await lastButton.trigger('click')

      expect(wrapper.emitted('update:currentPage')![0]).toEqual([5])
    })
  })

  describe('button states', () => {
    it('should disable first and prev buttons on first page', () => {
      const wrapper = mountPagination({ currentPage: 1 })
      const nav = wrapper.find('nav')
      const buttons = nav.findAll('button')

      expect(buttons[0].attributes('disabled')).toBeDefined()
      expect(buttons[1].attributes('disabled')).toBeDefined()
    })

    it('should disable next and last buttons on last page', () => {
      const wrapper = mountPagination({ currentPage: 5, totalPages: 5 })
      const nav = wrapper.find('nav')
      const buttons = nav.findAll('button')

      expect(buttons[buttons.length - 2].attributes('disabled')).toBeDefined()
      expect(buttons[buttons.length - 1].attributes('disabled')).toBeDefined()
    })
  })
})
