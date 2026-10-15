"use client";

import { useFetch } from "./useFetch";
import { getGroups, type GetGroupsOptions } from "@aegis/api-client";
import type { GroupDto, PaginatedList } from "@aegis/domain";

export function useGroups(page = 1, pageSize = 50, options: GetGroupsOptions = {}, nonce = 0) {
  return useFetch<PaginatedList<GroupDto>>(
    () => getGroups(page, pageSize, options),

    [page, pageSize, options.mine, options.facultyId, nonce],
  );
}
