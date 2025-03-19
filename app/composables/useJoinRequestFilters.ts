interface JoinRequestFilters {
  search: string;
  grade: number | undefined;
  status: string | undefined;
  invitationStatus: string | undefined;
}

export const useJoinRequestFilters = () => {
  const filters = reactive<JoinRequestFilters>({
    search: '',
    grade: undefined,
    status: undefined,
    invitationStatus: undefined,
  });

  const isFiltersActive = computed(() => {
    return filters.search !== '' || 
           filters.grade !== undefined || 
           filters.status !== undefined || 
           filters.invitationStatus !== undefined;
  });

  const clearFilters = () => {
    filters.search = '';
    filters.grade = undefined;
    filters.status = undefined;
    filters.invitationStatus = undefined;
  };

  const filterRequests = (requests: any[]) => {
    return requests.filter(request => {
      // Search filter
      if (filters.search && !request.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !request.email.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Grade filter
      if (filters.grade !== undefined && request.grade !== filters.grade) {
        return false;
      }

      // Status filter
      if (filters.status && request.status !== filters.status) {
        return false;
      }

      // Invitation status filter
      if (filters.invitationStatus && request.invitationStatus !== filters.invitationStatus) {
        return false;
      }

      return true;
    });
  };

  return {
    filters,
    isFiltersActive,
    clearFilters,
    filterRequests
  };
};