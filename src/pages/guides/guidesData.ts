export interface GuideFile {
  id: string;
  titleKey: string;
  fileName: string;
  fileType: 'pptx' | 'ppt' | 'pdf' | 'doc' | 'zip';
}

export interface GuideNode {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  icon?: string;
  children?: GuideNode[];
  files?: GuideFile[];
  placeholder?: boolean;
}

export const GUIDES_TREE: GuideNode[] = [
  {
    id: 'cat1',
    titleKey: 'guides.cat1.title',
    descriptionKey: 'guides.cat1.description',
    icon: 'document',
    placeholder: true,
  },
  {
    id: 'cat2',
    titleKey: 'guides.cat2.title',
    descriptionKey: 'guides.cat2.description',
    icon: 'building',
    children: [
      {
        id: 'cat2-1',
        titleKey: 'guides.cat2_1.title',
        descriptionKey: 'guides.cat2_1.description',
        children: [
          {
            id: 'cat2-1-1',
            titleKey: 'guides.cat2_1_1.title',
            placeholder: true,
          },
          {
            id: 'cat2-1-2',
            titleKey: 'guides.cat2_1_2.title',
            placeholder: true,
          },
          {
            id: 'cat2-1-3',
            titleKey: 'guides.cat2_1_3.title',
            placeholder: true,
          },
        ],
      },
      {
        id: 'cat2-2',
        titleKey: 'guides.cat2_2.title',
        descriptionKey: 'guides.cat2_2.description',
        children: [
          {
            id: 'cat2-2-1',
            titleKey: 'guides.cat2_2_1.title',
            placeholder: true,
          },
          {
            id: 'cat2-2-2',
            titleKey: 'guides.cat2_2_2.title',
            placeholder: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat3',
    titleKey: 'guides.cat3.title',
    descriptionKey: 'guides.cat3.description',
    icon: 'academic',
    files: [
      {
        id: 'file1',
        titleKey: 'guides.file1.title',
        fileName: 'davlat-kadastrlari-yagona-tizimi.pptx',
        fileType: 'pptx',
      },
      {
        id: 'file2',
        titleKey: 'guides.file2.title',
        fileName: 'mehnat-muhofazasi-oqitish-dasturi.pptx',
        fileType: 'pptx',
      },
      {
        id: 'file3',
        titleKey: 'guides.file3.title',
        fileName: 'xavfli-ishlab-chiqarish-obyektlari.ppt',
        fileType: 'ppt',
      },
      {
        id: 'file4',
        titleKey: 'guides.file4.title',
        fileName: 'texnogen-xavf-davlat-kadastri.pptx',
        fileType: 'pptx',
      },
      {
        id: 'file5',
        titleKey: 'guides.file5.title',
        fileName: 'turmushda-gazdan-xavfsiz-foydalanish.pptx',
        fileType: 'pptx',
      },
    ],
  },
];

export function findNode(tree: GuideNode[], path: string[]): GuideNode[] | GuideNode | null {
  if (path.length === 0) return tree;

  const [first, ...rest] = path;
  const node = tree.find((n) => n.id === first);
  if (!node) return null;

  if (rest.length === 0) return node;

  if (node.children) {
    return findNode(node.children, rest);
  }

  return null;
}
