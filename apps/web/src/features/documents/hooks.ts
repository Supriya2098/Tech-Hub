import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateDocumentInput, DocumentListQuery, UpdateDocumentInput } from '@techhub/shared-types';
import * as documentsApi from './api';

const DOCUMENTS_KEY = 'documents';

export function useDocuments(query: DocumentListQuery) {
  return useQuery({
    queryKey: [DOCUMENTS_KEY, query],
    queryFn: () => documentsApi.listDocuments(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => documentsApi.createDocument(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] }),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDocumentInput }) => documentsApi.updateDocument(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] }),
  });
}
