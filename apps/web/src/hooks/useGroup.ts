"use client";

import { useFetch } from "./useFetch";
import { getGroupById, type GroupDto } from "@/lib/api";

export function useGroup(id: string | undefined) {
  return useFetch<GroupDto>(
    () => getGroupById(id!),
    [id],
  );
}
