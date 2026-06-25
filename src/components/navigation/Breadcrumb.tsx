/**
 * ARCUS Compatibility Adapter
 *
 * Re-exports the standard components from the UI directory
 * to prevent breaking legacy imports of Breadcrumb.
 */

export {
  Breadcrumb,
  type BreadcrumbProps,
  type BreadcrumbItemType as BreadcrumbItem,
} from '../ui/Breadcrumb';
