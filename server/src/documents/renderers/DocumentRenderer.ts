export interface DocumentRenderer<T> {
  render(model: T): Promise<string>;
}
