import type { ApiSuccess, CreateDocumentInput, DocumentListQuery, UpdateDocumentInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface Document {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function listDocuments(query: DocumentListQuery): Promise<ApiSuccess<Document[]>> {
  const { data } = await api.get('/documents', { params: query });
  return data;
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const { data } = await api.post('/documents', input);
  return data.data;
}

export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
  const { data } = await api.patch(`/documents/${id}`, input);
  return data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}
