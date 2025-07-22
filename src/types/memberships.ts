import type { AlertType } from '@/types/alerts';

export interface MembershipForm {
  id: number|null
  name: string;
  description: string;
  days: number;
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