'use client';

import { Badge, Button, Card, CardContent } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { jobsApi } from '@/lib/api';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { JobPost } from '@/lib/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, MapPin } from 'lucide-react';

const FeaturedJobs = () => {
  const { data: jobsResponse, loading } = useApi(
    () => jobsApi.getJobs({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
    [],
    { immediate: true }
  );

  const jobs = jobsResponse?.data || [];

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          {...ANIMATION_VARIANTS.fadeIn}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Việc làm nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những cơ hội việc làm tốt nhất từ các công ty hàng đầu
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={ANIMATION_VARIANTS.stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {jobs.map((job: JobPost) => (
            <motion.div
              key={job._id}
              variants={ANIMATION_VARIANTS.slideUp}
            >
              <Card
                hoverable
                className="h-full cursor-pointer group"
                onClick={() => window.location.href = `/jobs/${job._id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {typeof job.companyId === 'object' ? job.companyId.name : 'Công ty'}
                        </span>
                      </div>
                      {job.location && (
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {formatRelativeTime(job.createdAt)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.isArray(job.skillIds) && job.skillIds.slice(0, 3).map((skill: any) => (
                      <Badge key={typeof skill === 'object' ? skill._id : skill} variant="secondary">
                        {typeof skill === 'object' ? skill.name : skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-600">
                      {job.salaryMin || job.salaryMax ?
                        formatCurrency(job.salaryMin || job.salaryMax || 0) +
                        (job.salaryMin && job.salaryMax ? ' - ' + formatCurrency(job.salaryMax) : '+')
                        : 'Thỏa thuận'
                      }
                    </div>
                    <Badge
                      variant={job.jobType === 'full-time' ? 'success' : 'warning'}
                    >
                      {job.jobType === 'full-time' ? 'Toàn thời gian' :
                        job.jobType === 'part-time' ? 'Bán thời gian' :
                          job.jobType === 'contract' ? 'Hợp đồng' : 'Freelance'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => window.location.href = '/jobs'}
          >
            Xem tất cả việc làm
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;