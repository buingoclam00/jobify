'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  MultiSelect,
  Select,
  Slider
} from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { categoriesApi, skillsApi } from '@/lib/api';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  SALARY_RANGES
} from '@/lib/constants';
import { Category, ExperienceLevel, JobSearchFilters, JobType, Skill } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface JobFiltersProps {
  filters: JobSearchFilters;
  onUpdateFilters: (filters: Partial<JobSearchFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
}

const JobFilters = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false
}: JobFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'salary',
    'jobType',
    'experience'
  ]);

  // Fetch categories and skills - chỉ fetch 1 lần
  const { data: categories } = useApi(
    () => categoriesApi.getCategoriesSimple(),
    [],
    { immediate: true }
  );

  const { data: skills } = useApi(
    () => skillsApi.getSkillsSimple(),
    [],
    { immediate: true }
  );

  // Memoize options để tránh re-render
  const categoryOptions = useMemo(() =>
    categories?.map((cat: Category) => ({
      value: cat._id,
      label: cat.name
    })) || [],
    [categories]
  );

  const skillOptions = useMemo(() =>
    skills?.map((skill: Skill) => ({
      value: skill._id,
      label: skill.name
    })) || [],
    [skills]
  );



  // Memoize handlers để tránh re-render
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const isSectionExpanded = useCallback((section: string) => {
    return expandedSections.includes(section);
  }, [expandedSections]);

  const handleSalaryChange = useCallback((values: [number, number]) => {
    onUpdateFilters({
      minSalary: values[0] || undefined,
      maxSalary: values[1] || undefined,
    });
  }, [onUpdateFilters]);

  const handlePredefinedSalary = useCallback((range: { min: number; max: number | null; label: string }) => {
    onUpdateFilters({
      minSalary: range.min,
      maxSalary: range.max || undefined,
    });
  }, [onUpdateFilters]);

  const handleCategoryChange = useCallback((value: string) => {
    onUpdateFilters({ categoryId: value || undefined });
  }, [onUpdateFilters]);

  const handleSkillsChange = useCallback((value: string[]) => {
    onUpdateFilters({ skillIds: value });
  }, [onUpdateFilters]);

  const handleJobTypeChange = useCallback((jobType: JobType, checked: boolean) => {
    const currentTypes = filters.jobType || [];
    const newTypes = checked
      ? [...currentTypes, jobType]
      : currentTypes.filter(type => type !== jobType);
    onUpdateFilters({ jobType: newTypes });
  }, [filters.jobType, onUpdateFilters]);

  const handleExperienceLevelChange = useCallback((level: ExperienceLevel, checked: boolean) => {
    const currentLevels = filters.experienceLevel || [];
    const newLevels = checked
      ? [...currentLevels, level]
      : currentLevels.filter(l => l !== level);
    onUpdateFilters({ experienceLevel: newLevels });
  }, [filters.experienceLevel, onUpdateFilters]);

  const handleCompanyFilterRemove = useCallback(() => {
    onUpdateFilters({ companyId: undefined });
  }, [onUpdateFilters]);

  const SectionHeader = useMemo(() => {
    const Component = ({
      title,
      section,
      count
    }: {
      title: string;
      section: string;
      count?: number;
    }) => (
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" size="sm">
              {count}
            </Badge>
          )}
        </div>
        {isSectionExpanded(section) ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
    );
    Component.displayName = 'SectionHeader';
    return Component;
  }, [toggleSection, isSectionExpanded]);

  const SectionContent = useMemo(() => {
    const Component = ({
      section,
      children
    }: {
      section: string;
      children: React.ReactNode;
    }) => (
      <div className={`transition-all duration-200 ease-in-out ${isSectionExpanded(section)
        ? 'max-h-screen opacity-100'
        : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
        <div className="p-3 border-t border-gray-100 relative">
          {children}
        </div>
      </div>
    );
    Component.displayName = 'SectionContent';
    return Component;
  }, [isSectionExpanded]);

  return (
    <Card className="sticky top-24 overflow-visible job-filters-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bộ lọc tìm kiếm</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Đặt lại
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1 overflow-visible">
          {/* Category Filter */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Ngành nghề"
              section="category"
              count={filters.categoryId ? 1 : 0}
            />
            <SectionContent section="category">
              <Select
                placeholder="Chọn ngành nghề"
                value={filters.categoryId || ''}
                onChange={handleCategoryChange}
                options={categoryOptions}
              />
            </SectionContent>
          </div>

          {/* Skills Filter */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Kỹ năng"
              section="skills"
              count={filters.skillIds?.length || 0}
            />
            <SectionContent section="skills">
              <MultiSelect
                placeholder="Chọn kỹ năng"
                options={skillOptions}
                value={filters.skillIds || []}
                onChange={handleSkillsChange}
                maxDisplayed={2}
                searchable
              />
            </SectionContent>
          </div>

          {/* Location Filter */}
          {/* <div className="border-b border-gray-100">
            <SectionHeader
              title="Địa điểm"
              section="location"
              count={filters.location ? 1 : 0}
            />
            <SectionContent section="location">
              <Select
                placeholder="Chọn thành phố"
                value={filters.location || ''}
                onChange={(value) => onUpdateFilters({ location: value || undefined })}
                options={cityOptions}
              />
            </SectionContent>
          </div> */}

          {/* Salary Range Filter */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Mức lương"
              section="salary"
              count={(filters.minSalary || filters.maxSalary) ? 1 : 0}
            />
            <SectionContent section="salary">
              <div className="space-y-4">
                {/* Predefined Salary Ranges */}
                <div className="grid grid-cols-1 gap-2">
                  {SALARY_RANGES.map((range, index) => {
                    const isSelected = filters.minSalary === range.min &&
                      filters.maxSalary === range.max;

                    return (
                      <button
                        key={index}
                        onClick={() => handlePredefinedSalary(range)}
                        className={`p-3 text-left text-sm border rounded-lg transition-colors duration-200 ${isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Salary Slider */}
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Tùy chỉnh mức lương
                  </p>
                  <Slider
                    min={0}
                    max={200000000}
                    step={1000000}
                    value={[
                      filters.minSalary || 0,
                      filters.maxSalary || 200000000
                    ]}
                    onChange={handleSalaryChange}
                    formatLabel={(value) => formatCurrency(value).replace('₫', '').trim() + 'đ'}
                  />
                </div>
              </div>
            </SectionContent>
          </div>

          {/* Job Type Filter */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Loại hình công việc"
              section="jobType"
              count={filters.jobType?.length || 0}
            />
            <SectionContent section="jobType">
              <div className="space-y-3">
                {JOB_TYPE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.value}
                    label={`${option.icon} ${option.label}`}
                    checked={filters.jobType?.includes(option.value) || false}
                    onChange={(e) => handleJobTypeChange(option.value, e.target.checked)}
                  />
                ))}
              </div>
            </SectionContent>
          </div>

          {/* Experience Level Filter */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Kinh nghiệm"
              section="experience"
              count={filters.experienceLevel?.length || 0}
            />
            <SectionContent section="experience">
              <div className="space-y-3">
                {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.value}
                    label={`${option.icon} ${option.label}`}
                    checked={filters.experienceLevel?.includes(option.value) || false}
                    onChange={(e) => handleExperienceLevelChange(option.value, e.target.checked)}
                  />
                ))}
              </div>
            </SectionContent>
          </div>

          {/* Company Filter */}
          {filters.companyId && (
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Lọc theo công ty
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCompanyFilterRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Apply Filters Button (Mobile) */}
        <div className="p-4 border-t border-gray-200 lg:hidden">
          <Button
            className="w-full"
            disabled={loading}
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobFilters;