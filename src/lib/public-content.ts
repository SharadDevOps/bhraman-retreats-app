export const publicRetreatSelect = {
  id: true,
  slug: true,
  title: true,
  edition: true,
  summary: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
  priceInPaise: true,
  capacity: true,
  status: true,
  heroImageUrl: true,
  highlight: true,
  publishedAt: true,
  updatedAt: true,
} as const;

export const publicRetreatDetailInclude = {
  itinerary: {
    where: { publicationStatus: "PUBLISHED" },
    orderBy: { dayNumber: "asc" as const },
    select: {
      id: true,
      dayNumber: true,
      element: true,
      title: true,
      description: true,
      sections: {
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { sortOrder: "asc" as const },
        select: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
          activities: {
            where: { publicationStatus: "PUBLISHED" },
            orderBy: { sortOrder: "asc" as const },
            select: {
              id: true,
              title: true,
              description: true,
              startTime: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  },
} as const;
