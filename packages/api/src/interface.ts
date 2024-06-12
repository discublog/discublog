export interface Repository<T> {
  repository: T | null
}

export interface PageInfo {
  endCursor?: string
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
}

export interface PaginationConnection<T> {
  nodes: T[]
  pageInfo: PageInfo
  totalCount: number
}

export interface Connection<T> {
  nodes: T[]
}

export interface Label {
  color: string
  id: string
  name: string
}

export interface Author {
  avatarUrl: string
  login: string
  url: string
}

export interface Discussion {
  author: Author | null
  body?: string
  bodyHTML?: string
  bodyText?: string
  createdAt: string
  labels: Connection<Label>
  number: number
  title: string
  updatedAt: string
  url: string
}

export interface DiscussionCategory {
  id: string
  name: string
}

export type DiscussionsQuery = Repository<{
  discussions: PaginationConnection<Discussion>
}>
export type DiscussionQuery = Repository<{ discussion: Discussion | null }>
export type DiscussionCategoriesQuery = Repository<{
  discussionCategories: Connection<DiscussionCategory>
}>
export type AllLabelsQuery = Repository<{ labels: Connection<Label> }>
export interface DiscussionsSearchQuery {
  search: PaginationConnection<Discussion>
}

export interface DiscussionsQueryVariables {
  body?: boolean
  bodyHTML?: boolean
  bodyText?: boolean
  categoryId: string
  cursor?: string
  first?: number
  name: string
  owner: string
}

export interface DiscussionQueryVariables {
  body?: boolean
  bodyHTML?: boolean
  bodyText?: boolean
  number: number
}

export interface DiscussionsSearchQueryVariables {
  body?: boolean
  bodyHTML?: boolean
  bodyText?: boolean
  cursor?: string
  first?: number
  query?: string
}
