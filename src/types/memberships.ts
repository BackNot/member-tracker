import type { AlertType } from '@/types/alerts';
import type { MemberForm } from '@/types/members';

export interface MembershipForm {
  id: number|null
  name: string;
  description: string;
  days: number;
}

export interface MemberMembership {
  id: number;
  member: MemberForm;
  membership: MembershipForm;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MembershipPayload {
  name: string;
  description: string;
  days: number;
}


// Define props
export interface Props {
  initialData?: Partial<MembershipForm|null>;
  loading?: boolean;
  message?: string;
  submitButtonText?: string;
  messageType?: AlertType
}


export interface Emits {
  submit: [data: MembershipPayload];
  cancel: [];
  'update:message': [message: string];
}