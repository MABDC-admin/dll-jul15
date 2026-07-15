import { redirect } from 'next/navigation';

export default function LoadAssignmentsRedirect() {
  redirect('/principal/departments');
}
