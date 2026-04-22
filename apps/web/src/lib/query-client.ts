import { QueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";

export const queryClient = new QueryClient();

export function fetchRegisteredCourses() {
    return queryClient.fetchQuery({
        queryKey: ["registered-courses"],
        queryFn: async () => {
            const res = await client.api.courses.search.registered.$get();
            const data = await res.json();
            if ("message" in data) {
                return { courses: [] };
            }
            return { courses: data };
        },
    })
}

export function fetchSearchCourses(weekdays?: string, period?: string) {
    if (!weekdays || !period) {
        return []
    }
    return queryClient.fetchQuery({
        queryKey: ["search-courses", weekdays, period],
        queryFn: async () => {
            const res = await client.api.courses.search[":weekdays"][":period"].$get({
                param: {
                    weekdays,
                    period,
                },
            });
            const data = await res.json();
            if ("message" in data) {
                return { courses: [] };
            }
            return { courses: data };
        },
    })
}

