import { useQuery } from '@tanstack/react-query';
import { customInstance } from './mutator/custom-instance';
import { useI18n } from '../i18n';

export interface UsefulResource {
  id: number;
  title: string;
  resource_type: 'folder' | 'file' | 'link';
  url: string | null;
  file: string | null;
  file_extension: string | null;
  parent: number | null;
  order: number;
}

const fetchResourceRoots = () =>
  customInstance<UsefulResource[]>({ method: 'GET', url: '/api/resources/roots/' });

const fetchResourceChildren = (parentId: number) =>
  customInstance<UsefulResource[]>({ method: 'GET', url: `/api/resources/${parentId}/children/` });

export function useResourceRoots() {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ['/api/resources/roots/', lang],
    queryFn: fetchResourceRoots,
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceChildren(parentId: number | null) {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ['/api/resources/children/', parentId, lang],
    queryFn: () => fetchResourceChildren(parentId!),
    enabled: parentId !== null,
    staleTime: 5 * 60 * 1000,
  });
}
