const styles = {
  badge: (tier) => ({
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    background: tier === 'high' ? '#166534' : tier === 'medium' ? '#854d0e' : '#7f1d1d',
    color: '#FFF',
  }),
}

export default function StatusBadge({ tier }) {
  const label = tier === 'high' ? 'HIGH' : tier === 'medium' ? 'MEDIUM' : tier === 'low' ? 'LOW' : 'UNKNOWN'
  return <span style={styles.badge(tier)}>{label}</span>
}
