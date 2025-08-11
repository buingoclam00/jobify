'use client';

import JobCard from '@/components/features/jobs/job-card';
import JobDetailsPanel from '@/components/features/jobs/job-details-panel';
import JobFilters from '@/components/features/jobs/job-filters';
import JobSearchBar from '@/components/features/jobs/job-search-bar';
import JobsPagination from '@/components/features/jobs/jobs-pagination';
import JobsSortControls from '@/components/features/jobs/jobs-sort-controls';
import { Button, SkeletonList } from '@/components/ui';
import { useSidebar } from '@/contexts/ui-context';
import { useJobs } from '@/hooks/use-jobs';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { Suspense, useState } from 'react';

function JobsPageContent() {
  const [showFilters, setShowFilters] = useState(true);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const { isOpen: sidebarOpen } = useSidebar();
  const {
    jobs,
    pagination,
    selectedJob,
    selectedJobId,
    filters,
    loading,
    error,
    hasActiveFilters,
    hasNextPage,
    updateFilters,
    resetFilters,
    search,
    changeSort,
    goToPage,
    loadMore,
    selectJob,
  } = useJobs();

  const handleJobSelect = (jobId: string) => {
    selectJob(jobId);
    if (window.innerWidth < 1024) {
      setShowDetailsPanel(true);
    }
  };

  const closeDetailsPanel = () => {
    setShowDetailsPanel(false);
    selectJob(null);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Tìm việc làm
              </h1>
              <p className="text-gray-600 mt-1">
                {pagination ? (
                  `${pagination.totalItems.toLocaleString()} việc làm đang tuyển`
                ) : (
                  'Đang tìm kiếm...'
                )}
              </p>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Bộ lọc
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </Button>

            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <JobSearchBar
              value={filters.search || ''}
              location={filters.location || ''}
              onSearch={search}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <motion.aside
            className={`${showFilters ? 'block' : 'hidden'
              } lg:block w-full lg:w-80 flex-shrink-0`}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sticky top-24">
              <JobFilters
                filters={filters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                loading={loading}
              />
            </div>
          </motion.aside>

          {/* Center Content - Job List */}
          <main className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* Sort Controls */}
              <div className="flex items-center justify-between">
                <JobsSortControls
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  onSortChange={changeSort}
                />
              </div>

              {/* Job List */}
              {loading && jobs.length === 0 ? (
                <SkeletonList count={6} />
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy việc làm
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={resetFilters} variant="outline">
                      Xóa tất cả bộ lọc
                    </Button>
                  )}
                </div>
              ) : (
                <div className={`space-y-4`}>
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <JobCard
                        job={job}
                        isSelected={selectedJobId === job._id}
                        onClick={() => handleJobSelect(job._id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More / Pagination */}
              {jobs.length > 0 && (
                <JobsPagination
                  pagination={pagination}
                  hasNextPage={hasNextPage}
                  loading={loading}
                  onPageChange={goToPage}
                  onLoadMore={loadMore}
                />
              )}
            </div>
          </main>

          {/* Right Panel - Job Details */}
          <motion.aside
            className={`${selectedJob && !showDetailsPanel ? 'hidden lg:block' : 'hidden'
              } w-96 flex-shrink-0`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedJob && (
              <div className="sticky top-24">
                <JobDetailsPanel
                  job={selectedJob}
                  onClose={closeDetailsPanel}
                />
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {showDetailsPanel && selectedJob && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black " onClick={closeDetailsPanel} />
          <div className="relative h-full">
            <motion.div
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3 }}
            >
              <JobDetailsPanel
                job={selectedJob}
                onClose={closeDetailsPanel}
                isMobile
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <SkeletonList count={6} />
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}