import {
  auth,
  queryByCategoryId,
  queryByCategoryName,
  queryByNumber,
  queryCategories,
  queryLabels,
  search,
  type AuthParams,
  type Configuration,
  type QueryByCategoryIdParams,
  type QueryByCategoryNameParams,
  type QueryByNumberParams,
  type SearchParams,
} from './queries'

export class Client {
  private config: Configuration = {
    client: null,
    name: null,
    owner: null,
  }
  private constructor(params: AuthParams) {
    auth(this.config, params)
  }

  public queryByCategoryId(params: QueryByCategoryIdParams) {
    return queryByCategoryId(this.config, params)
  }

  public queryByCategoryName(params: QueryByCategoryNameParams) {
    return queryByCategoryName(this.config, params)
  }

  public queryByNumber(params: QueryByNumberParams) {
    return queryByNumber(this.config, params)
  }

  public queryCategories() {
    return queryCategories(this.config)
  }

  public queryLabels() {
    return queryLabels(this.config)
  }

  public search(params: SearchParams = {}) {
    return search(this.config, params)
  }
}
