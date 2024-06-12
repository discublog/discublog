import { Octokit } from '@octokit/core'

import type {
  AllLabelsQuery,
  DiscussionCategoriesQuery,
  DiscussionQuery,
  DiscussionQueryVariables,
  DiscussionsQuery,
  DiscussionsQueryVariables,
  DiscussionsSearchQuery,
  DiscussionsSearchQueryVariables,
} from './interface'

// type utils
type RepositoryOmit<T, K extends keyof T = never> = Omit<
  T,
  'name' | 'owner' | K
>
type PickPartial<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P]
}

// auth configuration
export interface Configuration {
  client: Octokit | null
  name: null | string
  owner: null | string
}

export type RequiredConfiguration = {
  [K in keyof Configuration]: NonNullable<Configuration[K]>
}

function check(config: Configuration) {
  if (!config.client || !config.owner || !config.name) {
    throw new Error(`Please call auth() first to configure the client`)
  }
  return config as RequiredConfiguration
}

export interface AuthParams {
  name: string
  owner: string
  token: string
}

export function auth(config: Configuration, params: AuthParams) {
  config.client = new Octokit({ auth: params.token })
  config.owner = params.owner
  config.name = params.name
}

// Discussion Categories
export function queryCategories(
  config: Configuration,
): Promise<DiscussionCategoriesQuery> {
  const { client, name, owner } = check(config)
  return client.graphql(
    /* GraphQL */ `
      query DiscussionCategories($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          discussionCategories(first: 100) {
            nodes {
              id
              name
            }
          }
        }
      }
    `,
    {
      name,
      owner,
    },
  )
}

// Discussions
export type QueryByCategoryIdParams = RepositoryOmit<DiscussionsQueryVariables>

export function queryByCategoryId(
  config: Configuration,
  {
    body = false,
    bodyHTML = false,
    bodyText = false,
    categoryId,
    cursor,
    first = 100,
  }: QueryByCategoryIdParams,
): Promise<DiscussionsQuery> {
  const { client, name, owner } = check(config)
  return client.graphql(
    /* GraphQL */ `
      query Discussions(
        $first: Int!
        $owner: String!
        $name: String!
        $categoryId: ID!
        $body: Boolean!
        $bodyHTML: Boolean!
        $bodyText: Boolean!
        $cursor: String
      ) {
        repository(owner: $owner, name: $name) {
          discussions(
            first: $first
            orderBy: { field: CREATED_AT, direction: DESC }
            after: $cursor
            categoryId: $categoryId
          ) {
            nodes {
              author {
                login
                url
                avatarUrl
              }
              number
              title
              createdAt
              updatedAt
              url
              body @include(if: $body)
              bodyHTML @include(if: $bodyHTML)
              bodyText @include(if: $bodyText)
              labels(first: 5) {
                nodes {
                  id
                  name
                  color
                }
              }
            }
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
      }
    `,
    {
      body,
      bodyHTML,
      bodyText,
      categoryId,
      cursor,
      first,
      name,
      owner,
    },
  )
}

export interface QueryByCategoryNameParams
  extends PickPartial<
    RepositoryOmit<DiscussionsQueryVariables, 'categoryId'>,
    'body' | 'bodyHTML' | 'first'
  > {
  name: string
}

export async function queryByCategoryName(
  config: Configuration,
  params: QueryByCategoryNameParams,
) {
  const { name, ...rest } = params
  const categoriesResponse = await queryCategories(config)
  const categories = categoriesResponse.repository?.discussionCategories.nodes
  const categoryId = categories?.find((category) => category.name === name)?.id
  if (!categoryId) {
    return null
  }
  return queryByCategoryId(config, { ...rest, categoryId })
}

export type QueryByNumberParams = DiscussionQueryVariables

export async function queryByNumber(
  config: Configuration,
  {
    body = false,
    bodyHTML = false,
    bodyText = false,
    number,
  }: QueryByNumberParams,
): Promise<DiscussionQuery> {
  const { client, name, owner } = check(config)
  return client.graphql(
    /* GraphQL */ `
      query Discussion(
        $owner: String!
        $name: String!
        $number: Int!
        $body: Boolean!
        $bodyHTML: Boolean!
        $bodyText: Boolean!
      ) {
        repository(owner: $owner, name: $name) {
          discussion(number: $number) {
            author {
              login
              url
              avatarUrl
            }
            number
            title
            createdAt
            updatedAt
            url
            body @include(if: $body)
            bodyHTML @include(if: $bodyHTML)
            bodyText @include(if: $bodyText)
            labels(first: 5) {
              nodes {
                id
                name
                color
              }
            }
          }
        }
      }
    `,
    {
      body,
      bodyHTML,
      bodyText,
      name,
      number,
      owner,
    },
  )
}

export function queryLabels(config: Configuration): Promise<AllLabelsQuery> {
  const { client, name, owner } = check(config)
  return client.graphql(
    /* GraphQL */ `
      query AllLabels($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          labels(first: 100, orderBy: { field: NAME, direction: ASC }) {
            nodes {
              id
              name
              color
            }
          }
        }
      }
    `,
    {
      name,
      owner,
    },
  )
}

interface SearchParamsByLabelAndCategory
  extends DiscussionsSearchQueryVariables {
  category?: string
  label?: string
  // not allowed to have query
  query?: never
}

interface SearchParamsByQuery extends DiscussionsSearchQueryVariables {
  category?: never
  // not allowed to have label and category
  label?: never
}

export type SearchParams = {
  orderBy?: 'createdAt' | 'updatedAt'
} & (SearchParamsByLabelAndCategory | SearchParamsByQuery)

export async function search(
  config: Configuration,
  params: SearchParams,
): Promise<DiscussionsSearchQuery> {
  const { client, name, owner } = check(config)
  const {
    body = false,
    bodyHTML = false,
    bodyText = false,
    cursor,
    first = 100,
    orderBy,
  } = params
  let query = `repo:"${owner}/${name}"`
  if ('query' in params) {
    query += ` ${params.query}`
  } else {
    const { category, label } = params as SearchParamsByLabelAndCategory
    if (label) {
      query += ` label:"${label}"`
    }
    if (category) {
      query += ` category:"${category}"`
    }
  }
  return client
    .graphql<DiscussionsSearchQuery>(
      /* GraphQL */ `
        query DiscussionsSearch(
          $queryStr: String!
          $first: Int!
          $body: Boolean!
          $bodyHTML: Boolean!
          $bodyText: Boolean!
          $cursor: String
        ) {
          search(
            first: $first
            type: DISCUSSION
            query: $queryStr
            after: $cursor
          ) {
            nodes {
              ... on Discussion {
                author {
                  login
                  url
                  avatarUrl
                }
                number
                title
                createdAt
                updatedAt
                url
                body @include(if: $body)
                bodyHTML @include(if: $bodyHTML)
                bodyText @include(if: $bodyText)
                labels(first: 5) {
                  nodes {
                    id
                    color
                    name
                  }
                }
              }
            }
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
            totalCount: discussionCount
          }
        }
      `,
      {
        body,
        bodyHTML,
        bodyText,
        cursor,
        first,
        queryStr: query,
      },
    )
    .then((result) => {
      if (orderBy === 'createdAt') {
        result.search.nodes.sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        )
      }
      return result
    })
}
