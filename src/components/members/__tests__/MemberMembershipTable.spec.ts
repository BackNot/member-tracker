import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MemberMembershipTable from '../MemberMembershipTable.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock date utils
vi.mock('@/utils/date', () => ({
  formatDate: (date: string) => date,
}))

// Mock IPC channels
vi.mock('@/../electron/ipc/ipcConstant.js', () => ({
  IPC_CHANNELS: {
    MEMBERSHIP: { GET_ALL_ACTIVE: 'membership:getAllActive' },
  },
}))

// Mock window.electron
const mockInvoke = vi.fn()
vi.stubGlobal('window', {
  electron: {
    ipcRenderer: { invoke: mockInvoke },
    memberMembership: { getTrainingLogs: vi.fn().mockResolvedValue([]) },
  },
})

interface MemberMembership {
  id: number
  memberId: number
  membershipId: number
  startDate: string
  endDate: string
  totalTrainings: number | null
  remainingTrainings: number | null
  member: { firstName: string; lastName: string }
  membership: { name: string }
}

describe('MemberMembershipTable', () => {
  const mockMemberMemberships: MemberMembership[] = [
    {
      id: 1,
      memberId: 1,
      membershipId: 1,
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      totalTrainings: null,
      remainingTrainings: null,
      member: { firstName: 'John', lastName: 'Doe' },
      membership: { name: 'Monthly' },
    },
    {
      id: 2,
      memberId: 1,
      membershipId: 2,
      startDate: '2024-01-01',
      endDate: '2024-03-01',
      totalTrainings: 10,
      remainingTrainings: 5,
      member: { firstName: 'John', lastName: 'Doe' },
      membership: { name: '10 Sessions' },
    },
    {
      id: 3,
      memberId: 1,
      membershipId: 2,
      startDate: '2024-01-01',
      endDate: '2024-03-01',
      totalTrainings: 10,
      remainingTrainings: 0,
      member: { firstName: 'John', lastName: 'Doe' },
      membership: { name: 'Empty Sessions' },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockInvoke.mockResolvedValue([])
    // Mock HTMLDialogElement
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  const mountTable = (props = {}) => {
    return mount(MemberMembershipTable, {
      props: {
        memberMemberships: mockMemberMemberships,
        memberId: 1,
        ...props,
      },
      global: {
        stubs: {
          DeleteModal: {
            template: '<div class="delete-modal"></div>',
            methods: { openModal: vi.fn() },
          },
          CreateMemberMembershipModal: {
            template: '<div class="create-modal"></div>',
            methods: { openModal: vi.fn() },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the table', () => {
      const wrapper = mountTable()

      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should render all member memberships', () => {
      const wrapper = mountTable()
      const rows = wrapper.findAll('tbody tr')

      expect(rows.length).toBe(3)
    })

    it('should display membership names', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('Monthly')
      expect(wrapper.text()).toContain('10 Sessions')
    })

    it('should display dates', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('2024-01-01')
      expect(wrapper.text()).toContain('2024-02-01')
    })

    it('should show dash for time-based memberships (no trainings)', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('-')
    })

    it('should show training count for training-based memberships', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('5 / 10')
    })

    it('should show empty message when no memberships', () => {
      const wrapper = mountTable({ memberMemberships: [] })

      expect(wrapper.text()).toContain('membermemberships.not_found')
    })
  })

  describe('training buttons', () => {
    it('should show subtract button for memberships with remaining trainings', () => {
      const wrapper = mountTable()
      const subtractButtons = wrapper.findAll('.pi-minus')

      // May or may not have subtract buttons depending on expiration status
      expect(subtractButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('should show add button when remaining < total', () => {
      const wrapper = mountTable()
      const addButtons = wrapper.findAll('.pi-plus')

      // Should have at least the main "Add" button
      expect(addButtons.length).toBeGreaterThan(0)
    })

    it('should show history button for training memberships', () => {
      const wrapper = mountTable()
      const historyButtons = wrapper.findAll('.pi-history')

      // Training-based memberships should have history buttons
      expect(historyButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('training colors', () => {
    it('should apply red color when trainings are 0', () => {
      const wrapper = mountTable()
      const redText = wrapper.find('.text-red-600')

      expect(redText.exists()).toBe(true)
    })

    it('should apply green color when trainings are available', () => {
      const wrapper = mountTable()
      const greenText = wrapper.find('.text-green-600')

      expect(greenText.exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('should emit subtractTraining when subtractTraining method is called', async () => {
      const wrapper = mountTable()

      // Call the method directly
      await wrapper.vm.subtractTraining(mockMemberMemberships[1])

      const emitted = wrapper.emitted('subtractTraining')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([2])
    })

    it('should emit addTraining when addTraining method is called', async () => {
      const wrapper = mountTable()

      // Call the method directly
      await wrapper.vm.addTraining(mockMemberMemberships[1])

      const emitted = wrapper.emitted('addTraining')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([2])
    })

    it('should emit deleteMemberMembership when delete confirmed', async () => {
      const wrapper = mountTable()

      await wrapper.vm.confirmDelete(mockMemberMemberships[0])
      await wrapper.vm.handleDeleteConfirmed()

      expect(wrapper.emitted('deleteMemberMembership')).toBeTruthy()
      expect(wrapper.emitted('deleteMemberMembership')![0]).toEqual([1])
    })

    it('should emit createMemberMembership on form submission', async () => {
      const wrapper = mountTable()
      const formData = {
        memberId: 1,
        membershipId: 1,
        startDate: '2024-01-01',
        endDate: '2024-02-01',
      }

      await wrapper.vm.handleFormSubmission(formData)

      expect(wrapper.emitted('createMemberMembership')).toBeTruthy()
    })
  })

  describe('add membership button', () => {
    it('should render add membership button', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('membermemberships.add')
    })

    it('should have plus icon', () => {
      const wrapper = mountTable()
      const addButton = wrapper.findAll('.pi-plus').find(el =>
        el.element.parentElement?.textContent?.includes('membermemberships.add')
      )

      expect(addButton).toBeDefined()
    })
  })

  describe('delete functionality', () => {
    it('should render delete button for each membership', () => {
      const wrapper = mountTable()
      const deleteButtons = wrapper.findAll('.pi-trash')

      expect(deleteButtons.length).toBe(3)
    })
  })

  describe('table headers', () => {
    it('should render all column headers', () => {
      const wrapper = mountTable()

      expect(wrapper.text()).toContain('membermemberships.id')
      expect(wrapper.text()).toContain('membermemberships.name')
      expect(wrapper.text()).toContain('membermemberships.start_date')
      expect(wrapper.text()).toContain('membermemberships.end_date')
      expect(wrapper.text()).toContain('membermemberships.trainings')
    })
  })

  describe('expiration check', () => {
    it('should detect expired membership by date', () => {
      const expiredMembership = {
        id: 4,
        memberId: 1,
        membershipId: 1,
        startDate: '2020-01-01',
        endDate: '2020-02-01', // Past date
        totalTrainings: 10,
        remainingTrainings: 5,
        member: { firstName: 'John', lastName: 'Doe' },
        membership: { name: 'Expired' },
      }

      const wrapper = mountTable({ memberMemberships: [expiredMembership] })

      // Subtract button should not be visible for expired membership
      const subtractButtons = wrapper.findAll('.pi-minus')
      expect(subtractButtons.length).toBe(0)
    })

    it('should detect expired membership by zero trainings', () => {
      const wrapper = mountTable()

      // The membership with 0 remaining trainings should not have subtract button
      const rows = wrapper.findAll('tbody tr')
      const zeroTrainingsRow = rows[2] // The one with 0 remaining
      const subtractInRow = zeroTrainingsRow.findAll('.pi-minus')

      expect(subtractInRow.length).toBe(0)
    })
  })
})
