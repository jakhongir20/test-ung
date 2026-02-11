import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { GUIDES_TREE, findNode } from './guidesData';
import type { GuideNode, GuideFile } from './guidesData';
import { PageTransition, FadeIn, StaggeredFadeIn } from '../../components/animations';

const CategoryIcon: FC<{ icon?: string }> = ({ icon }) => {
  if (icon === 'building') {
    return (
      <svg className="w-7 h-7 text-[#00A2DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (icon === 'academic') {
    return (
      <svg className="w-7 h-7 text-[#00A2DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    );
  }
  return (
    <svg className="w-7 h-7 text-[#00A2DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

const FileIcon: FC<{ fileType: string }> = ({ fileType }) => {
  const color = fileType === 'ppt' || fileType === 'pptx' ? 'text-orange-500' : 'text-blue-500';
  return (
    <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
};

const GuideCard: FC<{ node: GuideNode; onClick: () => void; t: (key: string) => string }> = ({ node, onClick, t }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-5 bg-white rounded-xl border border-gray-200 hover:border-[#00A2DE]/40 hover:shadow-md transition-all duration-200 group"
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#00A2DE]/10 flex items-center justify-center group-hover:bg-[#00A2DE]/15 transition-colors">
        <CategoryIcon icon={node.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-[#00A2DE] transition-colors leading-snug">
          {t(node.titleKey)}
        </h3>
        {node.descriptionKey && (
          <p className="text-sm text-gray-500 mt-1">{t(node.descriptionKey)}</p>
        )}
      </div>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#00A2DE] transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const FileCard: FC<{ file: GuideFile; t: (key: string) => string }> = ({ file, t }) => (
  <a
    href={`/guides/${file.fileName}`}
    download
    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A2DE]/40 hover:shadow-md transition-all duration-200 group"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
      <FileIcon fileType={file.fileType} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#00A2DE] transition-colors leading-snug">
        {t(file.titleKey)}
      </h4>
      <p className="text-xs text-gray-400 mt-0.5 uppercase">{file.fileType}</p>
    </div>
    <div className="flex-shrink-0 flex items-center gap-1.5 text-[#00A2DE] opacity-0 group-hover:opacity-100 transition-opacity">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span className="text-xs font-medium">{t('guides.download')}</span>
    </div>
  </a>
);

const PlaceholderCard: FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-sm text-gray-500">{t('guides.placeholder')}</p>
  </div>
);

const Breadcrumb: FC<{
  path: string[];
  onNavigate: (index: number) => void;
  t: (key: string) => string;
}> = ({ path, onNavigate, t }) => {
  const crumbs: { label: string; onClick?: () => void }[] = [
    { label: t('guides.title'), onClick: () => onNavigate(-1) },
  ];

  let currentNodes = GUIDES_TREE;
  for (let i = 0; i < path.length; i++) {
    const node = currentNodes.find((n) => n.id === path[i]);
    if (!node) break;
    const idx = i;
    crumbs.push({
      label: t(node.titleKey),
      onClick: i < path.length - 1 ? () => onNavigate(idx) : undefined,
    });
    if (node.children) currentNodes = node.children;
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              className="text-[#00A2DE] hover:underline"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-gray-600 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

const GuidesPage: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [path, setPath] = useState<string[]>([]);

  const result = findNode(GUIDES_TREE, path);

  const handleNavigate = (id: string) => {
    setPath((prev) => [...prev, id]);
  };

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      setPath([]);
    } else {
      setPath((prev) => prev.slice(0, index + 1));
    }
  };

  const handleBack = () => {
    if (path.length === 0) {
      navigate('/');
    } else {
      setPath((prev) => prev.slice(0, -1));
    }
  };

  // Root level — show all categories
  if (Array.isArray(result)) {
    return (
      <PageTransition className="min-h-screen bg-gray-50 pb-8">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <FadeIn direction="top">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{t('guides.title')}</h1>
                <p className="text-sm text-gray-500">{t('guides.subtitle')}</p>
              </div>
            </div>
          </FadeIn>

          <StaggeredFadeIn direction="bottom" staggerDelay={80} className="flex flex-col gap-3">
            {result.map((node) => (
              <GuideCard
                key={node.id}
                node={node}
                onClick={() => handleNavigate(node.id)}
                t={t}
              />
            ))}
          </StaggeredFadeIn>
        </div>
      </PageTransition>
    );
  }

  // Single node
  const node = result as GuideNode | null;
  if (!node) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Not found</p>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <FadeIn direction="top">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <Breadcrumb path={path} onNavigate={handleBreadcrumbNavigate} t={t} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 leading-snug">{t(node.titleKey)}</h2>
            {node.descriptionKey && (
              <p className="text-sm text-gray-500 mt-1">{t(node.descriptionKey)}</p>
            )}
          </div>
        </FadeIn>

        {/* Children cards */}
        {node.children && (
          <StaggeredFadeIn direction="bottom" staggerDelay={80} className="flex flex-col gap-3">
            {node.children.map((child) => (
              <GuideCard
                key={child.id}
                node={child}
                onClick={() => handleNavigate(child.id)}
                t={t}
              />
            ))}
          </StaggeredFadeIn>
        )}

        {/* Files */}
        {node.files && (
          <StaggeredFadeIn direction="bottom" staggerDelay={80} className="flex flex-col gap-3">
            {node.files.map((file) => (
              <FileCard key={file.id} file={file} t={t} />
            ))}
          </StaggeredFadeIn>
        )}

        {/* Placeholder */}
        {node.placeholder && !node.children && !node.files && (
          <FadeIn direction="bottom" delay={100}>
            <PlaceholderCard t={t} />
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
};

export default GuidesPage;
