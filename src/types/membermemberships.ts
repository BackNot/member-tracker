export interface SelectOption {
  value: string | number 
  label: string
}

export interface MemberMembershipFormData {
  memberId: number|null
  membershipId: number
  startDate: string
  endDate: string
}
