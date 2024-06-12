import {
  auth as authWithConfig,
  queryByCategoryId as queryByCategoryIdWithConfig,
  queryByCategoryName as queryByCategoryNameWithConfig,
  queryByNumber as queryByNumberWithConfig,
  queryCategories as queryCategoriesWithConfig,
  queryLabels as queryLabelsWithConfig,
  search as searchWithConfig,
  type AuthParams,
  type Configuration,
  type QueryByCategoryIdParams,
  type QueryByCategoryNameParams,
  type QueryByNumberParams,
  type SearchParams,
} from './queries'

const config: Configuration = {
  client: null,
  name: null,
  owner: null,
}

export function auth(params: AuthParams) {
  authWithConfig(config, params)
}

export function queryByCategoryName(params: QueryByCategoryNameParams) {
  return queryByCategoryNameWithConfig(config, params)
}

export function queryByCategoryId(params: QueryByCategoryIdParams) {
  return queryByCategoryIdWithConfig(config, params)
}

export function queryCategories() {
  return queryCategoriesWithConfig(config)
}

export function queryLabels() {
  return queryLabelsWithConfig(config)
}

export function search(params: SearchParams = {}) {
  return searchWithConfig(config, params)
}

export function queryByNumber(params: QueryByNumberParams) {
  return queryByNumberWithConfig(config, params)
}
