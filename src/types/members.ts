import type { AlertType } from "./alerts";

export interface MemberPayload {
  firstName: string;
  lastName: string;
  nickname?: string;
  description?: string;
}

export interface MemberForm {
  id: null,
  firstName: string;
  lastName: string;
  nickname: string;
  description: string;
}

export interface Props {
  initialData?: Partial<MemberForm|null>;
  loading?: boolean;
  message?: string;
  submitButtonText?: string;
  messageType?: AlertType
}


export interface Emits {
  submit: [data: MemberPayload];
  cancel: [];
  'update:message': [message: string];
}