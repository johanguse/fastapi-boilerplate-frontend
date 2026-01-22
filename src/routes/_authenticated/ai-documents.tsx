import { createFileRoute } from '@tanstack/react-router'
import AIDocumentsPage from '@/features/ai-documents'

export const Route = createFileRoute('/_authenticated/ai-documents')({
  component: AIDocumentsPage,
})
