'use client';

import { useAuth } from '@/contexts/auth-context';
import { applicationsApi, savedJobsApi } from '@/lib/api';
import { SUCCESS_MESSAGES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface UseUserJobActionsOptions {
  autoLoad?: boolean;
}

export function useUserJobActions(options: UseUserJobActionsOptions = {}) {
  const { autoLoad = true } = options;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingApplied, setLoadingApplied] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const userId = (user as any)?._id as string | undefined;

  const markActionLoading = useCallback((jobId: string, isLoading: boolean) => {
    setActionLoading((prev) => ({ ...prev, [jobId]: isLoading }));
  }, []);

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    try {
      setLoadingSaved(true);
      const resp = await savedJobsApi.getSavedJobIds(userId);
      const raw = (resp as any)?.data;
      const ids: string[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.ids)
            ? raw.ids
            : Array.isArray(raw?.savedJobIds)
              ? raw.savedJobIds
              : Array.isArray(raw?.data?.savedJobIds)
                ? raw.data.savedJobIds
                : [];
      setSavedIds(new Set(ids));
    } catch (e) {
      // silent; errors are globally toasted in interceptor
    } finally {
      setLoadingSaved(false);
    }
  }, [isAuthenticated, userId]);

  const fetchApplied = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    try {
      setLoadingApplied(true);
      const resp = await applicationsApi.getApplicationsByUser(userId, { limit: 100 });
      const raw = (resp as any)?.data;
      const items: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      const ids = items
        .map((a) => a?.jobPostId)
        .map((jp) => (typeof jp === 'object' && jp?._id ? jp._id : jp))
        .filter(Boolean);
      setAppliedIds(new Set(ids as string[]));
    } catch (e) {
      // silent
    } finally {
      setLoadingApplied(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (autoLoad && isAuthenticated) {
      fetchSaved();
      fetchApplied();
    }
  }, [autoLoad, isAuthenticated, fetchSaved, fetchApplied]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này');
      router.push('/auth/login?next=/jobs');
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  const isJobSaved = useCallback((jobId: string) => savedIds.has(jobId), [savedIds]);
  const isJobApplied = useCallback((jobId: string) => appliedIds.has(jobId), [appliedIds]);

  const toggleSave = useCallback(async (jobId: string) => {
    if (!requireAuth() || !userId) return false;
    const currentlySaved = savedIds.has(jobId);
    markActionLoading(jobId, true);
    try {
      if (currentlySaved) {
        await savedJobsApi.unsaveJob(userId, jobId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        toast.success(SUCCESS_MESSAGES.JOB_UNSAVED);
        return false;
      } else {
        await savedJobsApi.saveJob({ userId, jobPostId: jobId });
        setSavedIds((prev) => new Set(prev).add(jobId));
        toast.success(SUCCESS_MESSAGES.JOB_SAVED);
        return true;
      }
    } catch (e) {
      // revert optimistic change if any (we changed only after success)
      return currentlySaved;
    } finally {
      markActionLoading(jobId, false);
    }
  }, [requireAuth, userId, savedIds, markActionLoading]);

  const applyToJob = useCallback(async (jobId: string) => {
    if (!requireAuth() || !userId) return false;
    if (appliedIds.has(jobId)) {
      toast.info('Bạn đã ứng tuyển công việc này');
      return true;
    }
    markActionLoading(jobId, true);
    try {
      await applicationsApi.applyForJob({ userId, jobPostId: jobId });
      setAppliedIds((prev) => new Set(prev).add(jobId));
      toast.success(SUCCESS_MESSAGES.APPLICATION_SUBMITTED);
      return true;
    } catch (e) {
      return false;
    } finally {
      markActionLoading(jobId, false);
    }
  }, [requireAuth, userId, appliedIds, markActionLoading]);

  const value = useMemo(() => ({
    // state
    savedIds,
    appliedIds,
    loadingSaved,
    loadingApplied,
    actionLoading,
    // selectors
    isJobSaved,
    isJobApplied,
    // actions
    fetchSaved,
    fetchApplied,
    toggleSave,
    applyToJob,
  }), [savedIds, appliedIds, loadingSaved, loadingApplied, actionLoading, isJobSaved, isJobApplied, fetchSaved, fetchApplied, toggleSave, applyToJob]);

  return value;
}

export default useUserJobActions;
