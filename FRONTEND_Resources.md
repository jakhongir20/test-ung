# Примеры использования Resources API на фронтенде

## React/TypeScript примеры

### 1. Типы данных

```typescript
// types.ts
export interface UsefulResource {
  id: number;
  title: string;
  description: string;
  resource_type: 'folder' | 'link' | 'file';
  url?: string;
  file?: string;
  file_name?: string;
  file_size?: number;
  file_extension?: string;
  parent?: number;
  order: number;
  level: number;
  full_path: string;
  children?: UsefulResource[];
  has_children?: boolean;
  children_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceTreeNode extends UsefulResource {
  children: ResourceTreeNode[];
}
```

### 2. API сервис

```typescript
// resourcesAPI.ts
import axios from 'axios';

const API_URL = '/api/resources/';

export const resourcesAPI = {
  // Получить список всех ресурсов
  getAll: async (params?: { resource_type?: string; search?: string }) => {
    const response = await axios.get<UsefulResource[]>(API_URL, { params });
    return response.data;
  },

  // Получить полное дерево
  getTree: async () => {
    const response = await axios.get<ResourceTreeNode[]>(`${API_URL}tree/`);
    return response.data;
  },

  // Получить корневые элементы
  getRoots: async () => {
    const response = await axios.get<UsefulResource[]>(`${API_URL}roots/`);
    return response.data;
  },

  // Получить дочерние элементы
  getChildren: async (id: number) => {
    const response = await axios.get<UsefulResource[]>(`${API_URL}${id}/children/`);
    return response.data;
  },

  // Получить всех потомков (до низа)
  getDescendants: async (id: number) => {
    const response = await axios.get<{
      id: number;
      title: string;
      descendants: UsefulResource[];
    }>(`${API_URL}${id}/descendants/`);
    return response.data;
  },

  // Получить предков
  getAncestors: async (id: number) => {
    const response = await axios.get(`${API_URL}${id}/ancestors/`);
    return response.data;
  },

  // Получить поддерево
  getSubtree: async (id: number) => {
    const response = await axios.get<ResourceTreeNode>(`${API_URL}${id}/subtree/`);
    return response.data;
  },

  // Получить один ресурс
  getOne: async (id: number) => {
    const response = await axios.get<UsefulResource>(`${API_URL}${id}/`);
    return response.data;
  },

  // Создать ресурс
  create: async (data: FormData | Partial<UsefulResource>) => {
    const response = await axios.post<UsefulResource>(API_URL, data);
    return response.data;
  },

  // Обновить ресурс
  update: async (id: number, data: Partial<UsefulResource>) => {
    const response = await axios.patch<UsefulResource>(`${API_URL}${id}/`, data);
    return response.data;
  },

  // Удалить ресурс
  delete: async (id: number) => {
    await axios.delete(`${API_URL}${id}/`);
  },

  // Переместить ресурс
  move: async (id: number, targetId: number, position: string = 'last-child') => {
    const response = await axios.post<UsefulResource>(
      `${API_URL}${id}/move/`,
      { target_id: targetId, position }
    );
    return response.data;
  },

  // Получить статистику
  getStats: async () => {
    const response = await axios.get(`${API_URL}stats/`);
    return response.data;
  },
};
```

### 3. React Hook для работы с ресурсами

```typescript
// useResources.ts
import { useState, useEffect } from 'react';
import { resourcesAPI } from './resourcesAPI';
import { ResourceTreeNode, UsefulResource } from './types';

export const useResourceTree = () => {
  const [tree, setTree] = useState<ResourceTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesAPI.getTree();
      setTree(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  return { tree, loading, error, reload: loadTree };
};

export const useResourceChildren = (parentId?: number) => {
  const [children, setChildren] = useState<UsefulResource[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChildren = async () => {
    if (!parentId) {
      const roots = await resourcesAPI.getRoots();
      setChildren(roots);
      return;
    }
    
    setLoading(true);
    try {
      const data = await resourcesAPI.getChildren(parentId);
      setChildren(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [parentId]);

  return { children, loading, reload: loadChildren };
};
```

### 4. Компонент дерева ресурсов

```typescript
// ResourceTree.tsx
import React, { useState } from 'react';
import { ResourceTreeNode } from './types';
import { useResourceTree } from './useResources';
import { resourcesAPI } from './resourcesAPI';

interface TreeNodeProps {
  node: ResourceTreeNode;
  level?: number;
  onUpdate?: () => void;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({ node, level = 0, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const getIcon = () => {
    switch (node.resource_type) {
      case 'folder': return expanded ? '📂' : '📁';
      case 'link': return '🔗';
      case 'file': return '📄';
      default: return '📌';
    }
  };

  const handleClick = () => {
    if (node.resource_type === 'folder' && node.children) {
      setExpanded(!expanded);
    } else if (node.resource_type === 'link' && node.url) {
      window.open(node.url, '_blank');
    } else if (node.resource_type === 'file' && node.file) {
      window.open(node.file, '_blank');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Удалить "${node.title}"?`)) {
      setLoading(true);
      try {
        await resourcesAPI.delete(node.id);
        onUpdate?.();
      } catch (err) {
        alert('Ошибка при удалении');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="tree-node">
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleClick}
      >
        <span className="icon">{getIcon()}</span>
        <span className="title">{node.title}</span>
        {node.description && (
          <span className="description">{node.description}</span>
        )}
        <button onClick={handleDelete} disabled={loading}>
          🗑️
        </button>
      </div>
      
      {expanded && node.children && node.children.length > 0 && (
        <div className="tree-node-children">
          {node.children.map(child => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ResourceTree: React.FC = () => {
  const { tree, loading, error, reload } = useResourceTree();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="resource-tree">
      <div className="resource-tree-header">
        <h2>Полезные ресурсы</h2>
        <button onClick={reload}>🔄 Обновить</button>
      </div>
      <div className="resource-tree-content">
        {tree.map(node => (
          <TreeNodeComponent key={node.id} node={node} onUpdate={reload} />
        ))}
      </div>
    </div>
  );
};
```

### 5. Компонент для создания ресурса

```typescript
// CreateResourceForm.tsx
import React, { useState } from 'react';
import { resourcesAPI } from './resourcesAPI';

interface CreateResourceFormProps {
  parentId?: number;
  onSuccess?: () => void;
}

export const CreateResourceForm: React.FC<CreateResourceFormProps> = ({ 
  parentId, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'folder' as 'folder' | 'link' | 'file',
    url: '',
    parent: parentId,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.resource_type === 'file' && file) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('resource_type', formData.resource_type);
        if (parentId) formDataToSend.append('parent', parentId.toString());
        formDataToSend.append('file', file);
        
        await resourcesAPI.create(formDataToSend);
      } else {
        await resourcesAPI.create(formData);
      }
      
      onSuccess?.();
      setFormData({
        title: '',
        description: '',
        resource_type: 'folder',
        url: '',
        parent: parentId,
      });
      setFile(null);
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-resource-form">
      <h3>Создать ресурс</h3>
      
      <div className="form-group">
        <label>Название *</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Описание</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Тип *</label>
        <select
          value={formData.resource_type}
          onChange={e => setFormData({ 
            ...formData, 
            resource_type: e.target.value as any 
          })}
        >
          <option value="folder">📁 Папка</option>
          <option value="link">🔗 Ссылка</option>
          <option value="file">📄 Файл</option>
        </select>
      </div>

      {formData.resource_type === 'link' && (
        <div className="form-group">
          <label>URL *</label>
          <input
            type="url"
            value={formData.url}
            onChange={e => setFormData({ ...formData, url: e.target.value })}
            required
          />
        </div>
      )}

      {formData.resource_type === 'file' && (
        <div className="form-group">
          <label>Файл *</label>
          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Создание...' : 'Создать'}
      </button>
    </form>
  );
};
```

### 6. Компонент "хлебных крошек" (Breadcrumbs)

```typescript
// ResourceBreadcrumbs.tsx
import React, { useEffect, useState } from 'react';
import { resourcesAPI } from './resourcesAPI';

interface BreadcrumbItem {
  id: number;
  title: string;
  level: number;
}

interface ResourceBreadcrumbsProps {
  resourceId: number;
  onNavigate?: (id: number) => void;
}

export const ResourceBreadcrumbs: React.FC<ResourceBreadcrumbsProps> = ({
  resourceId,
  onNavigate,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const loadBreadcrumbs = async () => {
      try {
        const data = await resourcesAPI.getAncestors(resourceId);
        setBreadcrumbs(data.ancestors);
      } catch (err) {
        console.error('Failed to load breadcrumbs', err);
      }
    };

    loadBreadcrumbs();
  }, [resourceId]);

  return (
    <nav className="breadcrumbs">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <span className="separator"> / </span>}
          <button
            className="breadcrumb-item"
            onClick={() => onNavigate?.(item.id)}
          >
            {item.title}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
```

### 7. Пример использования с React Query

```typescript
// useResourcesQuery.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { resourcesAPI } from './resourcesAPI';

export const useResourceTreeQuery = () => {
  return useQuery('resourceTree', () => resourcesAPI.getTree(), {
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useResourceMutation = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    (data: FormData | any) => resourcesAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('resourceTree');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => 
      resourcesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('resourceTree');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => resourcesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('resourceTree');
      },
    }
  );

  return { createMutation, updateMutation, deleteMutation };
};
```

## Vue.js пример

```typescript
// useResources.ts (Vue Composition API)
import { ref, computed } from 'vue';
import axios from 'axios';

export const useResources = () => {
  const tree = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadTree = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get('/api/resources/tree/');
      tree.value = response.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createResource = async (data: any) => {
    await axios.post('/api/resources/', data);
    await loadTree();
  };

  const deleteResource = async (id: number) => {
    await axios.delete(`/api/resources/${id}/`);
    await loadTree();
  };

  return {
    tree,
    loading,
    error,
    loadTree,
    createResource,
    deleteResource,
  };
};
```

## CSS стили

```css
/* ResourceTree.css */
.resource-tree {
  font-family: Arial, sans-serif;
  padding: 20px;
}

.resource-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tree-node {
  margin: 2px 0;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tree-node-content:hover {
  background-color: #f0f0f0;
}

.tree-node-content .icon {
  margin-right: 8px;
  font-size: 18px;
}

.tree-node-content .title {
  font-weight: 500;
  flex: 1;
}

.tree-node-content .description {
  color: #666;
  font-size: 12px;
  margin-left: 10px;
}

.tree-node-children {
  margin-left: 20px;
}

.breadcrumbs {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.breadcrumb-item {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.breadcrumb-item:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
  color: #6c757d;
}

.create-resource-form {
  max-width: 500px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}
```

Эти примеры покрывают основные сценарии использования API на фронтенде!
