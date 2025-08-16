export interface SelectOption {
  value: string | number
  label: string
}

export interface MemberMembershipFormData {
  member: number|null
  selectedOption: string
  startDate: string
  endDate: string
}
