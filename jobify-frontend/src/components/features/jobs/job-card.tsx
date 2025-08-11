'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent
} from '@/components/ui';
import { EXPERIENCE_LEVEL_OPTIONS, JOB_TYPE_OPTIONS } from '@/lib/constants';
import { JobPost } from '@/lib/types';
import {
  formatRelativeTime,
  formatSalaryRange
} from '@/lib/utils';
import {
  Building2,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface JobCardProps {
  job: JobPost;
  isSelected?: boolean;
  onClick?: () => void;
  showSaveButton?: boolean;
  compact?: boolean;
  // New: control save/apply externally
  saved?: boolean;
  applied?: boolean;
  saving?: boolean;
  applying?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  onApply?: (e: React.MouseEvent) => void;
}

const JobCard = ({
  job,
  isSelected = false,
  onClick,
  showSaveButton = true,
  compact = false,
  saved,
  applied,
  saving = false,
  applying = false,
  onToggleSave,
  onApply,
}: JobCardProps) => {
  const [isSavedInternal, setIsSavedInternal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isSaved = typeof saved === 'boolean' ? saved : isSavedInternal;

  const company = typeof job.companyId === 'object' ? job.companyId : null;
  const category = typeof job.categoryId === 'object' ? job.categoryId : null;
  const skills = Array.isArray(job.skillIds)
    ? job.skillIds.filter(skill => typeof skill === 'object')
    : [];

  const jobTypeOption = JOB_TYPE_OPTIONS.find(option => option.value === job.jobType);
  const experienceOption = EXPERIENCE_LEVEL_OPTIONS.find(option => option.value === job.experienceLevel);

  const handleSaveToggle = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(e as any);
    } else {
      setIsSavedInternal(!isSavedInternal);
    }
  };

  const handleApplyClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    if (onApply) onApply(e as any);
  };

  const handleViewJob = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    window.open(`/jobs/${job._id}`, '_blank');
  };

  const isExpired = job.expiresAt && new Date(job.expiresAt) < new Date();
  const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

  return (
    <Card
      hoverable
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
        }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <Avatar
            src={company?.logoUrl}
            name={company?.name}
            size="lg"
            className="flex-shrink-0"
          />

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Job Title & Status */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  {isNew && (
                    <Badge variant="success" size="sm">Mới</Badge>
                  )}
                  {isExpired && (
                    <Badge variant="danger" size="sm">Hết hạn</Badge>
                  )}
                  {!job.isActive && (
                    <Badge variant="secondary" size="sm">Tạm dừng</Badge>
                  )}
                </div>

                {/* Company & Location */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{company?.name || 'Công ty'}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRelativeTime(job.createdAt)}</span>
                  </div>
                </div>

                {/* Job Description */}
                {!compact && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.slice(0, 4).map((skill: any) => (
                    <Badge key={skill._id} variant="secondary" size="sm">
                      {skill.name}
                    </Badge>
                  ))}
                  {skills.length > 4 && (
                    <Badge variant="outline" size="sm">
                      +{skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex flex-col items-end gap-3">
                {/* Salary */}
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {formatSalaryRange(job.salaryMin, job.salaryMax)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {jobTypeOption?.label}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {showSaveButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveToggle}
                      disabled={saving}
                      className={`p-2 ${isSaved ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </Button>
                  )}

                  {onApply && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={applying || applied}
                      onClick={handleApplyClick}
                    >
                      {applied ? 'Đã ứng tuyển' : applying ? 'Đang nộp...' : 'Ứng tuyển'}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewJob}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Type & Experience */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={job.jobType === 'full-time' ? 'default' : 'outline'}
                  size="sm"
                >
                  {jobTypeOption?.icon} {jobTypeOption?.label}
                </Badge>

                <Badge variant="outline" size="sm">
                  {experienceOption?.icon} {experienceOption?.label}
                </Badge>
              </div>

              {job.applicationCount !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{job.applicationCount} ứng viên</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // // Grid view
  // return (
  //   <motion.div
  //     whileHover={{ y: -2 }}
  //     transition={{ duration: 0.2 }}
  //   >
  //     <Card
  //       hoverable
  //       className={`h-full cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
  //         } ${isExpired ? 'opacity-60' : ''}`}
  //       onClick={onClick}
  //       onMouseEnter={() => setIsHovered(true)}
  //       onMouseLeave={() => setIsHovered(false)}
  //     >
  //       <CardContent className="p-6 h-full flex flex-col">
  //         {/* Header */}
  //         <div className="flex items-start justify-between mb-4">
  //           <div className="flex items-center gap-3 flex-1 min-w-0">
  //             <Avatar
  //               src={company?.logoUrl}
  //               name={company?.name}
  //               size="md"
  //               className="flex-shrink-0"
  //             />
  //             <div className="min-w-0 flex-1">
  //               <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
  //                 {job.title}
  //               </h3>
  //               <p className="text-sm text-gray-600 truncate">
  //                 {company?.name || 'Công ty'}
  //               </p>
  //             </div>
  //           </div>

  //           {/* Status Badges */}
  //           <div className="flex flex-col gap-1">
  //             {isNew && (
  //               <Badge variant="success" size="sm">Mới</Badge>
  //             )}
  //             {isExpired && (
  //               <Badge variant="danger" size="sm">Hết hạn</Badge>
  //             )}
  //             {!job.isActive && (
  //               <Badge variant="secondary" size="sm">Tạm dừng</Badge>
  //             )}
  //           </div>
  //         </div>

  //         {/* Location & Time */}
  //         <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
  //           {job.location && (
  //             <div className="flex items-center gap-1">
  //               <MapPin className="w-4 h-4" />
  //               <span className="truncate">{job.location}</span>
  //             </div>
  //           )}
  //           <div className="flex items-center gap-1">
  //             <Clock className="w-4 h-4" />
  //             <span>{formatRelativeTime(job.createdAt)}</span>
  //           </div>
  //         </div>

  //         {/* Description */}
  //         {!compact && (
  //           <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
  //             {job.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
  //           </p>
  //         )}

  //         {/* Skills */}
  //         <div className="flex flex-wrap gap-1 mb-4">
  //           {skills.slice(0, 3).map((skill: any) => (
  //             <Badge key={skill._id} variant="secondary" size="sm">
  //               {skill.name}
  //             </Badge>
  //           ))}
  //           {skills.length > 3 && (
  //             <Badge variant="outline" size="sm">
  //               +{skills.length - 3}
  //             </Badge>
  //           )}
  //         </div>

  //         {/* Footer */}
  //         <div className="mt-auto">
  //           {/* Salary & Job Type */}
  //           <div className="flex items-center justify-between mb-3">
  //             <div className="text-lg font-semibold text-green-600">
  //               {formatSalaryRange(job.salaryMin, job.salaryMax)}
  //             </div>
  //             <div className="flex items-center gap-2">
  //               {showSaveButton && (
  //                 <Button
  //                   variant="ghost"
  //                   size="sm"
  //                   onClick={handleSaveToggle}
  //                   className={`p-1.5 ${isSaved ? 'text-red-500' : 'text-gray-400'}`}
  //                 >
  //                   <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
  //                 </Button>
  //               )}

  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={handleViewJob}
  //                 className="p-1.5 text-gray-400 hover:text-blue-600"
  //               >
  //                 <ExternalLink className="w-4 h-4" />
  //               </Button>
  //             </div>
  //           </div>

  //           {/* Job Details */}
  //           <div className="flex items-center justify-between text-sm">
  //             <Badge
  //               variant={job.jobType === 'full-time' ? 'default' : 'outline'}
  //               size="sm"
  //             >
  //               {jobTypeOption?.icon} {jobTypeOption?.label}
  //             </Badge>

  //             {job.applicationCount !== undefined && (
  //               <div className="flex items-center gap-1 text-gray-500">
  //                 <Users className="w-3 h-3" />
  //                 <span>{job.applicationCount}</span>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </motion.div>
  // );
};

export default JobCard;