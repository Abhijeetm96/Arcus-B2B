/**
 * ARCUS Compatibility Adapter
 *
 * Re-exports the standard components from the UI directory
 * to prevent breaking legacy imports of Card from 'components/shared/Card'.
 */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  MetricCard,
  type MetricCardProps,
} from '../ui/Card';
