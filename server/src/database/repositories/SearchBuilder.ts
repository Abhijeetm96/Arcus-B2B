export abstract class SearchBuilder<T> {
  protected baseQuery: string = '';
  protected conditions: string[] = [];
  protected params: any[] = [];
  protected sortColumn: string = '';
  protected sortDirection: 'ASC' | 'DESC' = 'DESC';
  protected pageNum: number = 1;
  protected sizeNum: number = 25;

  public abstract build(): { query: string; params: any[] };
}
