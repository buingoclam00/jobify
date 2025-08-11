'use client';

import RelatedJobs from '@/components/features/jobs/related-jobs';
import JobApplicationForm from '@/components/forms/job-application-form';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonCard
} from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { jobsApi } from '@/lib/api';
import { EXPERIENCE_LEVEL_OPTIONS, JOB_TYPE_OPTIONS } from '@/lib/constants';
import {
  formatDate,
  formatRelativeTime,
  formatSalaryRange
} from '@/lib/utils';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Mail,
  MapPin,
  Share2,
  Star,
  Users
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';

function JobDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Fetch job details
  const {
    data: job,
    loading: jobLoading,
    error: jobError,
    refetch: refetchJob
  } = useApi(
    () => jobsApi.getJobById(jobId),
    [jobId], // Chỉ fetch khi jobId thay đổi
    { immediate: true }
  );

  // Chỉ fetch job detail, không cần fetch company jobs ở đây

  if (jobError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Công việc không tồn tại</h2>
          <p className="text-gray-600 mb-6">
            Công việc này có thể đã bị xóa hoặc không còn hoạt động.
          </p>
          <Button onClick={() => router.push('/jobs')}>
            Quay lại danh sách việc làm
          </Button>
        </div>
      </div>
    );
  }

  if (jobLoading || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const company = typeof job.companyId === 'object' ? job.companyId : null;
  const category = typeof job.categoryId === 'object' ? job.categoryId : null;
  const skills = Array.isArray(job.skillIds)
    ? job.skillIds.filter(skill => typeof skill === 'object')
    : [];

  const jobTypeOption = JOB_TYPE_OPTIONS.find(option => option.value === job.jobType);
  const experienceOption = EXPERIENCE_LEVEL_OPTIONS.find(option => option.value === job.experienceLevel);

  const isExpired = job.expiresAt && new Date(job.expiresAt) < new Date();
  const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Đã bỏ lưu việc làm' : 'Đã lưu việc làm');
    // TODO: Implement save/unsave API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${company?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link việc làm');
    }
  };

  const handleApply = () => {
    if (isApplied) {
      toast.info('Bạn đã ứng tuyển vào vị trí này rồi');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setIsApplied(true);
    setShowApplicationForm(false);
    toast.success('Ứng tuyển thành công!');
    refetchJob();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb & Actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToggle}
                className={`flex items-center gap-2 ${isSaved ? 'text-red-600 border-red-200' : ''
                  }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Đã lưu' : 'Lưu việc'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar
                      src={company?.logoUrl}
                      name={company?.name}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {job.title}
                          </h1>
                          <p className="text-lg text-gray-700 mb-2">
                            {company?.name || 'Công ty'}
                          </p>
                          <div className="flex items-center gap-4 text-gray-600">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Đăng {formatRelativeTime(job.createdAt)}</span>
                            </div>
                            {job.expiresAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Hết hạn {formatDate(job.expiresAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {isNew && (
                            <Badge variant="success">Mới</Badge>
                          )}
                          {isExpired && (
                            <Badge variant="danger">Hết hạn</Badge>
                          )}
                          {!job.isActive && (
                            <Badge variant="secondary">Tạm dừng</Badge>
                          )}
                          {isApplied && (
                            <Badge variant="info">Đã ứng tuyển</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">
                        {formatSalaryRange(job.salaryMin, job.salaryMax)}
                      </div>
                      <div className="text-sm text-gray-500">Mức lương</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">
                        {jobTypeOption?.label}
                      </div>
                      <div className="text-sm text-gray-500">Loại hình</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">
                        {experienceOption?.label}
                      </div>
                      <div className="text-sm text-gray-500">Kinh nghiệm</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">
                        {job.applicationCount || 0}
                      </div>
                      <div className="text-sm text-gray-500">Ứng viên</div>
                    </div>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Kỹ năng yêu cầu</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: any) => (
                          <Badge key={skill._id} variant="secondary" size="md">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      size="lg"
                      onClick={handleApply}
                      disabled={isExpired || !job.isActive || isApplied}
                      className="w-full md:w-auto"
                    >
                      {isExpired ? 'Đã hết hạn' :
                        isApplied ? 'Đã ứng tuyển' :
                          'Ứng tuyển ngay'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Yêu cầu ứng viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quyền lợi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              {company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Thông tin công ty
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={company.logoUrl}
                        name={company.name}
                        size="lg"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {company.name}
                        </h4>
                        {company.description && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {company.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {company.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{company.location}</span>
                        </div>
                      )}
                      {company.websiteUrl && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a
                            href={company.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${company.email}`}
                            className="hover:text-blue-600"
                          >
                            {company.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/companies/${company._id}`)}
                      className="w-full"
                    >
                      Xem trang công ty
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Related Jobs */}
              <RelatedJobs
                currentJobId={jobId}
                companyId={company?._id}
                categoryId={category?._id}
                skills={skills.map((s: any) => s._id)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      <JobApplicationForm
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        job={job}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    }>
      <JobDetailPageContent />
    </Suspense>
  );
}