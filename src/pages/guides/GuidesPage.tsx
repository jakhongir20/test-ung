import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import type { BreadcrumbItem } from './guidesData';
import type { UsefulResource } from '../../api/resources';
import { useResourceRoots, useResourceChildren } from '../../api/resources';
import { PageTransition, FadeIn, StaggeredFadeIn } from '../../components/animations';
import LoadingSvg from '../../components/LoadingSvg';

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']);

function getMediaType(ext: string | null): 'video' | 'image' | null {
  const e = ext?.toLowerCase().replace(/^\./, '') ?? '';
  if (VIDEO_EXTENSIONS.has(e)) return 'video';
  if (IMAGE_EXTENSIONS.has(e)) return 'image';
  return null;
}

const FolderIcon: FC = () => (
  <svg className="w-7 h-7 text-[#00A2DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const FileIcon: FC<{ extension: string | null }> = ({ extension }) => {
  const ext = extension?.toLowerCase() ?? '';
  const color = ext === 'ppt' || ext === 'pptx' ? 'text-orange-500' : 'text-blue-500';
  return (
    <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
};

const MediaPreviewModal: FC<{
  resource: UsefulResource;
  onClose: () => void;
  t: (key: string) => string;
}> = ({ resource, onClose, t }) => {
  const mediaType = getMediaType(resource.file_extension);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-2xl w-[90%] max-h-[88dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 truncate pr-4">{resource.title}</h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('guides.close')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {mediaType === 'video' && (
            <video
              src={resource.file!}
              controls
              autoPlay
              className="w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          )}
          {mediaType === 'image' && (
            <div className="flex items-center justify-center">
              <img
                src={resource.file!}
                alt={resource.title}
                className="max-w-full max-h-[75dvh] object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const ResourceCard: FC<{ resource: UsefulResource; onClick: () => void }> = ({ resource, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-5 bg-white rounded-xl border border-gray-200 hover:border-[#00A2DE]/40 hover:shadow-md transition-all duration-200 group"
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#00A2DE]/10 flex items-center justify-center group-hover:bg-[#00A2DE]/15 transition-colors">
        <FolderIcon />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-[#00A2DE] transition-colors leading-snug">
          {resource.title}
        </h3>
      </div>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#00A2DE] transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const FileCard: FC<{
  resource: UsefulResource;
  t: (key: string) => string;
  onPreview: (resource: UsefulResource) => void;
}> = ({ resource, t, onPreview }) => {
  const mediaType = getMediaType(resource.file_extension);
  const isMedia = mediaType !== null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = resource.file;
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = resource.file_extension ? `.${resource.file_extension}` : '';
      a.download = `${resource.title}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!resource.file) return;
    if (isMedia) {
      onPreview(resource);
    }
  };

  // Media files: clickable card opens preview, separate download button
  if (isMedia) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A2DE]/40 hover:shadow-md transition-all duration-200 group">
        <button
          onClick={handleClick}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00A2DE]/10 flex items-center justify-center">
            {mediaType === 'video' ? (
              <svg className="w-6 h-6 text-[#00A2DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[#00A2DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#00A2DE] transition-colors leading-snug">
              {resource.title}
            </h4>
            {resource.file_extension && (
              <p className="text-xs text-gray-400 mt-0.5 uppercase">{resource.file_extension}</p>
            )}
          </div>
        </button>
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#00A2DE] rounded-lg hover:bg-[#0090c5] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('guides.view')}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00A2DE] bg-[#00A2DE]/10 rounded-lg hover:bg-[#00A2DE]/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('guides.download')}
          </button>
        </div>
      </div>
    );
  }

  // Non-media files: download only
  return (
    <a
      href={resource.file ?? '#'}
      onClick={handleDownload}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A2DE]/40 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
        <FileIcon extension={resource.file_extension} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#00A2DE] transition-colors leading-snug">
          {resource.title}
        </h4>
        {resource.file_extension && (
          <p className="text-xs text-gray-400 mt-0.5 uppercase">{resource.file_extension}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1.5 text-[#00A2DE] opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-xs font-medium">{t('guides.download')}</span>
      </div>
    </a>
  );
};

const LinkCard: FC<{ resource: UsefulResource; index: number }> = ({ resource, index }) => (
  <a
    href={resource.url ?? '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A2DE]/40 hover:shadow-md transition-all duration-200 group"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#00A2DE]/10 flex items-center justify-center text-sm font-semibold text-[#00A2DE]">
      {index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#00A2DE] transition-colors leading-snug">
        {resource.title}
      </h4>
    </div>
    <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00A2DE] transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
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
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (index: number) => void;
  t: (key: string) => string;
}> = ({ breadcrumbs, onNavigate, t }) => {
  const crumbs: { label: string; onClick?: () => void }[] = [
    { label: t('guides.title'), onClick: breadcrumbs.length > 0 ? () => onNavigate(-1) : undefined },
  ];

  breadcrumbs.forEach((item, i) => {
    crumbs.push({
      label: item.title,
      onClick: i < breadcrumbs.length - 1 ? () => onNavigate(i) : undefined,
    });
  });

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

const ErrorState: FC<{ t: (key: string) => string; onRetry: () => void }> = ({ t, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16">
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    <p className="text-sm text-gray-500">{t('guides.error')}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 text-sm font-medium text-white bg-[#00A2DE] rounded-lg hover:bg-[#0090c5] transition-colors"
    >
      {t('guides.retry')}
    </button>
  </div>
);

const LoadingState: FC = () => (
  <div className="flex items-center justify-center py-16">
    <LoadingSvg color="blue" />
  </div>
);

const GuidesPage: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [parentId, setParentId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const [previewResource, setPreviewResource] = useState<UsefulResource | null>(null);

  const rootsQuery = useResourceRoots();
  const childrenQuery = useResourceChildren(parentId);

  const isRoot = parentId === null;
  const query = isRoot ? rootsQuery : childrenQuery;
  const resources = query.data ?? [];

  const folders = resources.filter((r) => r.resource_type === 'folder');
  const files = resources.filter((r) => r.resource_type === 'file');
  const links = resources.filter((r) => r.resource_type === 'link');
  const isEmpty = folders.length === 0 && files.length === 0 && links.length === 0;

  const handleNavigate = (resource: UsefulResource) => {
    setBreadcrumbs((prev) => [...prev, { id: resource.id, title: resource.title }]);
    setParentId(resource.id);
  };

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      setParentId(null);
      setBreadcrumbs([]);
    } else {
      const target = breadcrumbs[index];
      setParentId(target.id);
      setBreadcrumbs((prev) => prev.slice(0, index + 1));
    }
  };

  const handleBack = () => {
    if (isRoot) {
      navigate('/');
    } else if (breadcrumbs.length <= 1) {
      setParentId(null);
      setBreadcrumbs([]);
    } else {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      setParentId(parent.id);
      setBreadcrumbs((prev) => prev.slice(0, -1));
    }
  };

  // Root level
  if (isRoot) {
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

          {query.isLoading && <LoadingState />}
          {query.isError && <ErrorState t={t} onRetry={() => query.refetch()} />}
          {query.isSuccess && (
            <StaggeredFadeIn direction="bottom" staggerDelay={80} className="flex flex-col gap-3">
              {resources.map((resource) =>
                resource.resource_type === 'folder' ? (
                  <ResourceCard key={resource.id} resource={resource} onClick={() => handleNavigate(resource)} />
                ) : resource.resource_type === 'file' ? (
                  <FileCard key={resource.id} resource={resource} t={t} onPreview={setPreviewResource} />
                ) : (
                  <LinkCard key={resource.id} resource={resource} index={0} />
                )
              )}
            </StaggeredFadeIn>
          )}
        </div>
        {previewResource && (
          <MediaPreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} t={t} />
        )}
      </PageTransition>
    );
  }

  // Child level
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
              <Breadcrumb breadcrumbs={breadcrumbs} onNavigate={handleBreadcrumbNavigate} t={t} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 leading-snug">
              {breadcrumbs[breadcrumbs.length - 1]?.title}
            </h2>
          </div>
        </FadeIn>

        {query.isLoading && <LoadingState />}
        {query.isError && <ErrorState t={t} onRetry={() => query.refetch()} />}

        {query.isSuccess && (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <StaggeredFadeIn direction="bottom" staggerDelay={80} className="flex flex-col gap-3">
                {folders.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} onClick={() => handleNavigate(resource)} />
                ))}
              </StaggeredFadeIn>
            )}

            {/* Files */}
            {files.length > 0 && (
              <StaggeredFadeIn direction="bottom" staggerDelay={80} className="flex flex-col gap-3 mt-3">
                {files.map((resource) => (
                  <FileCard key={resource.id} resource={resource} t={t} onPreview={setPreviewResource} />
                ))}
              </StaggeredFadeIn>
            )}

            {/* Links */}
            {links.length > 0 && (
              <StaggeredFadeIn direction="bottom" staggerDelay={40} className="flex flex-col gap-3 mt-3">
                {links.map((resource, index) => (
                  <LinkCard key={resource.id} resource={resource} index={index} />
                ))}
              </StaggeredFadeIn>
            )}

            {/* Empty state */}
            {isEmpty && (
              <FadeIn direction="bottom" delay={100}>
                <PlaceholderCard t={t} />
              </FadeIn>
            )}
          </>
        )}
      </div>
      {previewResource && (
        <MediaPreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} t={t} />
      )}
    </PageTransition>
  );
};

export default GuidesPage;
