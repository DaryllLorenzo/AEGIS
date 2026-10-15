"use client";

import { useFetch } from "./useFetch";
import { getGroupById } from "@aegis/api-client";
import type { GroupDto } from "@aegis/domain";

export function useGroup(id: string | undefined) {
  return useFetch<GroupDto>(() => getGroupById(id!), [id]);
}
