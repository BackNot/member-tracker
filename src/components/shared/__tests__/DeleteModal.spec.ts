import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteModal from '../DeleteModal.vue'

describe('DeleteModal', () => {
  // Mock HTMLDialogElement methods
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  const defaultProps = {
    item: { id: 1, name: 'Test Item' },
    title: 'Delete Item',
    description: 'Are you sure?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    iconType: 'danger' as const,
    confirmVariant: 'danger' as const,
  }

  const mountModal = (props = {}) => {
    return mount(DeleteModal, {
      props: { ...defaultProps, ...props },
    })
  }

  describe('rendering', () => {
    it('should render dialog element', () => {
      const wrapper = mountModal()

      expect(wrapper.find('dialog').exists()).toBe(true)
    })

    it('should render title', () => {
      const wrapper = mountModal({ title: 'Confirm Delete' })

      expect(wrapper.find('h3').text()).toBe('Confirm Delete')
    })

    it('should render description', () => {
      const wrapper = mountModal({ description: 'This cannot be undone.' })

      expect(wrapper.find('p').text()).toBe('This cannot be undone.')
    })

    it('should render confirm button with text', () => {
      const wrapper = mountModal({ confirmText: 'Yes, Delete' })

      expect(wrapper.find('#confirmBtn').text()).toBe('Yes, Delete')
    })

    it('should render cancel button with text', () => {
      const wrapper = mountModal({ cancelText: 'No, Keep' })

      expect(wrapper.find('#cancelBtn').text()).toBe('No, Keep')
    })

    it('should render close button', () => {
      const wrapper = mountModal()

      expect(wrapper.find('#closeModal').exists()).toBe(true)
    })
  })

  describe('icons', () => {
    it('should render warning icon for warning type', () => {
      const wrapper = mountModal({ iconType: 'warning' })

      expect(wrapper.find('.bg-yellow-100').exists()).toBe(true)
    })

    it('should render danger icon for danger type', () => {
      const wrapper = mountModal({ iconType: 'danger' })

      expect(wrapper.find('.bg-red-100').exists()).toBe(true)
    })

    it('should render info icon for info type', () => {
      const wrapper = mountModal({ iconType: 'info' })

      expect(wrapper.find('.bg-blue-100').exists()).toBe(true)
    })

    it('should render success icon for success type', () => {
      const wrapper = mountModal({ iconType: 'success' })

      expect(wrapper.find('.bg-green-100').exists()).toBe(true)
    })
  })

  describe('confirm button variants', () => {
    it('should have danger styling for danger variant', () => {
      const wrapper = mountModal({ confirmVariant: 'danger' })
      const confirmBtn = wrapper.find('#confirmBtn')

      expect(confirmBtn.classes()).toContain('bg-red-600')
    })

    it('should have primary styling for primary variant', () => {
      const wrapper = mountModal({ confirmVariant: 'primary' })
      const confirmBtn = wrapper.find('#confirmBtn')

      expect(confirmBtn.classes()).toContain('bg-blue-600')
    })

    it('should have success styling for success variant', () => {
      const wrapper = mountModal({ confirmVariant: 'success' })
      const confirmBtn = wrapper.find('#confirmBtn')

      expect(confirmBtn.classes()).toContain('bg-green-600')
    })
  })

  describe('events', () => {
    it('should emit close when cancel button clicked', async () => {
      const wrapper = mountModal()

      await wrapper.find('#cancelBtn').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit close when close button clicked', async () => {
      const wrapper = mountModal()

      await wrapper.find('#closeModal').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit confirmed with item when confirm button clicked', async () => {
      const item = { id: 1, name: 'Test' }
      const wrapper = mountModal({ item })

      await wrapper.find('#confirmBtn').trigger('click')

      expect(wrapper.emitted('confirmed')).toBeTruthy()
      expect(wrapper.emitted('confirmed')![0]).toEqual([item])
    })

    it('should emit close after confirm', async () => {
      const wrapper = mountModal()

      await wrapper.find('#confirmBtn').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('exposed methods', () => {
    it('should expose openModal method', () => {
      const wrapper = mountModal()

      expect(typeof wrapper.vm.openModal).toBe('function')
    })

    it('should expose closeModal method', () => {
      const wrapper = mountModal()

      expect(typeof wrapper.vm.closeModal).toBe('function')
    })

    it('should call showModal when openModal is called', () => {
      const wrapper = mountModal()

      wrapper.vm.openModal()

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('should call close when closeModal is called', () => {
      const wrapper = mountModal()

      wrapper.vm.closeModal()

      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
    })
  })

  describe('default props', () => {
    it('should use default title', () => {
      const wrapper = mount(DeleteModal)

      expect(wrapper.find('h3').text()).toBe('Confirm Action')
    })

    it('should use default description', () => {
      const wrapper = mount(DeleteModal)

      expect(wrapper.find('p').text()).toContain('Are you sure')
    })

    it('should use default confirm text', () => {
      const wrapper = mount(DeleteModal)

      expect(wrapper.find('#confirmBtn').text()).toBe('Confirm')
    })

    it('should use default cancel text', () => {
      const wrapper = mount(DeleteModal)

      expect(wrapper.find('#cancelBtn').text()).toBe('Cancel')
    })

    it('should use warning as default icon type', () => {
      const wrapper = mount(DeleteModal)

      expect(wrapper.find('.bg-yellow-100').exists()).toBe(true)
    })

    it('should use danger as default confirm variant', () => {
      const wrapper = mount(DeleteModal)

      expect(wrapper.find('#confirmBtn').classes()).toContain('bg-red-600')
    })
  })
})
