import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MembershipTable from '../MembershipTable.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock DeleteModal
vi.mock('@/components/shared/DeleteModal.vue', () => ({
  default: {
    name: 'DeleteModal',
    template: '<div class="delete-modal"><slot /></div>',
    methods: {
      openModal: vi.fn(),
    },
  },
}))

// Mock date utils
vi.mock('@/utils/date', () => ({
  formatDate: (date: string) => date,
}))

// Mock router const
vi.mock('@/router/routerConst', () => ({
  ROUTE_NAMES: {
    MEMBERSHIPS: {
      CREATE: 'memberships-create',
    },
  },
}))

interface Membership {
  id: number
  name: string
  description: string
  days: number
  type: 'time' | 'training'
  trainings: number | null
}

describe('MembershipTable', () => {
  const mockMemberships: Membership[] = [
    { id: 1, name: 'Monthly', description: 'Monthly membership', days: 30, type: 'time', trainings: null },
    { id: 2, name: '10 Sessions', description: '10 training sessions', days: 60, type: 'training', trainings: 10 },
  ]

  const mountTable = (props = {}) => {
    return mount(MembershipTable, {
      props: {
        memberships: mockMemberships,
        loading: false,
        ...props,
      },
      global: {
        stubs: {
          DeleteModal: {
            template: '<div class="delete-modal"></div>',
            methods: { openModal: vi.fn() },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('should show loading state', () => {
      const wrapper = mountTable({ loading: true })

      expect(wrapper.text()).toContain('Loading...')
    })

    it('should render table when not loading', () => {
      const wrapper = mountTable({ loading: false })

      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should render all memberships', () => {
      const wrapper = mountTable()
      const rows = wrapper.findAll('tbody tr')

      expect(rows.length).toBe(2)
    })

    it('should display membership names', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('Monthly')
      expect(wrapper.text()).toContain('10 Sessions')
    })

    it('should display membership days', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('60')
    })

    it('should display trainings count or dash for time-based', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('-')
    })

    it('should show empty message when no memberships', () => {
      const wrapper = mountTable({ memberships: [] })

      expect(wrapper.text()).toContain('memberships.not_found')
    })
  })

  describe('type badges', () => {
    it('should display training badge for training type', () => {
      const wrapper = mountTable()
      const badges = wrapper.findAll('.badge')

      const trainingBadge = badges.find(b => b.text().includes('memberships.type_training'))
      expect(trainingBadge?.classes()).toContain('badge-primary')
    })

    it('should display time badge for time type', () => {
      const wrapper = mountTable()
      const badges = wrapper.findAll('.badge')

      const timeBadge = badges.find(b => b.text().includes('memberships.type_time'))
      expect(timeBadge?.classes()).toContain('badge-secondary')
    })
  })

  describe('table headers', () => {
    it('should render all column headers', () => {
      const wrapper = mountTable()
      const headers = wrapper.findAll('th')

      expect(headers.length).toBeGreaterThanOrEqual(6)
      expect(wrapper.text()).toContain('memberships.id')
      expect(wrapper.text()).toContain('memberships.name')
      expect(wrapper.text()).toContain('memberships.type')
      expect(wrapper.text()).toContain('memberships.description')
      expect(wrapper.text()).toContain('memberships.days')
      expect(wrapper.text()).toContain('memberships.trainings')
      expect(wrapper.text()).toContain('memberships.actions')
    })
  })

  describe('actions', () => {
    it('should render edit button for each membership', () => {
      const wrapper = mountTable()
      const editButtons = wrapper.findAll('button').filter(b => b.text().includes('memberships.edit'))

      expect(editButtons.length).toBe(2)
    })

    it('should render delete button for each membership', () => {
      const wrapper = mountTable()
      const deleteButtons = wrapper.findAll('button').filter(b => b.text().includes('memberships.delete'))

      expect(deleteButtons.length).toBe(2)
    })

    it('should have edit icon', () => {
      const wrapper = mountTable()

      expect(wrapper.findAll('.pi-pencil').length).toBe(2)
    })

    it('should have delete icon', () => {
      const wrapper = mountTable()

      expect(wrapper.findAll('.pi-trash').length).toBe(2)
    })
  })

  describe('events', () => {
    it('should emit deleteMembership when delete confirmed', async () => {
      const wrapper = mountTable()

      // Simulate the handleDeleteConfirmed being called
      await wrapper.vm.confirmDelete(mockMemberships[0])
      await wrapper.vm.handleDeleteConfirmed()

      expect(wrapper.emitted('deleteMembership')).toBeTruthy()
      expect(wrapper.emitted('deleteMembership')![0]).toEqual([1])
    })
  })

  describe('description truncation', () => {
    it('should have truncate class on description column', () => {
      const wrapper = mountTable()
      const descriptionCells = wrapper.findAll('.truncate')

      expect(descriptionCells.length).toBeGreaterThan(0)
    })
  })
})
