"use client";

import { useFetch } from "./useFetch";
import { getGroups, type GetGroupsOptions, type GroupDto, type PaginatedList } from "@/lib/api";

export function useGroups(page = 1, pageSize = 50, options: GetGroupsOptions = {}, nonce = 0) {
  return useFetch<PaginatedList<GroupDto>>(
    () => getGroups(page, pageSize, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize, options.mine, options.facultyId, nonce],
  );
}
