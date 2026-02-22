import Badge from '../common/Badge';

const CONFIDENCE_VARIANTS = { high: 'success', medium: 'warning', low: 'error' };
const GOAL_ICONS = {
  comparison:'⚖️', trend:'📈', distribution:'📊', correlation:'🔗',
  'part-of-whole':'🥧', geospatial:'🗺️', 'network-flow':'🕸️', ranking:'🏆',
};

export default function MetaBadges({ meta }) {
  if (!meta) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {meta.goal_category && (
        <Badge variant="brand">
          {GOAL_ICONS[meta.goal_category] ?? '📊'} {meta.goal_category}
        </Badge>
      )}
      {meta.confidence && (
        <Badge variant={CONFIDENCE_VARIANTS[meta.confidence] ?? 'default'}>
          Confidence: {meta.confidence}
        </Badge>
      )}
    </div>
  );
}
